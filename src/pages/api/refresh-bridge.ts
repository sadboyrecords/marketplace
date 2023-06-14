/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
// src/pages/api/RefreshBridge.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";
import type { IMint, IRole, IUserCredits } from "@/utils/types";

const testData = {
  marketplaceCode: "NIFTY",
  id: "3a5519c2-1be5-4a7f-abe2-264d4c399944",
  collectionMarketplaceCollectionId: "4f0ccfe6-278b-474d-afaf-f741266e596f",
  internalStatus: "ACTIVE",
  selected: "yes",
  updatedAt: "2023-04-12T15:46:23.021Z",
  createdAt: "2023-04-11T20:52:16.225Z",
  externalID: "RNI5FhDcmn",
  collectionInfo: {
    collectionName: "Maybe",
    description: "This is my description. ",
    collectionPublicId: "Ye0u3OaClC",
    currency: "SOL",
    salePrice: 0.2,
    maxTotalSupply: 300,
    releaseDate: "2023-04-21T04:00:00.000Z",
    endDate: "2023-04-29T04:00:00.000Z",
    treasury: "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf",
    secondarySalePercentage: 10,
    streamingRoyaltyAllocation: null,
    otherUtilitiesDescription: null,
    walletSplits: [
      {
        percentage: 50,
        walletAddress: "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf",
      },
      {
        percentage: 50,
        walletAddress: "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf",
      },
    ],
    featuredImage: {
      key: "protected/DDEX/Believe/5056167150367/resources/5056167150367.jpg",
      url: "https://d30la2y2w9p72p.cloudfront.net/eyJidWNrZXQiOiJicmlkZzM2MTcyZjY2NjgwNGE0Mjk5YmJiN2UwMzRlMWJhMjI4ZDE0MjYwOC1iZXRhZGV2Iiwia2V5IjoicHJvdGVjdGVkL0RERVgvQmVsaWV2ZS81MDU2MTY3MTUwMzY3L3Jlc291cmNlcy81MDU2MTY3MTUwMzY3LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJmaWxsIn19fQ==",
    },
    music: {
      key: "protected/DDEX/Believe/5056167150367/resources/47_5056167150367_01_001.mp3",
      url: "https://dfwp729g6exfc.cloudfront.net/protected/DDEX/Believe/5056167150367/resources/47_5056167150367_01_001.mp3",
    },
    song: {
      duration: null,
      genre: "Dance - Commercial / Club",
      upc: "5056167150367",
      isrc: "GBKPL2140813",
      songTitle: "Maybe",
      songPublicId: "oEIKTI2m",
      releaseTitle: null,
      CLine: "2021 Sadboy Records",
      PLine: "2021 Sadboy Records",
      creators: [
        {
          name: "Maxence Pepin",
          role: "Author",
        },
        {
          name: "Pierre Blondeau",
          role: "Author",
        },
        {
          name: "Anny Mechichem",
          role: "Author",
        },
        {
          name: "Maxence Pepin",
          role: "Composer",
        },
        {
          name: "Pierre Blondeau",
          role: "Composer",
        },
        {
          name: "Anny Mechichem",
          role: "Composer",
        },
      ],
      primaryArtists: [
        {
          name: "Midsplit",
          role: "Artist",
        },
        {
          name: "Annie Mehesh",
          role: "Artist",
        },
      ],
      featuredArtists: [
        {
          name: "Midsplit",
          role: "Artist",
        },
      ],
      performers: [],
      linkedArtists: {
        items: [
          {
            artist: {
              artistName: "Midsplit",
              socialDiscord: null,
              socialInsta: null,
              socialTikTok: null,
              socialTwitter: null,
              socialWeb: null,
            },
          },
          {
            artist: {
              artistName: "Annie Mehesh",
              socialDiscord: null,
              socialInsta: null,
              socialTikTok: null,
              socialTwitter: null,
              socialWeb: null,
            },
          },
        ],
      },
    },
  },
};

type DataType = typeof testData;

const RefreshBridge = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = process.env.NEXT_BRIDGE_API_URL;
  console.log({ url });
  try {
    // console.log({ req, params: req.query });
    let brigeUrl = url + "?marketplaceCode=NIFTY";
    if (req.query.externalID) {
      brigeUrl += "&externalID=" + req.query.externalID;
    }
    console.log({ brigeUrl });
    const fetched = await fetch(brigeUrl);
    const data: DataType[] = await fetched.json();
    console.log({ data });
    await prisma.$transaction(async (tx) => {
      const run = Promise.all(
        data.map(async (item) => {
          const all = [
            ...item.collectionInfo.song?.creators,
            ...item.collectionInfo.song?.primaryArtists,
            ...item.collectionInfo.song?.featuredArtists.map((item) => ({
              ...item,
              role: "FEATURED_ARTIST",
            })),
          ];
          const credits: IUserCredits[] = all.reduce(
            (
              acc: { name: string; role: IRole[]; walletAddress?: string }[],
              creator
            ) => {
              console.log({ acc, creator });
              const index = acc.findIndex((item) => item.name === creator.name);
              let role = creator.role;
              if (creator.role === "Author" || creator.role === "Lyricist") {
                role = "SONGWRITER";
              }
              if (creator.role === "Composer") {
                role = "PRODUCER";
              }
              if (index !== -1) {
                if (
                  creator.role === "ComposerLyricist" ||
                  creator.role === "ComposerAndOrLyricist"
                ) {
                  role = "PRODUCER";
                  acc[index]?.role.push("SONGWRITER");
                }
                acc[index]?.role.push(role.toUpperCase());
              } else {
                if (
                  creator.role === "ComposerLyricist" ||
                  creator.role === "ComposerAndOrLyricist"
                ) {
                  role = "PRODUCER";
                  acc.push({
                    name: creator.name,
                    role: [role.toUpperCase(), "SONGWRITER"],
                  });
                } else {
                  acc.push({
                    name: creator.name,
                    role: [role.toUpperCase()],
                    walletAddress: undefined,
                  });
                }
              }
              return acc;
            },
            []
          );
          const formSubmission = {
            endDateTime: new Date(item.collectionInfo.endDate),
            startDateTime: new Date(item.collectionInfo.releaseDate),
            price: item.collectionInfo.salePrice,
            collectionName: item.collectionInfo.collectionName,
            description: item.collectionInfo.description,
            royalties: item.collectionInfo.secondarySalePercentage,
            itemsAvailable: item.collectionInfo.maxTotalSupply,
            trackTitle: item.collectionInfo.song.songTitle,
            genre: item.collectionInfo.song.genre,
            upc: item.collectionInfo.song.upc,
            isrc: item.collectionInfo.song.isrc,
            symbol: item.collectionInfo.collectionName
              .substring(0, 2)
              .toUpperCase(),
            sellerFeeBasisPoints: item.collectionInfo.secondarySalePercentage,
            walletSplits: item.collectionInfo.walletSplits,
            credits,
            primaryArtists: item.collectionInfo.song.primaryArtists.map(
              (p) => p.name
            ),
            treasuryAddress: item.collectionInfo.treasury,
            guards: [
              {
                label: "public",
                endDate: new Date(item.collectionInfo.endDate),
                startDate: new Date(item.collectionInfo.releaseDate),
                solPayment: {
                  amount: item.collectionInfo.salePrice,
                  destination: item.collectionInfo.treasury,
                },
              },
            ],
            pline: item.collectionInfo.song.PLine,
            cline: item.collectionInfo.song.CLine,
            goLiveImmediately: "NO",
          };
          return await tx.candyMachineDraft.upsert({
            where: {
              externalIDAndMarketplace: {
                externalID: item.externalID,
                partnerCode: "BRIDG3",
              },
            },
            update: {
              formSubmission: {
                ...(formSubmission as any),
              },
              // audioUri: item.collectionInfo?.music?.url,
              // candyMachineImageUrl: item.collectionInfo?.featuredImage?.url,
              externalID: item.externalID,
              ownerWalletAddress: item.collectionInfo.treasury,
              startDate: new Date(item.collectionInfo.releaseDate),
              endDate: new Date(item.collectionInfo.endDate),
              lowestPrice: item.collectionInfo.salePrice,
              items: item.collectionInfo.maxTotalSupply,
              description: item.collectionInfo.description,
              dropName: item.collectionInfo.collectionName,
              // currentStep: 'CREATED',
              primaryArtists: item.collectionInfo.song.primaryArtists.map(
                (artist) => artist.name
              ),
              featuredArtists: item.collectionInfo.song.featuredArtists.map(
                (artist) => artist.name
              ),
              upc: item.collectionInfo.song.upc,
              isrc: item.collectionInfo.song.isrc,
              creators: item.collectionInfo.song.creators.map(
                (creator) => creator.name
              ),
              treasury: item.collectionInfo.treasury,
              partner: {
                update: {
                  lastRefresh: new Date(),
                },
              },
            },
            create: {
              formSubmission: {
                ...(formSubmission as unknown as any),
              },
              audioUri: item.collectionInfo?.music?.url,
              candyMachineImageUrl: item.collectionInfo?.featuredImage?.url,
              status: "PENDING",
              externalID: item.externalID,
              ownerWalletAddress: item.collectionInfo.treasury,
              startDate: new Date(item.collectionInfo.releaseDate),
              endDate: new Date(item.collectionInfo.endDate),
              lowestPrice: item.collectionInfo.salePrice,
              items: item.collectionInfo.maxTotalSupply,
              description: item.collectionInfo.description,
              dropName: item.collectionInfo.collectionName,
              currentStep: "CREATED",
              primaryArtists: item.collectionInfo.song.primaryArtists.map(
                (artist) => artist.name
              ),
              featuredArtists: item.collectionInfo.song.featuredArtists.map(
                (artist) => artist.name
              ),
              upc: item.collectionInfo.song.upc,
              isrc: item.collectionInfo.song.isrc,
              creators: item.collectionInfo.song.creators.map(
                (creator) => creator.name
              ),
              treasury: item.collectionInfo.treasury,
              partner: {
                connectOrCreate: {
                  where: {
                    code: "BRIDG3",
                  },
                  create: {
                    code: "BRIDG3",
                    name: "Bridg3 Music",
                    lastRefresh: new Date(),
                  },
                },
              },
            },
          });
          // new Promise(async (resolve, reject) => {
          //   try {

          //     resolve(true);
          //   } catch (e) {
          //     reject(e);
          //   }
          // });
        })
      );
      const finished = await run;
      console.log({ finished });
      console.log("DONE RUNNING");
      return true;
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(" CATCHING");
    console.log({ error });
    throw new Error("error");
    // res.status(500).json({ error: error || 'There was an error' });
  }
};

export default RefreshBridge;
