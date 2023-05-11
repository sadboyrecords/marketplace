/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import React, { createContext, useContext, useMemo, useCallback } from "react";
import {
  type CandyMachine,
  Metaplex,
  // mintFromCandyMachineBuilder,
  type Nft,
  type NftWithToken,
  PublicKey,
  type Sft,
  type SftWithToken,
  // TransactionBuilder,
  walletAdapterIdentity,
  type DefaultCandyGuardSettings,
  sol,
  toBigNumber,
  toDateTime,
  type IdentitySigner,
  type UpdateCandyMachineOutput,
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  // CandyMachineUpdateType,
  type GuardsAndEligibilityType,
  type AllGuardsType,
  type IMint,
  type MintResponseType,
} from "@/utils/types";
import { LAMPORTS_PER_SOL, type Signer } from "@solana/web3.js";
import { api } from "@/utils/api";
import { getSolUsdPrice } from "@/utils/rpcCalls";

type MintType = {
  quantityString: number;
  label: string;
  candyMachineId: string;
};

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

const MetaplexContext = createContext({
  metaplex: null as Metaplex | null,
  walletBalance: null as number | null | undefined,
  solUsdPrice: null as number | null,
  getUserBalance: async (): Promise<void> => undefined,
  candyMachines: {} as Record<string, CandyMachineState> | null,
  fetchCandyMachineById: async (_id: string): Promise<void> => undefined,
  mint: async (_input: MintType): Promise<MintResponseType | undefined> =>
    undefined,
  // candyMachineV3:
  //   {
  //     isLoading: false,
  //     currentSlug: undefined as string | undefined,
  //     candyMachineID: undefined as string | undefined,
  //     candyMachine: undefined as CandyMachine | undefined,
  //     items: {
  //       available: 0,
  //       remaining: 0,
  //       redeemed: 0,
  //     },
  //     guardsAndEligibility: undefined as GuardsAndEligibilityType[] | undefined,
  //     walletBalance: 0,
  //     refresh: async (): Promise<void> => undefined,
  //     handleChangeCandyMachineId: (id: string) => {},
  //   } || null,
  // updateCandyMachine: async (
  //   input: IMint
  // ): Promise<UpdateCandyMachineOutput | undefined> => undefined,
  // mint: async (input: MintType): Promise<MintResponseType | undefined> =>
  //   undefined,
  // setCandyMachineID: (id: string | undefined) => {},
  // setCurrentSlug: (id: string | undefined) => {},
  // fetchCandyMachineById: async (id: string) => undefined,
});

export function useMetaplex() {
  return useContext(MetaplexContext);
}

export function MetaplexProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();

  const wallet = useWallet();
  const mx = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );
  const candyMutation = api.candyMachine.update.useMutation();
  const updateTotalMinted = api.candyMachine.updatetotalMinted.useMutation();
  const [solUsdPrice, setSolUsdPrice] = React.useState<number | null>(null);
  const [walletBalance, setWalletBalance] = React.useState<number | null>();

  const [candyMachines, setCandyMachines] = React.useState<Record<
    string,
    CandyMachineState
  > | null>({});

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

  const getUserBalance = async () => {
    if (!wallet?.publicKey) return;
    const userBalanceLamport = await mx.connection.getBalance(
      wallet?.publicKey
    );
    const userBalance = userBalanceLamport / LAMPORTS_PER_SOL;

    setWalletBalance(Number(userBalance.toFixed(2)));
    // return userBalance;
  };

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
      //Read Data from chain
      // console.log({ mintLimitCounter });
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
        // console.error(
        //   'redeemedAmount: Too many NFTs have already been minted!'
        // );
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
        console.error("tokenBurn: Not enough SPL tokens to burn!");
        eligibility = {
          isEligible: false,
          insufficientSPLTokens: true,
        };
        inEligibleReasons.push("You do not have enough SPL tokens to burn!");
      }
    }
    if (guard.tokenPayment != null) {
      const ata = mx.tokens().pdas().associatedTokenAccount({
        mint: guard.tokenPayment.mint,
        owner: mx.identity().publicKey,
      });
      const balance = await mx.connection.getTokenAccountBalance(ata);
      if (
        Number(balance.value.amount) <
        guard.tokenPayment.amount.basisPoints.toNumber()
      ) {
        console.error("tokenPayment: Not enough SPL tokens to pay!");
        eligibility = {
          isEligible: false,
          insufficientSPLTokens: true,
        };
        inEligibleReasons.push("You do not have enough SPL tokens to pay!");
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
          console.error("freezeTokenPayment: Not enough SPL tokens to pay!");
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

      if (wallet?.connected && wallet?.publicKey) {
        const e = await checkEligibility(
          g.guards,
          cndyInput,
          wallet.publicKey,
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
    // setGuardsAndEligibility(eligibility);
    return eligibility;
  };

  const fetchCandyMachineById = async (id: string) => {
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
  };

  // const updateCandyMachine = async (input: IMint) => {
  //   // todo update back end
  //   if (!input || !candyMachine) return;

  //   try {
  //     mx.use(walletAdapterIdentity(wallet));
  //     const update = await mx.candyMachines().update({
  //       candyMachine,
  //       // candyMachine: candyMachine.address as PublicKey,
  //       candyGuard: candyMachine.candyGuard?.address as PublicKey,
  //       sellerFeeBasisPoints: input.sellerFeeBasisPoints
  //         ? input.sellerFeeBasisPoints * 100
  //         : candyMachine.sellerFeeBasisPoints,
  //       creators: input.walletSplits
  //         ? input.walletSplits.map((c) => ({
  //             address: new PublicKey(c.walletAddress),
  //             share: c.percentage,
  //           }))
  //         : candyMachine.creators,
  //       itemsAvailable: toBigNumber(input.itemsAvailable),
  //       symbol: input.symbol,
  //       groups: input.guards.map((g, i) => ({
  //         label: g.label,
  //         guards: {
  //           solPayment: g.solPayment?.amount
  //             ? {
  //                 amount: sol(g.solPayment.amount),
  //                 destination: new PublicKey(g.solPayment?.destination),
  //               }
  //             : null,
  //           startDate: {
  //             date: toDateTime(new Date(g.startDate || "")),
  //           },
  //           endDate: {
  //             date: toDateTime(new Date(g.endDate || "")),
  //           },
  //           mintLimit: g.mintLimit
  //             ? {
  //                 id: i,
  //                 limit: g.mintLimit,
  //               }
  //             : null,
  //           redeemedAmount: g.redeemAmount
  //             ? {
  //                 maximum: toBigNumber(g.redeemAmount),
  //               }
  //             : null,
  //         },
  //       })),
  //       // itemSettings
  //       // groups: input.publicDrop
  //       //   ? [
  //       //       {
  //       //         label: 'public',
  //       //         guards: {
  //       //           solPayment: {
  //       //             amount: sol(input.publicDrop.solPayment),
  //       //             destination: new PublicKey(input.treasuryAddress), //or treasury
  //       //           },
  //       //           startDate: {
  //       //             date: toDateTime(new Date(input.publicDrop.start || '')),
  //       //           },
  //       //           endDate: {
  //       //             date: toDateTime(new Date(input.publicDrop.end || '')),
  //       //           },
  //       //         },
  //       //       },
  //       //       // {
  //       //       //   label: 'early', //cant be more than 6 characters
  //       //       //   guards: {
  //       //       //     startDate: { date: toDateTime(new Date()) }, // '2021-10-01T00:00:00.000Z'
  //       //       //     redeemedAmount: { maximum: toBigNumber(5) },
  //       //       //     mintLimit: { id: 1, limit: toBigNumber(2) },
  //       //       //     solPayment: {
  //       //       //       amount: sol(0.1),
  //       //       //       destination: new PublicKey(input.treasuryAddress),
  //       //       //       // destination: wallet?.publicKey as PublicKey,
  //       //       //     },
  //       //       //     endDate: {
  //       //       //       date: toDateTime(new Date(input.publicDrop.start)),
  //       //       //     }, // '2021-10-01T00:00:00.000Z'
  //       //       //   },
  //       //       // },
  //       //     ]
  //       //   : candyMachine.candyGuard?.groups,
  //       // groups: [
  //       //   // ...candyMachine?.candyGuard?.groups,
  //       //   {
  //       //     label: 'early', //cant be more than 6 characters
  //       //     guards: {
  //       //       startDate: { date: toDateTime(new Date()) }, // '2021-10-01T00:00:00.000Z'
  //       //       redeemedAmount: { maximum: toBigNumber(10) },
  //       //       solPayment: {
  //       //         amount: sol(0.1),
  //       //         // destination: new PublicKey(treasury),
  //       //         destination: wallet?.publicKey as PublicKey,
  //       //       },
  //       //       endDate: {
  //       //         date: toDateTime(new Date('2022-12-08T00:00:00.000Z')),
  //       //       }, // '2021-10-01T00:00:00.000Z'
  //       //     },
  //       //   },
  //       //   {
  //       //     label: 'late',
  //       //     guards: {
  //       //       solPayment: {
  //       //         amount: sol(0.6),
  //       //         // destination: new PublicKey(treasury),
  //       //         destination: wallet?.publicKey as PublicKey,
  //       //       },
  //       //     },
  //       //   },
  //       // ],
  //       // guards: {
  //       //   ...candyMachine?.candyGuard?.guards,
  //       //   solPayment: {
  //       //     amount: sol(0.1),
  //       //     destination: candyMachine?.candyGuard?.guards.solPayment
  //       //       ?.destination as PublicKey,
  //       //   },
  //       //   startDate: { date: toDateTime(new Date()) },
  //       //   mintLimit: {
  //       //     id: 3,
  //       //     limit: 2,
  //       //   },
  //       // },
  //     });

  //     await fetchCandyMachine();
  //     await candyMutation.mutateAsync({
  //       candyMachineId: candyMachine.address.toBase58(),
  //       startDate: input.startDateTime,
  //       endDate: input.endDateTime,
  //       price: input.lowestPrice,
  //       items: input.itemsAvailable,
  //       creators: input.walletSplits.map((split) => {
  //         return {
  //           address: split.walletAddress,
  //         };
  //       }),
  //       userAddress: wallet?.publicKey?.toBase58() || "",
  //     });

  //     return update;
  //   } catch (error) {
  //     console.log({ error });
  //     throw new Error(error as any);
  //   }
  // };

  const mint = React.useCallback(
    async ({ quantityString, label, candyMachineId }: MintType) => {
      // if (!guardsAndEligibility[opts.groupLabel || 'default'])
      //   throw new Error('Unknown guard group label');
      if (!candyMachineId || !candyMachines)
        throw new Error("No candy machine id provided");
      const candy = candyMachines[candyMachineId];
      console.log({ candyMachines, candy });
      if (!candy || !candy.candyMachine)
        throw new Error("No candy machine found for id");
      // const
      const found = candy.guardsAndEligibility?.find((g) => g.label === label);
      console.log({ found });
      if (!found) throw new Error("Unknown guard group label");

      const nfts: (Sft | SftWithToken | Nft | NftWithToken)[] = [];
      try {
        if (!candy) throw new Error("Candy Machine not loaded yet!");

        // const transactionBuilders: TransactionBuilder[] = [];

        // for (let index = 0; index < quantityString; index++) {
        //   transactionBuilders.push(
        //     await mintFromCandyMachineBuilder(mx, {
        //       candyMachine,
        //       collectionUpdateAuthority: candyMachine.authorityAddress, // mx.candyMachines().pdas().authority({candyMachine: candyMachine.address})
        //       group: label,
        //     })
        //   );
        // }
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

        const mints = transactionBuilders.map((tb) => ({
          mintSigner: tb.getContext().mintSigner as Signer,
          mintAddress: tb.getContext().mintSigner.publicKey,
          tokenAddress: tb.getContext().tokenAddress,
        }));
        const blockhash = await mx.rpc().getLatestBlockhash();
        const signedTransactions = await wallet?.signAllTransactions?.(
          transactionBuilders.map((t, ix) => {
            const tx = t.toTransaction(blockhash);
            tx.sign(mints[ix]?.mintSigner as Signer);
            return tx;
          })
        );
        if (!signedTransactions) throw new Error("No signed transactions");

        // for (let signer in signers) {
        //   await signers[signer]?.signAllTransactions(transactions);
        // }
        // console.log({ signedTransactions, transactions, signers });
        console.log("------------SIGNERS DONE------------");

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
        console.log({ output });
        const nfts = await Promise.all(
          output.map(({ context }) => {
            console.log({ context });
            return mx
              .nfts()
              .findByMint({
                mintAddress: context?.mintSigner.publicKey,
                tokenAddress: context?.tokenAddress,
              })
              .catch((e) => null);
          })
        );

        // await fetchCandyMachine();
        const data = nfts.map((n) => ({
          address: n?.address.toBase58(),
          name: n?.name,
        }));
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
        return { nftData: data, signatures };
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
    [candyMachines, mx, updateTotalMinted, wallet]
  );

  const memoedValue = React.useMemo(() => {
    return {
      // candyMachine,
      // items,
      // guardsAndEligibility,
      walletBalance,
      solUsdPrice,
      // updateCandyMachine,
    };
  }, [
    // candyMachine,
    // items,
    // guardsAndEligibility,
    walletBalance,
    solUsdPrice,
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
        mint,
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
