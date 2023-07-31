import {
  type DefaultCandyGuardMintSettings,
  type Metadata,
  type MintLimitGuardSettings,
  type NftBurnGuardMintSettings,
  type NftGateGuardMintSettings,
  type NftPaymentGuardMintSettings,
  type Pda,
  type DefaultCandyGuardSettings,
} from "@metaplex-foundation/js";
import {
  type BlockhashWithExpiryBlockHeight,
  type AccountInfo,
  type PublicKey,
} from "@solana/web3.js";
// import { type MintCounterBorsh } from "@/components/borsh/mintCounter";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { type Session } from "next-auth";
import { type NextPage } from "next";
import { type ReactElement, type ReactNode } from "react";
import type * as web3 from "@solana/web3.js";

export interface CoinflowResp {
  tx: web3.Transaction | web3.VersionedTransaction;
  signers: web3.Signer[];
  amount: number;
  tokenAddress: PublicKey;
  mintSigner: PublicKey;
  candymachineIds: string[];
  blockhash: BlockhashWithExpiryBlockHeight;
}

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface AppSession extends Session {
  walletAddress?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  user: {
    id: string;
    walletAddress?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    // ...other properties
    // role: UserRole;
  } & Session["user"];
}
type RouterOutput = inferRouterOutputs<AppRouter>;

export type TransactionRecordType =
  RouterOutput["transaction"]["getCandyTransactions"][number];
export type CanPlayType = RouterOutput["songs"]["checkCanPlay"];
export type PartialSongType = {
  id: string;
  lossyAudioURL: string;
  lossyAudioIPFSHash?: string;
  lossyArtworkURL?: string;
  lossyArtworkIPFSHash?: string;
  pinnedImage?: {
    path: string;
    status: string;
    width: number;
    height: number;
  };
  candyMachines?: { candyMachineId?: string; slug?: string }[];
  tokens?: { mintAddress?: string }[];
  title: string;
  creators: {
    walletAddress: string;
    name?: string;
    firstName?: string;
  }[];
};
export type CandyMachinesByOwnerType =
  RouterOutput["candyMachine"]["getByOwner"];
export type SongType = RouterOutput["songs"]["getSongInfo"] | PartialSongType;
export type SongDetailType = RouterOutput["songs"]["getSongDetails"];
export type BattleType = RouterOutput["battle"]["getBattleById"];
export type BattleTypeSummary = RouterOutput["battle"]["getBattleByIdSummary"];
export type PlaylistType = RouterOutput["playlist"]["getFeatured"];
export type ArtistType = RouterOutput["artist"]["getArtistBySlug"];

export type ITrack = SongDetailType;

export type MintResponseType = {
  signatures: string[];
  nftData: {
    address: string | undefined;
    name: string | undefined;
  }[];
};

export type Token = {
  mint: PublicKey;
  balance: number;
  decimals: number;
};
export type TokenPayment$Gate = {
  mint: PublicKey;
  amount: number;
  symbol?: string;
  decimals: number;
};

// export type SolPayment = {
//   type: "sol";
//   amount: number;
//   decimals: number;
// };

// export type TokenPayment = {
//   type: "token";
//   mint: PublicKey;
//   amount: number;
//   symbol?: string;
//   decimals: number;
// };

// export type NftPayment = {
//   type: "nft";
//   nfts: Metadata[];
// };

// export type PaymentGuard = {
//   criteria: "pay" | "have";
// } & (SolPayment | TokenPayment | NftPayment);

export type GuardGroup = {
  // address: PublicKey;
  startTime?: Date;
  endTime?: Date;
  payment?: {
    sol?: {
      amount: number;
      decimals: number;
      parsedAmount?: number;
      destination?: PublicKey;
    };
    token?: TokenPayment$Gate;
    nfts?: Metadata[];
    requiredCollection?: PublicKey;
  };
  burn?: {
    token?: TokenPayment$Gate;
    nfts?: Metadata[];
    requiredCollection?: PublicKey;
  };
  gate?: {
    token?: TokenPayment$Gate;
    nfts?: Metadata[];
    requiredCollection?: PublicKey;
  };
  // payments?: PaymentGuard[];
  mintLimit?: MintLimitLogics;
  redeemLimit?: number;
  allowed?: PublicKey[];
  allowList?: Uint8Array;
  gatekeeperNetwork?: PublicKey;
};

export type MintLimitLogics = {
  settings: MintLimitGuardSettings;
  pda?: Pda;
  accountInfo?: AccountInfo<Buffer>;
  // mintCounter?: MintCounterBorsh; //MintCounter;
};

export type AllGuardsType = {
  label: string;
  guards: DefaultCandyGuardSettings;
};

export type GuardsAndEligibilityType = {
  // address: PublicKey;
  label?: string;
  startDate?: Date;
  endDate?: Date;
  startTimestamp?: number;
  endTimestamp?: number;
  hasStarted?: boolean;
  hasEnded?: boolean;
  disableMint?: boolean;
  payment?: {
    sol?: {
      amount: number;
      decimals?: number;
      parsedAmount?: number;
      destination?: PublicKey;
    };
    token?: TokenPayment$Gate;
    nfts?: Metadata[];
    requiredCollection?: PublicKey;
  };
  mintLimitExceeded?: boolean;
  redeemLimitExceeded?: boolean;
  redeemLimit?: number; // total amount that can be minted across all users
  mintLimit?: number; // total amount that can be minted by a single user
  remainingLimit?: number; // total amount that is left to be minted by a single user (assuming they have purchased other nfts)
  isEligible?: boolean;
  maxPurchaseQuantity?: number;
  insufficientFunds?: boolean;
  insufficientSPLTokens?: boolean;
  inEligibleReasons?: string[];
  insufficientNfts?: boolean; // if the user doesn't have enough nfts to pay or burn
  // burn?: {
  //   token?: TokenPayment$Gate;
  //   nfts?: Metadata[];
  //   requiredCollection?: PublicKey;
  // };
  // gate?: {
  //   token?: TokenPayment$Gate;
  //   nfts?: Metadata[];
  //   requiredCollection?: PublicKey;
  // };
  // payments?: PaymentGuard[];
  // mintLimit?: MintLimitLogics;

  // allowed?: PublicKey[];
  // allowList?: Uint8Array;
  // gatekeeperNetwork?: PublicKey;
};

export type GuardGroupStates = {
  isStarted: boolean;
  isEnded: boolean;
  canPayFor: number;
  messages: string[];
  isLimitReached: boolean;
  isWalletWhitelisted: boolean;
  hasGatekeeper: boolean;
  startDate?: Date;
  endDate?: Date;
  guards?: GuardGroup;
  label?: string;
  pricing?: ParsedPricesForUI;
};

export type PaymentRequired = {
  label: string;
  price: number;
  mint?: PublicKey;
  decimals?: number;
  kind: string;
};
export type ParsedPricesForUI = {
  payment: PaymentRequired[];
  burn: PaymentRequired[];
  gate: PaymentRequired[];
};

export declare type CustomCandyGuardMintSettings = Partial<
  DefaultCandyGuardMintSettings & {
    allowList: {
      proof: Uint8Array[];
    };
  }
>;

export type AllowLists = {
  groupLabel?: string;
  list: (string | Uint8Array)[];
}[];

export type NftPaymentMintSettings = {
  payment?: NftPaymentGuardMintSettings;
  gate?: NftGateGuardMintSettings;
  burn?: NftBurnGuardMintSettings;
};

export type CandyMachineUpdateType = {
  treasuryAddress: string;
  publicDrop?: {
    start: Date;
    end: Date;
    solPayment: number;
  };
  itemsAvailable?: number;
  sellerFeeBasisPoints?: number;
  walletSplits?: IWalletSplits[];
};

// export type ITrack = {
//   id: string;
//   createdAtTime: Date | null;
//   createdAtEthereumBlockNumber: bigint | null;
//   title: string | null;
//   slug: string | null;
//   platformInternalId: string | null;
//   lossyAudioIPFSHash: string | null;
//   lossyAudioURL: string | null;
//   description: string | null;
//   lossyArtworkIPFSHash: string | null;
//   lossyArtworkURL: string | null;
//   websiteUrl: string | null;
//   platformId: string | null;
//   artistId: string | null;

//   // likes?: Prisma.LikedTracksGroupByOutputType[];
//   // rawArtists: Prisma.RawArtistsGroupByOutputType;
//   // _count: Prisma.RawProcessedTracksCountAggregateOutputType | null;
//   // _avg: Prisma.RawProcessedTracksAvgAggregateOutputType | null;
//   // _sum: Prisma.RawProcessedTracksSumAggregateOutputType | null;
//   // _min: Prisma.RawProcessedTracksMinAggregateOutputType | null;
//   // _max: Prisma.RawProcessedTracksMaxAggregateOutputType | null;
// };

export interface IPlaylistItem {
  // track: Prisma.RawProcessedTracksGroupByOutputType; // ITrack;
  track: SongType;
  currentTrack: SongType | null;
  active?: boolean;
  onClick?: () => void;
}

// export interface Track {

// }

export interface IIconButton {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  className?: string | undefined;
  variant?: "solid" | "outline" | "ghost";
  color?: "primary" | "secondary" | "base";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  padding?: "none" | "xs" | "sm";
  disabled?: boolean;
  tooltip?: string;
  loading?: boolean;
}

export type IWalletSplits = {
  percentage: number | undefined;
  walletAddress: string;
  // [key: string]: any;
};

export type IRole =
  | "PRODUCER"
  | "SONGWRITER"
  | "PRIMARY_ARTIST"
  | "FEATURED_ARTIST"
  | "LABEL"
  | "MANAGER"
  | "PUBLISHER"
  | "DISTRIBUTOR"
  | "COLLECTIVE"
  | "OTHER"
  | string;

export type INameAddress = {
  name: string;
  walletAddress?: string;
};

export type IFullCredits = {
  names: INameAddress[];
  role: string;
};

export type IUserCredits = {
  name: string;
  walletAddress?: string;
  role: IRole[];
};

export type GuardFormType = {
  startDate?: Date;
  endDate?: Date;
  label: string;
  solPayment?: { amount: number; destination: string };
  tokenPayment?: {
    amount: number;
    destination: string;
    splTokenAddress: string; // token address we want to pay with like usdc
  };
  redeemAmount?: number;
  mintLimit?: number;
};

export interface IMint {
  endDateTime?: Date;
  startDateTime?: Date;
  goLiveImmediately?: "YES" | "NO";
  price: number;
  collectionName: string;
  description: string;
  royalties: number;
  itemsAvailable: number;
  trackTitle: string;
  genre?: string;
  isrc?: string;
  upc?: string;
  symbol: string;
  sellerFeeBasisPoints: number;
  walletSplits: IWalletSplits[];
  credits: IUserCredits[];
  primaryArtists: string[];
  featuredArtists?: string[];
  producers?: IUserCredits[];
  engineers?: IUserCredits[];
  publishers?: IUserCredits[];
  songwriters?: IUserCredits[];
  labels?: IUserCredits[];
  pline?: string;
  cline?: string;
  imageUri: string;
  imageHash?: string;
  audioUri: string;
  audioHash?: string;
  treasuryAddress: string;
  guards: GuardFormType[];
  candyMachineId?: string;
  lowestPrice?: number;
  songId?: string;
  // [key: string]: unknown;
  // creators and wallet address
  // role - artist, producer, engineer, visual artist, other
  // credits
}

export interface IMetaplexMetadata {
  name: string;
  symbol: string;
  sellerFeeBasisPoints: number;
  creators: {
    address: string;
    share: number;
  }[];
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
  properties?: {
    files: {
      uri: string;
      type: string;
    }[];
    category: string;
    creators: {
      address: string;
      share: number;
    }[];
  };
}

export interface IMetaplexMetadataFile {
  name: string;
  description: string;
  symbol?: string;
  image: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
  properties?: {
    files: {
      uri: string;
      type: string;
    }[];
    category: string;
  };
}

const sampleMetaData = {
  name: "My Awaken Collection",
  description: "Testing this description ",
  symbol: "MY",
  image: "https://ipfs.io/ipfs/QmeiWrR7iT1foNVezgnU4dhZCNKm8QpvHQUbWU6HTWTMZ3",
  attributes: {
    trait_type: "Exchange",
    vales: "NiftyTunes",
  },
  properties: {
    files: [
      {
        uri: "https://ipfs.io/ipfs/QmeiWrR7iT1foNVezgnU4dhZCNKm8QpvHQUbWU6HTWTMZ3",
        type: "image/png",
      },
      {
        uri: "https://ipfs.io/ipfs/QmUhBbhqybAtuiURfqUYvVXP5bpznUiu2WQ62GFLQ1EMin",
        type: "audio/mp3",
      },
    ],
    category: "audio",
  },
  credits: [
    {
      name: "Awaken one ",
      role: ["PRIMARY_ARTIST", "FEATURED_ARTIST"],
      walletAddress: "",
    },
    {
      name: "Johnn ",
      role: ["PRIMARY_ARTIST"],
      walletAddress: "",
    },
  ],
  pline: "P LIne",
  cline: "C LINE",
  songTitle: "Awaken",
};

export type IMetadata = typeof sampleMetaData;

// const initialMetadata = {
//   name: "",
//   description: "",
//   symbol: "",
//   image: "",
//   version: "1",
//   title: "",
//   artist: "",
//   duration: 0,
//   mimeType: "",
//   losslessAudio: "",
//   trackNumber: 0,
//   genre: "",
//   tags: [],
//   bpm: 0,
//   key: "",
//   license: "",
//   locationCreated: "",
//   external_url: "",
//   animation_url: "",
//   project: {
//     title: "",
//     artwork: {
//       uri: "",
//       mimeType: "",
//       nft: "",
//     },
//     description: "",
//     type: "Single",
//     originalReleaseDate: "",
//     recordLabel: "",
//     publisher: "",
//     upc: "",
//   },
//   isrc: "",
//   properties: {
//     files: [] as unknown,
//     category: "audio",
//   },
//   artwork: {
//     uri: "",
//     mimeType: "",
//     nft: "",
//   },
//   lyrics: {
//     text: "",
//     nft: "",
//   },
//   visualizer: {
//     uri: "",
//     mimeType: "",
//     nft: "",
//   },
//   originalReleaseDate: "",
//   recordLabel: "",
//   publisher: "",
//   credits: [],
//   attributes: {
//     artist: "",
//     project: "",
//     bpm: 0,
//     key: "",
//     genre: "",
//     recordLabel: "",
//     license: "",
//   },
//   collection: {
//     name: "",
//     family: "",
//   },
// };
