import {
  type Metaplex,
  toBigNumber,
  toDateTime,
  sol,
  PublicKey,
} from '@metaplex-foundation/js';
import type { FindNftsByOwnerOutput } from '@metaplex-foundation/js';

import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import type {
  CreatorInput,
} from '@metaplex-foundation/js';
import { addresses } from "@/utils/constants"

// const metaplex = new Metaplex(connection);

// Create the Collection NFT.
//  { nft: collectionNft }

interface Creator {
  address: string;
  verified: boolean;
  share: number;
}

interface CollectionCreation {
  uri: string;
  collectionName: string;
  sellerFeeBasisPoints?: number;
  maxSupply?: number;
  isMutable?: boolean;
  retainAuthority?: boolean;
  creators?: CreatorInput[];
}

type IMxFields = {
  metaplex: Metaplex;
  publicKey: PublicKey;
};

type ICreateCollection = {
  metaplex: Metaplex;
  publicKey: PublicKey;
  name: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators?: CreatorInput[];
};

type IBasicCandyInput = {
  itemsAvailable: number;
  sellerFeeBasisPoints: number; // 333 = 3.33%
  symbol: string;
  collectionMintAddress: PublicKey;
  creators?: CreatorInput[];
  prefixName: string;
  prefixUri: string;
  uriLength?: number;
  treasuryWallet: PublicKey;
  tokenSalePrice: number;
  startDate: Date;
  endDate?: Date;
  authority: PublicKey;
};
type ICandy = {
  metaplex: Metaplex;
  publicKey?: PublicKey;
  candyInput: IBasicCandyInput;
};

type IInsetItemsToCandy = {
  metaplex: Metaplex;
  publicKey?: PublicKey;
  candyAddress: PublicKey;
  items: { name: string; uri: string }[]; // string here can just be the end of the uri depends on how we handle uri
};

// const auctionHouseAddress = '85mJJtUVk4chbs4vXoKu9rmxmvHaGwPJFJCJ5DjFoJPB';

export const connection = new Connection(
  clusterApiUrl(process.env.NEXT_PUBLIC_SOLANA_NETWORK as any)
);

export const checkNftOwner = ({ userNfts, nftDetails }:{ userNfts: any[], nftDetails: any}) => {
  const isOwner = userNfts.find(
    (nft) => nft.mintAddress.toBase58() === nftDetails.address.toBase58()
  );
  return isOwner;
}

export const getUserNfts = async ({ metaplex, publicKey }: IMxFields) => {
  try {
    const nftData = await metaplex.nfts().findAllByOwner({
      owner: publicKey,
      
    });
    const newArray = [] as any;
    if (nftData.length > 0) {
      for (const item of nftData) {
        const result = await fetch(item.uri);
        const data = await result.json();
        const filtered = data?.properties?.files?.filter(
          (f: any) => f.type === 'audio/mp3'
        );
        if (data?.properties?.category === 'audio' || filtered?.length > 0) {
          const nftIndex = newArray.findIndex(function (n: any) {
            // @ts-ignore
            return n.mintAddress.toBase58() === item.mintAddress.toBase58();
          });
          if (nftIndex === -1) {
            newArray.push({ ...item, metaData: data });
          }
          if (nftIndex > -1) {
            newArray[nftIndex] = { ...item, metaData: data };
          }
        }
      }
      return newArray as FindNftsByOwnerOutput;
    } 
    return newArray ;
  } catch (error) {
    console.log({ error });
    throw new Error(error as any);
  }
};

export const getNftDetails = async ({ metaplex, mintAddress, tokenOwner }: { metaplex: Metaplex, mintAddress: PublicKey, tokenOwner?: PublicKey }) => {
  console.log({ tokenOwner: tokenOwner?.toBase58()})
  try {
    const nftInfo = await metaplex.nfts().findByMint({
      mintAddress,
      tokenOwner,
      loadJsonMetadata: true,
    })
  //  const token= await metaplex.tokens().findTokenByAddress({ address: mintAddress })
  //  console.log({ token})
    return nftInfo;
  } catch (error) {
    console.log({ error })
    throw new Error(error as any);
  }

};

export const getMyCollections = async ({ metaplex, publicKey }: IMxFields) => {
  try {
    const myNfts = await metaplex.nfts().findAllByOwner({
      owner: publicKey,
    });
    return myNfts;
  } catch (error) {
    console.log({ error });
    throw new Error(error as any);
  }
};

export const createCollection = async ({
  name,
  metaplex,
  uri,
  sellerFeeBasisPoints,
  creators,
}: ICreateCollection) => {
  try {
    const result = await metaplex.nfts().create({
      name,
      uri,
      sellerFeeBasisPoints,
      isCollection: true,
      creators,
    });
    return result;
  } catch (error) {
    throw new Error(error as any);
  }
};
// collection mintAddress, creators (address share), sellerFeeBasisPoints

export const createCandyMachine = async (input: ICandy) => {
  const { metaplex, candyInput } = input;
  const {
    itemsAvailable,
    sellerFeeBasisPoints,
    symbol,
    collectionMintAddress,
    creators,
    prefixName,
    prefixUri,
    uriLength,
    treasuryWallet,
    tokenSalePrice,
    startDate,
    endDate,
    authority,
  } = candyInput;

  try {
    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(itemsAvailable),
      sellerFeeBasisPoints,
      symbol,
      collection: {
        address: collectionMintAddress,
        updateAuthority: metaplex.identity(),
      },
      creators,
      authority: authority || metaplex.identity(),
      itemSettings: {
        type: 'configLines',
        prefixName,
        nameLength: 10, // number of characters in the name
        prefixUri,
        uriLength: uriLength || 40, // number of characters in the uri
        isSequential: false,
      },
      guards: {
        solPayment: {
          amount: sol(tokenSalePrice),
          destination: treasuryWallet,
        },
        startDate: {
          date: toDateTime(startDate), //new Date('2022-11-29T15:30:00.000Z')
        },
        endDate: endDate && {
          date: toDateTime(endDate),
        },
      },
    });
    // console.log({
    //   candyMachine,
    //   address: candyMachine.address.toBase58(),
    //   mintAuthority: candyMachine.mintAuthorityAddress.toBase58(),
    // });
    return candyMachine;
  } catch (error) {
    console.log({ error });
    throw new Error(error as any);
  }
};

export const InsertItemsToCandy = async (input: IInsetItemsToCandy) => {
  try {
    const candyMachine = await input.metaplex.candyMachines().findByAddress({
      address: input.candyAddress,
    });
    const inserted = await input.metaplex.candyMachines().insertItems({
      candyMachine,
      items: input.items,
    });
    return inserted;
  } catch (error) {
    console.log({ error });
    throw new Error(error as any);
  }
};

/* AUCTION HOUSE FUNCTIONS */
export const getAuctionHouse = async ({ metaplex, houseAddress }: { metaplex: Metaplex, houseAddress?: string }) => {
  try {
    const auctionHouse = await metaplex.auctionHouse().findByAddress({
      address: new PublicKey(houseAddress || addresses.auctionHouse),
      // auctioneerAuthority: new PublicKey(addresses?.auctioneerAuthority),
    });
    return auctionHouse;
  } catch (error) {
    console.log({ getAuctionHouseError: error })
    throw new Error(error as any);
  }

};

export const getListingDetails = async ({ metaplex, auctionHouseAddress, receiptAddress }: { metaplex: Metaplex, auctionHouseAddress: string, receiptAddress: string }) => {
  try {
    const auctionHouse = await metaplex.auctionHouse().findByAddress({
      address: new PublicKey(auctionHouseAddress),
    });
    const listing = await metaplex.auctionHouse().
    findListingByReceipt({
      auctionHouse,
      receiptAddress: new PublicKey(receiptAddress),
      loadJsonMetadata: true,
    });
    return listing;
  } catch (error) {
    console.log({ error })
    throw new Error(error as any);
  }

};

// const futureCandymachineWithgroups = async () => {
//   try {
//     console.log('----------Creating candy machine-------------');

//     const nfts = await getMyCollections();
//     console.log({ nfts });
//     const { candyMachine } = await metaplex.candyMachines().create({
//       itemsAvailable: toBigNumber(12),
//       sellerFeeBasisPoints: 333, // 3.33%
//       symbol: 'FCM',
//       collection: {
//         address: nfts[2].mintAddress,
//         updateAuthority: metaplex.identity(),
//       },
//       creators: [
//         {
//           address: publicKey,
//           share: 100,
//         },
//       ],
//       authority: metaplex.identity(),
//       // withoutCandyGuard: false,
//       itemSettings: {
//         type: 'configLines',
//         prefixName: 'My NFT Project #$ID+1$',
//         nameLength: 10, // number of characters in the name
//         prefixUri: greatCollectionUri,
//         uriLength: 43, // number of characters in the uri
//         isSequential: false,
//       },
//       guards: {
//         solPayment: {
//           amount: sol(0.2),
//           destination: new PublicKey(id3json.publicKey), //or treasury
//         },
//         startDate: {
//           date: toDateTime(new Date('2022-10-28T15:30:00.000Z')),
//         },
//         endDate: {
//           date: toDateTime(new Date('2022-11-29T15:30:00.000Z')),
//         },
//       },
//       groups: [
//         {
//           label: 'early',
//           guards: {
//             redeemedAmount: { maximum: toBigNumber(4) },
//             solPayment: {
//               amount: sol(0.1),
//               destination: new PublicKey(id3json.publicKey),
//             },
//           },
//         },
//         {
//           label: 'late',
//           guards: {
//             solPayment: {
//               amount: sol(0.5),
//               destination: new PublicKey(id3json.publicKey),
//             },
//           },
//         },
//       ],
//     });
//     console.log({
//       candyMachine,
//       address: candyMachine.address.toBase58(),
//       mintAuthority: candyMachine.mintAuthorityAddress.toBase58(),
//     });
//     return candyMachine;
//   } catch (error) {
//     console.log({ error });
//     throw new Error(error);
//   }
// };

// 2 ways to create a Candy Machine ITEMS:
// with config line settings
// before creating the Candy Machine, we should have the info from the user stored to a db  potentially or on UI
// uploading 1000 items meta data can take some time
// with hidden settings - this can be a future iteration

// STEPS
//  - Create a collection or provide collection address
// - Create a candy machine with config line settings + guards - users should have a treasury wallet - where the money will be sent to
// - Upload the items metadata
// - Create the items
// - Insert items to candy machine
// - Update candy machine config/guards
