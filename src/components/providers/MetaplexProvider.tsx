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
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { api } from "@/utils/api";
import { getSolUsdPrice } from "@/utils/rpcCalls";
import { useSession } from "next-auth/react";
import * as web3 from "@solana/web3.js";
import { selectPublicAddress } from "@/lib/slices/appSlice";
import { selectAllCandymachines } from "@/lib/slices/candyMachine";
import { useSelector } from "react-redux";
import { authProviderNames } from "@/utils/constants";
import { magic } from "@/lib/magic";
import {
  Metaplex,
  PublicKey,
  walletAdapterIdentity,
  guestIdentity,
} from "@metaplex-foundation/js";
import { type Signer } from "@solana/web3.js";
import {
  type GuardsAndEligibilityType,
  type AllGuardsType,
  type MintResponseType,
} from "@/utils/types";
import {
  type CandyMachine,
  type DefaultCandyGuardSettings,
} from "@metaplex-foundation/js";

type MintType = {
  quantityString: number;
  label: string;
  candyMachineId: string;
  refetchTheseIds?: string[];
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
  // publicAddress: null as string | null | undefined,
  // setPublicAddress: (_publicAddress: string | null) => {},
  walletBalance: null as number | null | undefined,
  solUsdPrice: null as number | null,
  getUserBalance: async (_publicAddress?: string): Promise<void> => undefined,
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

export default function MetaplexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connection } = useConnection();

  const wallet = useWallet();
  const publicAddress = useSelector(selectPublicAddress);
  const mx = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );

  useEffect(() => {
    if (publicAddress && publicAddress !== wallet.publicKey?.toBase58()) {
      mx.use(guestIdentity(new PublicKey(publicAddress)));
    }
  }, [mx, publicAddress, wallet]);

  // const candyMutation = api.candyMachine.update.useMutation();
  const updateTotalMinted = api.candyMachine.updatetotalMinted.useMutation();
  const [solUsdPrice, setSolUsdPrice] = React.useState<number | null>(null);
  const [walletBalance, setWalletBalance] = React.useState<number | null>();
  const [initalStateSet, setInitalStateSet] = React.useState(false); //using this to avoid firing off fetching candy machine before wallet has been loaded
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
      // return userBalance;
      setInitalStateSet(true);
    } catch (error) {
      console.log({ error });
    }
  }, [connection, publicAddress, session]);
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
    setInitalStateSet(true);
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
    // setGuardsAndEligibility(eligibility);
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
  // const allCms = Object.keys(candyMachines).map((key) => {
  //     const cm = candyMachines[key];
  //     return {
  //       id: key,
  //       label: cm.candyMachine?.uuid,
  //     }
  //   })
  // const allCms = useSelector(selectAllCandymachines);
  // useMemo(() => {
  //   if (Object?.keys(allCms || {}).length === 0) return; //|| !initalStateSet
  //   Object?.keys(allCms).map((key) => {
  //
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [walletBalance, allCms]);

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

  const mint = React.useCallback(
    async ({
      quantityString,
      label,
      candyMachineId,
      refetchTheseIds,
    }: MintType) => {
      if (!candyMachineId || !candyMachines)
        throw new Error("No candy machine id provided");
      const candy = candyMachines[candyMachineId];
      // console.log({ candyMachines, candy });
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
        console.log({ output, nfts, data });
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
