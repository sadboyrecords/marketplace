/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import type {
  RpcResponseAndContext,
  Signer,
  TokenAmount,
} from "@solana/web3.js";
import type {
  CandyMachine,
  DefaultCandyGuardSettings,
} from "@metaplex-foundation/js";
import type {
  GuardsAndEligibilityType,
  AllGuardsType,
  MintResponseType,
} from "@/utils/types";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, VersionedTransaction } from "@solana/web3.js";
import { api } from "@/utils/api";
import { getSolUsdPrice } from "@/utils/rpcCalls";
import { useSession } from "next-auth/react";
import * as web3 from "@solana/web3.js";
import {
  selectPublicAddress,
  selectLookupAddress,
} from "@/lib/slices/appSlice";
import { useSelector } from "react-redux";
import { authProviderNames, solanaUsdToken } from "@/utils/constants";
import { magic } from "@/lib/magic";
import {
  Metaplex,
  PublicKey,
  walletAdapterIdentity,
  guestIdentity,
} from "@metaplex-foundation/js";
import type { CoinflowResp } from "@/utils/types";
import { coinflowFeePayer } from "@/utils/constants";

interface CandyMachineState {
  isLoading?: boolean;
  candyMachine: CandyMachine | null;
  items?: {
    available: number;
    remaining: number;
    redeemed: number;
  };
  guardsAndEligibility?: GuardsAndEligibilityType[];
}
interface UsdcInfoType {
  balance: number;
  address: string;
}

const MetaplexContext = createContext({
  metaplex: null as Metaplex | null,
  // publicAddress: null as string | null | undefined,
  // setPublicAddress: (_publicAddress: string | null) => {},
  walletBalance: null as number | null | undefined,
  usdcInfo: null as UsdcInfoType | null | undefined,
  solUsdPrice: null as number | null,
  getUserBalance: async (_publicAddress?: string): Promise<void> => undefined,
  candyMachines: {} as Record<string, CandyMachineState> | null,
  fetchCandyMachineById: async (_id: string): Promise<void> => undefined,
  createLookupTable: async (): Promise<string | undefined> => undefined, //Promise<web3.PublicKey | undefined>
  extendLookupTable: async (
    _lookupAddress: PublicKey,
    _addresses: PublicKey[]
  ): Promise<boolean | undefined> => undefined, //Promise<web3.PublicKey | undefined>
  mint: async (
    _input: MintType
  ): Promise<MintResponseType | CoinflowResp | undefined> => undefined,
  mintCoinflow: async (
    _input: MintType
  ): Promise<MintResponseType | web3.Transaction[] | undefined> => undefined,
});

export function useMetaplex() {
  return useContext(MetaplexContext);
}

export default function MetaplexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connection } = useConnection();

  // const umi = useMemo(createUmi(process.env.NEXT_PUBLIC_RPC_HOST as string)
  // .use(mplCandyMachine())
  // .use(walletAdapterIdentity(wallet)));
  async function signTransaction(
    tx: web3.Transaction
  ): Promise<web3.Transaction> {
    if (!magic) return tx;

    const serializeConfig = {
      requireAllSignatures: false,
      verifySignatures: true,
    };

    const signedTransaction = await magic.solana.signTransaction(
      tx,
      serializeConfig
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const transaction = web3.Transaction.from(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      signedTransaction?.rawTransaction
    );

    // transaction?.signatures?.forEach((s) => {
    //   console.log({ sig: s?.publicKey?.toBase58() });
    // });

    // add missing signers from original transaction to the newly created one
    const missingSigners = transaction.signatures
      .filter((s) => !s?.signature)
      .map((s) => s.publicKey);
    missingSigners.forEach((publicKey) => {
      const signature = tx?.signatures.find((s) => {
        return publicKey.equals(s.publicKey);
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (signature) transaction.addSignature(publicKey, signature?.signature);
    });

    // const updatedSignatures = transaction.signatures.filter(
    //   (s) => s?.signature
    // );
    // const updateTransaction = transaction;
    // updateTransaction.signatures = updatedSignatures;
    // .addSignatures(updatedSignatures)
    //
    // const signature = await connection.sendRawTransaction(
    //   transaction.serialize(),
    //   {}
    // );
    //
    //               .sendAndConfirmTransaction(tx, { commitment: "finalized" })

    return transaction;
    // return signedTransaction
  }

  const wallet = useWallet();
  // let magicWallet: WalletContextState | undefined;

  const publicAddress = useSelector(selectPublicAddress);
  const lookupTableAddress = useSelector(selectLookupAddress);

  const mx = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );

  useEffect(() => {
    if (publicAddress && publicAddress !== wallet.publicKey?.toBase58()) {
      mx.use(guestIdentity(new PublicKey(publicAddress)));

      // magicWallet = {};
      // umi.use(guestIdentity(new PublicKey(publicAddress)));
    }
  }, [mx, publicAddress, wallet]);

  const updateTotalMinted = api.candyMachine.updatetotalMinted.useMutation();
  const [solUsdPrice, setSolUsdPrice] = React.useState<number | null>(null);
  const [walletBalance, setWalletBalance] = React.useState<number | null>();
  const [usdcTokenInfo, setUsdcTokenInfo] = React.useState<UsdcInfoType>();
  // const [initalStateSet, setInitalStateSet] = React.useState(false); //using this to avoid firing off fetching candy machine before wallet has been loaded
  const [candyMachines, setCandyMachines] = React.useState<Record<
    string,
    CandyMachineState
  > | null>({});

  const { data: session } = useSession();

  // const [candyMachineId, setCandyMachineId] = React.useState<string>();
  // const [currentSlug, setCurrentSlug] = React.useState<string>();

  // const [guardsAndEligibility, setGuardsAndEligibility] =
  //   React.useState<GuardsAndEligibilityType[]>();
  // const [candyMachineID, setCandyMachineID] = React.useState<
  //   string | undefined
  // >();
  // const [candyMachine, setCandyMachine] = React.useState<CandyMachine>();
  // const [isLoading, setIsLoading] = React.useState(false);
  // const [items, setItems] = React.useState({
  //   available: 0,
  //   remaining: 0,
  //   redeemed: 0,
  // });

  const getUserBalance = useCallback(async () => {
    try {
      // if (!wallet?.publicKey) return;
      if (!session || !session.user.walletAddress || !publicAddress) return;
      let userBalanceLamport = 0;
      // if (!publicAddress) {
      //   userBalanceLamport = await connection.getBalance(
      //     new web3.PublicKey(session.user.walletAddress)
      //   );
      // }
      // if (publicAddress) {
      //   userBalanceLamport = await connection.getBalance(
      //     new web3.PublicKey(publicAddress)
      //   );
      // }

      userBalanceLamport = await connection.getBalance(
        new web3.PublicKey(publicAddress)
      );
      const userBalance = userBalanceLamport / LAMPORTS_PER_SOL;
      setWalletBalance(Number(userBalance.toFixed(2)));
      const pda = mx
        .tokens()
        .pdas()
        .associatedTokenAccount({
          mint: new PublicKey(solanaUsdToken),
          owner: new web3.PublicKey(session.user.walletAddress),
        });
      try {
        const tokenBalance = await connection.getTokenAccountBalance(pda);

        setUsdcTokenInfo({
          address: pda.toBase58(),
          balance: Number(tokenBalance.value.uiAmountString),
        });
        // return userBalance;
        // setInitalStateSet(true);
      } catch (error) {}
    } catch (error) {
      console.log({ error });
    }
  }, [connection, mx, publicAddress, session]);
  // const getMagic = async () => {
  //   const metadata = await magic.user.getMetadata();
  //   console.log("-----metadata----", metadata);
  // };
  useEffect(() => {
    if (publicAddress) {
      void getUserBalance();
    }
  }, [getUserBalance, publicAddress]);

  const checkEligibility = async (
    guard: DefaultCandyGuardSettings,
    candyMachine: CandyMachine,
    pubKey: PublicKey,
    label: string
  ): Promise<GuardsAndEligibilityType> => {
    const isEligible = true;
    const inEligibleReasons: string[] = [];
    let enoughSol = false;
    let nFtPaymentMsg = false;
    let eligibility: GuardsAndEligibilityType = {
      isEligible,
    };

    // const userBalance = await mx.rpc().getBalance()
    const userBalanceLamport = await mx.connection.getBalance(pubKey);
    const userBalance = userBalanceLamport / LAMPORTS_PER_SOL;

    setWalletBalance(Number(userBalance.toFixed(2)));
    // setInitalStateSet(true);
    // address gate
    if (guard.addressGate !== null) {
      if (
        mx.identity()?.publicKey?.toBase58() !==
        guard?.addressGate?.address?.toBase58()
      ) {
        eligibility = {
          ...eligibility,
          isEligible: false,
        };
        inEligibleReasons.push("Your wallet address is not allowed!");
      }
    }
    if (guard?.mintLimit !== null) {
      const mintLimitCounter = mx
        .candyMachines()
        .pdas()
        .mintLimitCounter({
          id: guard.mintLimit.id,
          user: mx.identity().publicKey,
          candyMachine: candyMachine.address,
          candyGuard: candyMachine.candyGuard?.address as PublicKey,
        });

      const mintedAmountBuffer = await mx.connection.getAccountInfo(
        mintLimitCounter,
        "processed"
      );
      let mintedAmount;
      if (mintedAmountBuffer != null) {
        mintedAmount = mintedAmountBuffer.data.readUintLE(0, 1);
      }
      if (mintedAmount != null && mintedAmount >= guard.mintLimit.limit) {
        inEligibleReasons.push(
          "Mint Limit reached! You cannot you have minted the maximum amount of NFTs for this sale!"
        );
        eligibility = {
          ...eligibility,
          isEligible: false,
          mintLimitExceeded: true,
          disableMint: true,
        };
      }
      if (!mintedAmount || mintedAmount < guard.mintLimit.limit) {
        eligibility = {
          ...eligibility,
          remainingLimit: guard.mintLimit.limit - (mintedAmount || 0),
        };
      }
    }
    if (guard.solPayment !== null) {
      setWalletBalance(userBalance);

      const costInLamports = guard.solPayment.amount.basisPoints.toNumber();
      const costInSol = costInLamports / LAMPORTS_PER_SOL;
      const maxAmount = Math.floor(userBalance / costInSol);

      if (costInLamports > userBalanceLamport) {
        eligibility = {
          ...eligibility,
          isEligible: false,
          insufficientFunds: true,
        };
        inEligibleReasons.push("You do not have enough SOL!");
        enoughSol = true;
      }
      if (maxAmount && maxAmount > 0) {
        eligibility = {
          ...eligibility,
          maxPurchaseQuantity: maxAmount,
        };
      }
    }
    if (guard.freezeSolPayment !== null) {
      const costInLamports =
        guard.freezeSolPayment.amount.basisPoints.toNumber();

      if (costInLamports > userBalanceLamport) {
        eligibility = {
          ...eligibility,
          isEligible: false,
          insufficientFunds: true,
        };
        if (!enoughSol) {
          inEligibleReasons.push("You do not have enough SOL!");
        }
      }
    }
    if (guard.nftGate != null) {
      const ownedNfts = await mx
        .nfts()
        .findAllByOwner({ owner: mx.identity().publicKey });
      const nftsInCollection = ownedNfts.filter((obj) => {
        return (
          obj.collection?.address.toBase58() ===
            guard?.nftGate?.requiredCollection.toBase58() &&
          obj.collection?.verified === true
        );
      });
      if (nftsInCollection.length < 1) {
        eligibility = {
          ...eligibility,
          isEligible: false,
          insufficientNfts: true,
        };
        inEligibleReasons.push(
          "You do not have the required NFT to mint this NFT!"
        );
        nFtPaymentMsg = true;
      }
    }
    if (guard.nftBurn != null) {
      const ownedNfts = await mx
        .nfts()
        .findAllByOwner({ owner: mx.identity().publicKey });
      const nftsInCollection = ownedNfts.filter((obj) => {
        return (
          obj.collection?.address.toBase58() ===
            guard?.nftBurn?.requiredCollection.toBase58() &&
          obj.collection?.verified === true
        );
      });
      if (nftsInCollection.length < 1) {
        console.error("nftBurn: The user has no NFT to pay with!");
        eligibility = {
          ...eligibility,
          isEligible: false,
          insufficientNfts: true,
        };
        if (!nFtPaymentMsg) {
          inEligibleReasons.push(
            "You do not have the required NFT to mint this NFT!"
          );
        }
      }
    }

    if (guard.nftPayment != null) {
      const ownedNfts = await mx
        .nfts()
        .findAllByOwner({ owner: mx.identity().publicKey });
      const nftsInCollection = ownedNfts.filter((obj) => {
        return (
          obj.collection?.address.toBase58() ===
            guard.nftPayment?.requiredCollection.toBase58() &&
          obj.collection?.verified === true
        );
      });
      if (nftsInCollection.length < 1) {
        console.error("nftPayment: The user has no NFT to pay with!");
        eligibility = {
          ...eligibility,
          isEligible: false,
          insufficientNfts: true,
        };
        if (!nFtPaymentMsg) {
          inEligibleReasons.push(
            "You do not have the required NFT to mint this NFT!"
          );
        }
      }
    }
    if (guard.redeemedAmount != null) {
      if (
        guard.redeemedAmount.maximum.toNumber() <=
        candyMachine.itemsMinted.toNumber()
      ) {
        eligibility = {
          ...eligibility,
          isEligible: false,
          redeemLimitExceeded: true,
        };
        inEligibleReasons.push(`The ${label} sale is sold out. `);
      }
    }
    if (guard.tokenBurn != null) {
      const data = mx.tokens().pdas().associatedTokenAccount({
        mint: guard.tokenBurn.mint,
        owner: mx.identity().publicKey,
      });
      const balance = await mx.connection.getTokenAccountBalance(data);
      if (
        Number(balance.value.amount) <
        guard.tokenBurn?.amount?.basisPoints?.toNumber()
      ) {
        // console.error("tokenBurn: Not enough SPL tokens to burn!");
        eligibility = {
          isEligible: false,
          insufficientSPLTokens: true,
        };
        inEligibleReasons.push("You do not have enough SPL tokens to burn!");
      }
    }
    if (guard.tokenPayment != null && session?.user?.walletAddress) {
      const ata = mx.tokens().pdas().associatedTokenAccount({
        mint: guard.tokenPayment.mint,
        owner: pubKey, // mx.identity().publicKey,
      });

      let balance: RpcResponseAndContext<TokenAmount> | null;
      try {
        balance = await mx.connection.getTokenAccountBalance(ata);
      } catch (error) {
        console.log({ error });
        balance = null;
      }

      if (
        !balance ||
        Number(balance.value.amount) <
          guard.tokenPayment.amount.basisPoints.toNumber()
      ) {
        // console.error("tokenPayment: Not enough SPL tokens to pay!");
        eligibility = {
          isEligible: false,
          insufficientSPLTokens: true,
        };
        inEligibleReasons.push(
          "You do not have enough USDC to pay with your wallet!"
        );
      }
      if (guard.freezeTokenPayment != null) {
        const ata = mx.tokens().pdas().associatedTokenAccount({
          mint: guard.freezeTokenPayment.mint,
          owner: mx.identity().publicKey,
        });
        const balance = await mx.connection.getTokenAccountBalance(ata);
        if (
          Number(balance.value.amount) <
          guard?.tokenPayment?.amount?.basisPoints?.toNumber()
        ) {
          // console.error("freezeTokenPayment: Not enough SPL tokens to pay!");
          eligibility = {
            isEligible: false,
            insufficientSPLTokens: true,
          };
          inEligibleReasons.push("You do not have enough SPL tokens to pay!");
        }
      }
    }
    return { ...eligibility, inEligibleReasons };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleGuardsSummary = async (cndyInput: CandyMachine) => {
    if (!cndyInput) return;

    const groups = cndyInput?.candyGuard?.groups;
    const guards = cndyInput?.candyGuard?.guards;

    const allGuards: AllGuardsType[] = [];
    if (guards) {
      const hasDefaultGaurd = Object.entries(guards).find(
        ([, value]) => value !== null
      );
      if (hasDefaultGaurd) {
        allGuards.push({
          label: "default",
          guards: guards,
        });
      }
    }
    if (groups) {
      groups.map((group) =>
        allGuards.push({
          label: group.label,
          guards: group.guards,
        })
      );
    }

    const currentTimestamp = new Date().getTime();
    // const currentDate = new Date();
    const data = allGuards.map(async (g) => {
      const guard = g.guards;
      const startTimestamp =
        guard?.startDate?.date &&
        new Date(guard?.startDate?.date?.toNumber() * 1000).getTime(); //guard?.startDate?.date.toNumber();
      const endTimestamp =
        guard?.endDate?.date &&
        new Date(guard?.endDate?.date?.toNumber() * 1000).getTime(); // guard?.endDate?.date.toNumber();

      let item: GuardsAndEligibilityType = {
        label: g.label,
        startTimestamp,
        endTimestamp,
        startDate:
          guard?.startDate?.date &&
          new Date(guard?.startDate?.date?.toNumber() * 1000),
        endDate:
          guard?.endDate?.date &&
          new Date(guard?.endDate?.date?.toNumber() * 1000),
        hasStarted: true,
        hasEnded: false,
        disableMint: false,
        mintLimit: guard?.mintLimit?.limit,
        redeemLimit: guard?.redeemedAmount?.maximum.toNumber(),
      };
      if (startTimestamp && currentTimestamp < startTimestamp) {
        item = {
          ...item,
          hasStarted: false,
          disableMint: true,
        };
      }
      if (endTimestamp && currentTimestamp > endTimestamp) {
        item = {
          ...item,
          hasEnded: true,
          disableMint: true,
        };
      }
      if (guard.solPayment !== null) {
        item = {
          ...item,
          payment: {
            ...item.payment,
            sol: {
              ...item?.payment?.sol,
              amount:
                guard.solPayment?.amount.basisPoints.toNumber() /
                LAMPORTS_PER_SOL,
              destination: guard.solPayment?.destination,
            },
            // nfts: {
            //   ...item?.payment?.nfts,

            // }
          },
        };
      }
      if (guard.tokenPayment !== null) {
        item = {
          ...item,
          payment: {
            ...item.payment,
            token: {
              decimals: 6,
              amount:
                guard.tokenPayment?.amount.basisPoints.toNumber() / 10 ** 6,
              // decimals: guard.tokenPayment?.,
              mint: guard.tokenPayment?.mint,
              symbol: "USDC",
              // ...item?.payment?.sol,
              // amount:
              //   guard.solPayment?.amount.basisPoints.toNumber() /
              //   LAMPORTS_PER_SOL,
              // destination: guard.solPayment?.destination,
            },
            // nfts: {
            //   ...item?.payment?.nfts,

            // }
          },
        };
      }
      // (wallet?.connected && wallet?.publicKey) ||
      if (publicAddress) {
        const e = await checkEligibility(
          g.guards,
          cndyInput,
          new web3.PublicKey(publicAddress),
          // wallet.publicKey,
          g.label
        );

        item = {
          ...item,
          ...e,
        };
      }
      // eligibility.push(item);
      return item;
    });
    const eligibility = await Promise.all(data);
    return eligibility;
  };

  const fetchCandyMachineById = useCallback(
    async (id: string) => {
      const key = new PublicKey(id);

      const solPrice = await getSolUsdPrice();

      setSolUsdPrice(solPrice);
      await mx
        ?.candyMachines()
        .findByAddress({
          address: key,
        })
        .then(async (cndy) => {
          const eligibility = await handleGuardsSummary(cndy);

          setCandyMachines((prevState) => {
            const updated = { ...prevState };
            updated[id] = {
              ...updated[id],
              candyMachine: cndy,
              items: {
                available: cndy.itemsAvailable.toNumber(),
                remaining: cndy.itemsRemaining.toNumber(),
                redeemed: cndy.itemsMinted.toNumber(),
              },
              guardsAndEligibility: eligibility,
            };

            return updated;
          });
          return cndy;
        })
        .catch((e) => console.error("Error while fetching candy machine", e));

      // await connection.logS
      // const signatures = await connection.getSignaturesForAddress(key, {
      //   limit: 1,
      // });
      // const mappedSig = signatures
      //   .filter((s) => !s.err)
      //   .map((sig) => sig.signature);
      // const parsedTransactions = await connection.getParsedTransactions(
      //   mappedSig,
      //   {
      //     maxSupportedTransactionVersion: 0,
      //   }
      // );

      // const minted = parsedTransactions.filter((t) =>
      //   t?.transaction?.message?.instructions?.find(
      //     (int) => int?.parsed?.type === "mintTo"
      //   )
      // );
      // const userAndNft = minted.map((m) => {
      //   const int = m?.transaction?.message?.instructions?.find(
      //     (int) => int?.parsed?.type === "mintTo"
      //   );
      //   return {
      //     user: int?.parsed?.info?.mintAuthority,
      //     nft: int?.parsed?.info?.mint,
      //   };
      // });
      // console.log({ signatures, parsedTransactions, minted, userAndNft });
    },
    [handleGuardsSummary, mx]
  );

  const createLookupTable = React.useCallback(async () => {
    try {
      if (!publicAddress || !wallet) return;
      const slot = await connection.getSlot();

      // Assumption:
      // `payer` is a valid `Keypair` with enough SOL to pay for the execution

      const [lookupTableInst, lookupTableAddress] =
        web3.AddressLookupTableProgram.createLookupTable({
          authority: new PublicKey(publicAddress),
          payer: new PublicKey(publicAddress),
          recentSlot: slot,
        });

      const tx = new web3.Transaction();
      tx.add(lookupTableInst);
      tx.feePayer = new PublicKey(publicAddress);
      tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const signed = await wallet.signTransaction(tx);

      await mx
        .rpc()
        .sendAndConfirmTransaction(signed, { commitment: "finalized" })
        .then((tx) => {
          console.log({ txthen: tx });
        });
      // mx
      //               .rpc()
      //               .sendAndConfirmTransaction(tx, { commitment: "finalized" })
      //               .then((tx) => {
      //                 console.log({ txthen: tx });
      //                 return {
      //                   ...tx,
      //                   context: transactionBuilders[i]?.getContext() as unknown,
      //                 };
      //               })
      return lookupTableAddress.toBase58();
    } catch (error) {
      console.log({ error });
      throw new Error("Error creating lookup table");
    }
  }, [connection, mx, publicAddress, wallet]);

  const createAndSendV0Tx = useCallback(
    async (txInstructions: web3.TransactionInstruction[]) => {
      if (!publicAddress || !wallet) return;
      // Step 1 - Fetch Latest Blockhash
      const latestBlockhash = await connection.getLatestBlockhash("finalized");
      console.log(
        "   ✅ - Fetched latest blockhash. Last valid height:",
        latestBlockhash.lastValidBlockHeight
      );

      // Step 2 - Generate Transaction Message
      console.log({ publicAddress });
      const messageV0 = new web3.TransactionMessage({
        payerKey: new PublicKey(publicAddress),
        recentBlockhash: latestBlockhash.blockhash,
        instructions: txInstructions,
      }).compileToV0Message();

      console.log({ publicAddress });

      const transaction = new VersionedTransaction(messageV0);

      // Step 3 - Sign your transaction with the required `Signers`
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const signed = await wallet?.signTransaction(transaction);

      // Step 4 - Send our v0 transaction to the cluster
      // await mx
      //     .rpc()
      //     .sendTransaction(signed, { commitment: "finalized" })
      //     .then((tx) => {
      //       console.log({ txthen: tx });
      //     });
      const txid = await connection.sendTransaction(signed, {
        maxRetries: 5,
      });

      // Step 5 - Confirm Transaction
      const confirmation = await connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      if (confirmation.value.err) {
        throw new Error("   ❌ - Transaction not confirmed.");
      }
      console.log(
        "🎉 Transaction succesfully confirmed!",
        "\n",
        `https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    },
    [connection, publicAddress, wallet]
  );

  const extendLookupTable = React.useCallback(
    async (lookupTable: PublicKey, addresses: PublicKey[]) => {
      try {
        if (!publicAddress || !wallet) return;
        console.log({ wallet });
        console.log({ lookupTable, addresses });
        const lookupTableAccount = await connection
          .getAddressLookupTable(lookupTable)
          .then((res) => res.value);

        const existingAddresses = lookupTableAccount?.state.addresses?.map(
          (e) => e?.toBase58()
        );
        const newAddresses = addresses.filter(
          (e) => !existingAddresses?.includes(e?.toBase58())
        );
        if (!newAddresses.length || newAddresses.length === 0) {
          throw new Error("No new addresses to add");
        }
        const extendInstruction =
          web3.AddressLookupTableProgram.extendLookupTable({
            payer: new PublicKey(publicAddress),
            authority: new PublicKey(publicAddress),
            // lookupTable: new PublicKey(
            //   "2daR6Grs1LcKYr2rYETFzDeUfdsUyjeuosaiW6bTv7n7"
            //   // "Dwa9yxnzYW1nAJoVN4BEAc65d6X1YJSc54ra9QChbG7t"
            // ),
            lookupTable,
            addresses: newAddresses,
            // addresses: [
            //   // KEYS FOR FEE PAYER
            //   // new PublicKey("K2T7FyGh2drq5FtZtxNt9CWxoUjGxqCQXPC5M7VEf3n"), // this is tx fee payer
            //   // new PublicKey("75N3e5H9o8VswtNcAnWr9gHN1HCE1yAWdiaEHEesXssd"), // coinflow wallet
            //   new PublicKey("2Dd4tLC5NmacAZiUyFFgABz67dd3sXz1BYdsAgXq4nVb"),
            //   new PublicKey("HxaWVXo7SuTxqWm75exXc5zC2vKwjCScgnC2AqmtXgPB"),
            //   new PublicKey("CTyszyCDYuP16rG1iFBdmRAD4SPzB85UHyWgPZX5whJk"),
            //   new PublicKey("3Z4qfZVwjbh5c2wer7tqkJyb9u97KCo57864Y7Pi2Dfx"),
            //   new PublicKey("5dSW5mkSPpELUhzuk8YsCf9zNPzq3HxqdjgQjXPPy9Mg"),
            //   new PublicKey("EyrHktmeBiDxcHq67cXUnQHj2BL8VXG4UBae1TeQy9sr"),
            //   new PublicKey("E2grteDrihnAa3UgdmjP2h8jaY5niUi7kFbF35j3MXgj"),

            //   // new PublicKey("26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h"),
            //   // new PublicKey("J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6"),
            //   // new PublicKey("2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu"),
            //   // new PublicKey("4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs"),
            //   // new PublicKey("G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS"),
            //   // new PublicKey("GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78"),
            //   // new PublicKey("5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV"),
            //   // new PublicKey("2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec"),
            //   // new PublicKey("3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh"),
            //   // new PublicKey("11111111111111111111111111111111"),
            //   // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
            //   // new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
            //   // new PublicKey("Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g"),
            //   // new PublicKey("5KMJJsx9RK2G7sCmtVTwUVzjAL1bx7yEzGDSHs6aQrKr"),
            //   // new PublicKey("BkXwtL4fgFc1BxaYwJ6iDYa3oNXBD6JcqTqz9dfpr7FU"),
            //   // new PublicKey("vevzhVDVsbnuunHzTZTXNNzfzc2Pf89TaDjtSSpbgPG"),
            //   // new PublicKey("2cVkpryQUN35Giwg1nHpGFbi3Gw4A7nYaR5c5pEeP6gx"),
            //   // new PublicKey("2V9b4tAG6VWqjLsciyjQWaWWvHgu7wGpNnjYzpSCV3EM"),
            //   // new PublicKey("H41nrjKg7PPbyhy3BjKr7px64Kwnd11oSMRWPxw87irg"),
            //   // new PublicKey("AX9Xk5UkN3k4ayKdsajec9esztuBpgj7qzQxSoHYkpEK"),
            //   // new PublicKey("3br7VsdU37pANBsyQs1THULFkTAfZWsQvkqVfWyvA59H"),
            //   // new PublicKey("A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf"),
            //   // new PublicKey("CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR"),
            //   // new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
            //   // new PublicKey("Sysvar1nstructions1111111111111111111111111"),
            //   // new PublicKey("SysvarRent111111111111111111111111111111111"),
            //   // new PublicKey("SysvarS1otHashes111111111111111111111111111"),
            //   // new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
            //   // new PublicKey("HzdseyCGneNv4SzyBgteppi1N8GawjWLSkBSTx82UTtL"),
            //   // new PublicKey("SysvarC1ock11111111111111111111111111111111"),
            //   // new PublicKey("FD1amxhTsDpwzoVX41dxp2ygAESURV2zdUACzxM1Dfw9"),
            //   // new PublicKey("5ppVfhB9weJe9oBWEY97DArrbXmzzZ2fSkz28F92uQ7U"),
            //   // new PublicKey("8WQHB9umX9wLUsa6Reia9E96EiSaGWbYEiHzAqgDN4dM"),

            // ],
          });

        await createAndSendV0Tx([extendInstruction]);

        return true;
      } catch (error) {
        console.log({ error });

        throw new Error(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (error?.message as string) || null || "Error extending lookup table"
        );
      }
    },
    [connection, createAndSendV0Tx, publicAddress, wallet]
  );

  const mint = React.useCallback(
    async ({
      quantityString,
      label,
      candyMachineId,
      refetchTheseIds,
      onlySign,
    }: MintType) => {
      if (!candyMachineId || !candyMachines)
        throw new Error("No candy machine id provided");
      const candy = candyMachines[candyMachineId];

      if (!candy || !candy.candyMachine)
        throw new Error("No candy machine found for id");

      const found = candy.guardsAndEligibility?.find((g) => g.label === label);

      if (!found) throw new Error("Unknown guard group label");

      try {
        if (!candy) throw new Error("Candy Machine not loaded yet!");
        const transactionBuilders = await Promise.all(
          new Array(quantityString).fill(0).map(() =>
            mx
              .candyMachines()
              .builders()
              .mint({
                candyMachine: candy.candyMachine as CandyMachine,
                collectionUpdateAuthority: candy?.candyMachine
                  ?.authorityAddress as PublicKey,
                group: label,

                // guards: {
                //   nftBurn: toGuardMintSettings(guardMintInfo.nftBurn),
                //   nftGate: toGuardMintSettings(guardMintInfo.nftGate),
                //   nftPayment: toGuardMintSettings(guardMintInfo.nftPayment),
                // },
              })
          )
        );

        const mints = transactionBuilders.map((tb) => {
          return {
            mintSigner: tb.getContext().mintSigner as Signer,
            mintAddress: tb.getContext().mintSigner.publicKey,
            tokenAddress: tb.getContext().tokenAddress,
          };
        });

        const blockhash = await connection.getLatestBlockhash();
        let signedTransactions: web3.Transaction[] | undefined = [];
        // if (onlySign) return signedTransactions;
        if (onlySign) {
          if (!lookupTableAddress)
            throw new Error("Cannot buy at this time. Please try again later");
          const txBuilder = transactionBuilders[0];
          const coinFlowPayer = new PublicKey(coinflowFeePayer);
          const signer = txBuilder?.getContext().mintSigner as Signer;
          const userWallet =
            wallet?.publicKey || new web3.PublicKey(publicAddress || "");

          // txBuilder?.setFeePayer(keyPair);
          const intSigner = txBuilder?.getInstructionsWithSigners();
          const instructions = txBuilder?.getInstructions();

          if (!instructions) throw new Error("No instructions");

          const modifiedInstructions = intSigner?.map((int) => {
            if (int.key === "createMintAccount") {
              const keys: web3.AccountMeta[] = [];
              int.instruction.keys.forEach((k) => {
                if (
                  k.pubkey.toBase58() === userWallet?.toBase58() &&
                  k.isSigner
                ) {
                  keys.push({
                    pubkey: coinFlowPayer, //keyPair.publicKey,
                    isSigner: k.isSigner,
                    isWritable: k.isWritable,
                  });
                } else {
                  keys.push(k);
                }
              });
              return {
                ...int.instruction,
                keys,
              };
            }
            if (int.key === "createAssociatedTokenAccount") {
              const keys: web3.AccountMeta[] = [];
              int.instruction.keys.forEach((k) => {
                if (
                  k.pubkey.toBase58() === userWallet.toBase58() &&
                  k.isSigner
                ) {
                  keys.push({
                    pubkey: coinFlowPayer, //keyPair.publicKey,
                    isSigner: k.isSigner,
                    isWritable: k.isWritable,
                  });
                } else {
                  keys.push(k);
                }
              });
              return {
                ...int.instruction,
                keys,
              };
            }
            if (int.key === "mintNft") {
              const keys: web3.AccountMeta[] = [];
              int.instruction.keys.forEach((k) => {
                let count = 0;
                if (
                  k.pubkey.toBase58() === userWallet?.toBase58() &&
                  k.isSigner
                ) {
                  // keys.push({
                  //   pubkey: keyPair.publicKey,
                  //   isSigner: k.isSigner,
                  //   isWritable: k.isWritable,
                  // });
                  if (count === 0) {
                    keys.push(k);
                    count++;
                  } else {
                    keys.push({
                      pubkey: coinFlowPayer, //keyPair.publicKey,
                      isSigner: k.isSigner,
                      isWritable: k.isWritable,
                    });
                  }
                } else {
                  keys.push(k);
                }
              });
              return {
                ...int.instruction,
                keys,
              };
            }
            return int.instruction;
          });
          const addInt = web3.SystemProgram.transfer({
            fromPubkey: coinFlowPayer,
            toPubkey: userWallet,
            lamports: 0.01847032 * 1e9,
            // 01845
            // 0.01847032
          });
          if (!modifiedInstructions)
            throw new Error("No modified instructions");
          const allInstructions = [addInt, ...modifiedInstructions];

          const lookupTableAccount = await connection
            .getAddressLookupTable(
              new PublicKey(
                lookupTableAddress
                // "Dwa9yxnzYW1nAJoVN4BEAc65d6X1YJSc54ra9QChbG7t"
                // "2daR6Grs1LcKYr2rYETFzDeUfdsUyjeuosaiW6bTv7n7"
              )
            )
            .then((res) => res.value);

          if (!lookupTableAccount) throw new Error("No lookup table account");

          const messageV0 = new web3.TransactionMessage({
            payerKey: coinFlowPayer,
            // payerKey: new PublicKey(
            //   "75N3e5H9o8VswtNcAnWr9gHN1HCE1yAWdiaEHEesXssd"
            // ), // wallet.publicKey as PublicKey, //payer.publicKey,
            recentBlockhash: blockhash.blockhash,
            instructions: allInstructions,
          }).compileToV0Message([lookupTableAccount]);

          const vtx = new web3.VersionedTransaction(messageV0);
          // if (magic && session?.user?.provider === authProviderNames.magic) {
          //   const serilize = messageV0.serialize();

          //   const signed: Uint8Array = await magic.solana.signMessage(serilize);
          //   // magic.wallet.getProvider()
          //   // magic.solana.solanaConfig
          //   console.log("----SIGNED SERIALIZED----", { signed });

          //   vtx.addSignature(userWallet, signed);
          // }

          // signed.sign([signer]);

          // console.log({ vtx: vtx.signatures[0]. });
          // const allkey = [];
          // const keys = instructions.map((i) => {
          //   const keys = i.keys.map((k) => k.pubkey.toBase58());
          //   allkey.push(...keys, i.programId.toBase58());
          //   return keys;
          // });
          // console.log({ keys, allkey });
          // vtx.sign([signer]);
          // const signed = await wallet.signTransaction(vtx);

          // console.log({ vtx, signed });

          // const txid = await connection.sendTransaction(signed, {
          //   maxRetries: 5,
          // });
          // console.log("   ✅ - Transaction sent to network");

          // // Step 5 - Confirm Transaction
          // const confirmation = await connection.confirmTransaction({
          //   signature: txid,
          //   blockhash: blockhash.blockhash,
          //   lastValidBlockHeight: blockhash.lastValidBlockHeight,
          // });
          // if (confirmation.value.err) {
          //   throw new Error("   ❌ - Transaction not confirmed.");
          // }
          // console.log(
          //   "🎉 Transaction succesfully confirmed!",
          //   "\n",
          //   `https://explorer.solana.com/tx/${txid}?cluster=devnet`
          // );
          // vtx
          const tokenAddress = txBuilder?.getContext().tokenAddress;
          const mintSigner = txBuilder?.getContext().mintSigner.publicKey;
          const candymachineIds = [candyMachineId];
          if (refetchTheseIds) {
            candymachineIds.push(...refetchTheseIds);
          }
          if (!candy.guardsAndEligibility?.[0]?.payment?.token?.amount) {
            throw new Error("No payment amount");
          }
          return {
            tx: vtx,
            signers: [signer],
            amount: candy.guardsAndEligibility?.[0]?.payment?.token?.amount,
            tokenAddress,
            mintSigner,
            blockhash,
            candymachineIds,
          };

          // if (versiontx) {
          //   console.log({ versiontx: versiontx[0] });
          //   return versiontx;
          // }
          // if (!versiontx) return null;
        }

        if (magic && session?.user?.provider === authProviderNames.magic) {
          const payer = new web3.PublicKey(publicAddress || "");

          const tx = transactionBuilders.map((t, ix) => {
            const tx = t.toTransaction(blockhash);
            tx.feePayer = payer;
            console.log({ tx });
            tx.sign(mints[ix]?.mintSigner as Signer);
            // debugger;
            tx.signatures.forEach((s) =>
              console.log({ sigPkey: s.publicKey.toBase58() })
            );
            return tx;
          });
          signedTransactions = await Promise.all(
            tx.map(async (t) => {
              console.log({ t });
              return await signTransaction(t);
            })
          );
        } else {
          signedTransactions = await wallet?.signAllTransactions?.(
            transactionBuilders.map((t, ix) => {
              const tx = t.toTransaction(blockhash);
              console.log({ tx });
              tx.sign(mints[ix]?.mintSigner as Signer);
              tx.signatures.forEach((s) =>
                console.log({ sigPkey: s.publicKey.toBase58() })
              );
              console.log({ tx, mintSigner: mints[ix]?.mintSigner });
              return tx;
            })
          );
          console.log({ signedTransactions });
        }

        if (!signedTransactions) throw new Error("No signed transactions");

        // for (let signer in signers) {
        //   await signers[signer]?.signAllTransactions(transactions);
        // }
        // console.log({ signedTransactions, transactions, signers });
        // console.log("------------SIGNERS DONE------------");

        const output = await Promise.all(
          signedTransactions.map((tx, i) => {
            console.log({ tx });
            return mx
              .rpc()
              .sendAndConfirmTransaction(tx, { commitment: "finalized" })
              .then((tx) => {
                console.log({ txthen: tx });
                return {
                  ...tx,
                  context: transactionBuilders[i]?.getContext() as unknown,
                };
              })
              .catch(() => {
                throw new Error("Error Sending Transaction");
              });
          })
        );

        const nfts = await Promise.all(
          output.map(({ context }) => {
            // console.log({ context });
            // context: {
            //   tokenAddress: PublicKey | undefined;
            //   mintSigner: {
            //     publicKey: PublicKey;
            //   };
            // }
            const c = context as {
              tokenAddress: PublicKey | undefined;
              mintSigner: {
                publicKey: PublicKey;
              };
            };
            console.log({ c });
            return mx
              .nfts()
              .findByMint({
                mintAddress: c?.mintSigner?.publicKey,
                tokenAddress: c?.tokenAddress,
              })
              .catch(() => null);
          })
        );

        // await fetchCandyMachine();
        const data = nfts.map((n) => ({
          address: n?.address.toBase58(),
          name: n?.name,
        }));
        // console.log({ output, nfts, data });
        const signatures = output.map((o) => o.signature);
        try {
          await updateTotalMinted.mutateAsync({
            candyMachineId: candy.candyMachine.address.toBase58(),
            totalMinted: quantityString,
          });
        } catch (error) {
          console.log({ error });
        }
        await fetchCandyMachineById(candy.candyMachine.address.toBase58());
        if (refetchTheseIds) {
          await Promise.all(
            refetchTheseIds.map((id) => fetchCandyMachineById(id))
          );
        }
        return { nftData: data, signatures };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log({ error });
        let message = "Minting failed! Please try again!";
        if (!error?.msg) {
          if (!error.message) {
            message = "Transaction Timeout! Please try again.";
          } else if (error.message.indexOf("0x138")) {
          } else if (error.message.indexOf("0x137")) {
            message = `SOLD OUT!`;
          } else if (error.message.indexOf("0x135")) {
            message = `Insufficient funds to mint. Please fund your wallet.`;
          }
        } else {
          if (error.code === 311) {
            message = `SOLD OUT!`;
          } else if (error.code === 312) {
            message = `Minting period hasn't started yet.`;
          }
        }
        console.error(error);
        console.log("THROWING ERROR ", error);
        // setStatus((x) => ({ ...x, minting: false }));
        throw new Error(message);
      }
      // finally {
      //   setStatus((x) => ({ ...x, minting: false }));
      //   refresh();
      //   return nfts.filter((a) => a);
      // }
    },
    // candyMachines, guardsAndEligibility, mx, wallet?.publicKey
    // fetchCandyMachineById
    [
      candyMachines,
      connection,
      fetchCandyMachineById,
      mx,
      publicAddress,
      session?.user?.provider,
      updateTotalMinted,
      wallet,
      lookupTableAddress,
    ]
    //  [candyMachines, mx, updateTotalMinted, wallet]
  );

  const memoedValue = React.useMemo(() => {
    return {
      // candyMachine,
      // items,
      // guardsAndEligibility,
      walletBalance,
      solUsdPrice,
      usdcInfo: usdcTokenInfo,
      // publicAddress
      // updateCandyMachine,
    };
  }, [
    // candyMachine,
    // items,
    // guardsAndEligibility,
    // publicAddress,
    walletBalance,
    solUsdPrice,
    usdcTokenInfo,
  ]);
  // console.log({ providerCM: candyMachine, providerGE: guardsAndEligibility });

  return (
    <MetaplexContext.Provider
      value={{
        metaplex: mx,
        fetchCandyMachineById,
        getUserBalance,
        ...memoedValue,
        candyMachines,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mint,
        createLookupTable,
        extendLookupTable,
        // setPublicAddress,
        // candyMachineV3: {
        //   ...memoedValue,
        // },
        // updateCandyMachine,
        // mint,
        // setCandyMachineID,
        // setCurrentSlug,

        // wallet,
        // getTokensByOwner,
      }}
    >
      {children}
    </MetaplexContext.Provider>
  );
}

// const useMetaplex = () => useContext(MetaplexContext);

// export { MetaplexContext, MetaplexProvider, useMetaplex };
