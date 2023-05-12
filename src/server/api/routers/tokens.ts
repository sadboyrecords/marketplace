import { z } from "zod";
import type {
  Sft,
  SftWithToken,
  Nft,
  NftWithToken,
} from "@metaplex-foundation/js";
import {
  publicProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

// export const s3 = new S3({
//   apiVersion: "2006-03-01",
//   accessKeyId: process.env.NEXT_FILEBASE_KEY,
//   secretAccessKey: process.env.NEXT_FILEBASE_SECRET,
//   region: "us-east-1",
//   endpoint: "https://s3.filebase.com",
//   signatureVersion: "v4",
//   s3ForcePathStyle: true,
// });

export const tokenRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const tokens = await ctx.prisma.tokens.findMany({
      take: 100,
      where: {
        platformId: "nina",
      },
      include: {
        creators: true,
      },
    });
    return {
      tokens,
    };
  }),
  getTopTracks: publicProcedure.query(async ({ ctx }) => {
    // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
    const topNfts = await ctx.prisma.songs.findMany({
      take: 12,
      where: {
        platformId: "nina",
      },
      include: {
        creators: true,
      },
    });
    return {
      topNfts,
    };
  }),
  getCollectionDetails: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
      const topNfts = await ctx.prisma?.tokens?.findFirst?.({
        where: {
          mintAddress: {
            contains: input.contractAddress,
          },
        },
        include: {
          creators: true,
        },
      });
      return {
        ...topNfts,
      };
    }),
  getSpotlightToken: publicProcedure.query(async ({ ctx }) => {
    // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
    const spotlight = await ctx.prisma.tokens.findFirst({
      take: 1,
      where: {
        chain: {
          startsWith: "solana",
        },
      },
      include: {
        creators: true,
      },
    });
    return {
      ...spotlight,
    };
  }),
  getAllCollectionsPaginated: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 12;
      const { cursor } = input;
      const collections = await ctx.prisma.tokens.findMany({
        take: limit + 1,
        where: {
          platformId: {
            equals: "nina",
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          title: "asc",
        },
        include: {
          creators: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (collections.length > limit) {
        const nextItem = collections.pop();
        nextCursor = nextItem!.id;
      }

      return {
        collections,
        nextCursor,
      };
    }),
  getNftDetails: publicProcedure
    .input(
      z.object({
        mintAddress: z.string(),
        nft: z.custom<Sft | Nft | SftWithToken | NftWithToken>().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log({ input });
      return await ctx.prisma.tokens.findFirst({
        where: {
          mintAddress: input.mintAddress,
        },
      });
    }),
  findOrCreateNft: publicProcedure
    .input(
      z.object({
        mintAddress: z.string(),
        nft: z.custom<Sft | Nft | SftWithToken | NftWithToken>().optional(),
      })
    )
    .query(({ ctx, input }) => {
      try {
        console.log({ input });
        const nft = input.nft;
        if (!nft) {
          return null;
        }
        return "";
        // const nftJson = nft.json;
        // console.log({ nftJson });
        // const { audioHash, audioUrl, imageHash, imageUrl } =
        //   await getHashAndUriFromNFT(nft);
        // if (!audioHash && !audioUrl && !imageHash && !imageUrl) {
        //   return null;
        // }
        // if (!audioUrl) {
        //   return null;
        // }
        // let newImageHash = imageHash;
        // let path: string | undefined;
        // let newAudioHash = audioHash;
        // let audioPath: string | undefined;
        // if (!imageHash && imageUrl) {
        //   const response = await fetch(imageUrl);
        //   const imageData = await response.arrayBuffer();
        //   const input = Buffer.from(imageData);
        //   const uniqueHash = await hashArray(imageData);
        //   const key = `${nftImagePath}${uniqueHash}`;
        //   const metaData = await sharp(input).metadata();

        //   const { width, height, format } = metaData;
        //   const type = 'image/' + format;
        //   console.log({ type, width, height, format, key });
        //   const params = {
        //     Bucket: process.env.NEXT_FILEBASE_BUCKET_NAME,
        //     Key: key,
        //     ContentType: type,
        //     Expires: 60,
        //   };
        //   console.log('upload------');
        //   const url = s3.getSignedUrl('putObject', params);
        //   const { headers } = await axios.put(url, imageData, {
        //     headers: {
        //       'Content-Type': type,
        //       // 'Access-Control-Allow-Origin': '*',
        //     },
        //   });
        //   const cid = headers['x-amz-meta-cid'];
        //   console.log({ cid });
        //   newImageHash = cid;
        //   path = key;
        // }
        // if (!audioHash && audioUrl) {
        //   const response = await fetch(audioUrl);
        //   const audioData = await response.arrayBuffer();
        //   const uniqueHash = await hashArray(audioData);
        //   const key = `${nftAudioPath}${uniqueHash}`;
        //   const audioFile = nftJson?.properties?.files?.filter((f: any) =>
        //     f.type.includes('audio')
        //   );
        //   const type = audioFile?.[0]?.type || 'audio/mp3';
        //   console.log('Audio------', { key });
        //   const params = {
        //     Bucket: process.env.NEXT_FILEBASE_BUCKET_NAME,
        //     Key: key,
        //     ContentType: type,
        //     Expires: 60,
        //   };
        //   console.log('upload--AUDIO----');
        //   const url = s3.getSignedUrl('putObject', params);
        //   const { headers } = await axios.put(url, audioData, {
        //     headers: {
        //       'Content-Type': type,
        //       // 'Access-Control-Allow-Origin': '*',
        //     },
        //   });
        //   const cid = headers['x-amz-meta-cid'];
        //   console.log({ cid });
        //   newAudioHash = cid;
        //   audioPath = key;
        // }

        // console.log({
        //   imageUrl,
        //   audioUrl,
        //   audioHash,
        //   imageHash,
        //   newImageHash,
        //   path,
        //   newAudioHash,
        //   audioPath,
        // });
        // const pinsData = await axios({
        //   method: 'get',
        //   url: `${filebaseEndpoints.getPins}?cid=${newImageHash},${newAudioHash}`,
        //   headers: {
        //     Authorization:
        //       'Bearer ' + process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN,
        //   },
        // });
        // const pins = await pinsData.data;
        // console.log({ pins });
        // const foundImage = pins?.results.find(
        //   (p: any) => p.pin.cid === newImageHash
        // );
        // const foundAudio = pins?.results.find(
        //   (p: any) => p.pin.cid === newAudioHash
        // );
        // let isPinnedImage = foundImage?.status === 'pinned';
        // let isPinnedAudio = foundAudio?.status === 'pinned';

        // const creators = nft.creators.filter((c) => c?.share > 0);
        // let songTitle: string | undefined;
        // if (nftJson?.properties?.title) {
        //   songTitle = nftJson.properties?.title as string;
        // }

        // // const found = await tx.songs.findFirst({
        // //   where: {
        // //     OR: [{ lossyAudioURL: audioUrl }, { lossyAudioIPFSHash: ipfsHash }],
        // //   },
        // // });
        // const tokenInfo: any = await ctx.prisma.$transaction(async (tx) => {
        //   const found = await tx.songs.findFirst({
        //     where: {
        //       OR: [
        //         { lossyAudioURL: audioUrl },
        //         { lossyAudioIPFSHash: newAudioHash },
        //       ],
        //     },
        //   });
        //   if (found) {
        //     const data = await ctx.prisma.tokens.upsert({
        //       where: {
        //         mintAddress: input.mintAddress,
        //       },
        //       create: {
        //         id: nft.address as any as string,
        //         tokenUri: nft.uri,
        //         audioUri: audioUrl,
        //         title: nft.name,
        //         description: nftJson?.description,
        //         slug: `${nft.name.replace(/\s+/g, '-').toLowerCase()}-${nanoid(
        //           8
        //         )}`,
        //         collectionAddress: nft.collection?.address as any as string,
        //         externalUrl: nft.json?.external_url,
        //         lossyArtworkURL: nft.json?.image,
        //         creators: {
        //           connectOrCreate: creators.map((c: any) => {
        //             return {
        //               where: {
        //                 walletAddress: c.address,
        //               },
        //               create: {
        //                 walletAddress: c.address,
        //               },
        //             };
        //           }) as any,
        //         },
        //         chain: 'solana',
        //         mintAddress: nft.address as any as string,
        //         song: {
        //           connect: {
        //             id: found.id,
        //           },
        //         },
        //         pinnedImage: newImageHash
        //           ? {
        //               connectOrCreate: {
        //                 where: {
        //                   ipfsHash: newImageHash,
        //                 },
        //                 create: {
        //                   ipfsHash: newImageHash,
        //                   originalUrl: imageUrl,
        //                   path: `${nftImagePath}${newImageHash}`,
        //                   status: isPinnedImage ? 'PINNED' : 'PENDING',
        //                   type: 'IMAGE',
        //                   pinnedToFileBase: isPinnedImage,
        //                 },
        //               },
        //             }
        //           : undefined,
        //         pinnedAudio: newAudioHash
        //           ? {
        //               connectOrCreate: {
        //                 where: {
        //                   ipfsHash: newAudioHash,
        //                 },
        //                 create: {
        //                   ipfsHash: newAudioHash,
        //                   originalUrl: audioUrl,
        //                   path: `${nftAudioPath}${newAudioHash}`,
        //                   status: isPinnedAudio ? 'PINNED' : 'PENDING',
        //                   type: 'AUDIO',
        //                   pinnedToFileBase: isPinnedAudio,
        //                 },
        //               },
        //             }
        //           : undefined,
        //       },
        //       update: {
        //         pinnedImage: newImageHash
        //           ? {
        //               connectOrCreate: {
        //                 where: {
        //                   ipfsHash: newImageHash,
        //                 },
        //                 create: {
        //                   ipfsHash: newImageHash,
        //                   originalUrl: imageUrl,
        //                   path: `${nftImagePath}${newImageHash}`,
        //                   status: isPinnedImage ? 'PINNED' : 'PENDING',
        //                   type: 'IMAGE',
        //                   pinnedToFileBase: isPinnedImage,
        //                 },
        //               },
        //             }
        //           : undefined,
        //         pinnedAudio: newAudioHash
        //           ? {
        //               connectOrCreate: {
        //                 where: {
        //                   ipfsHash: newAudioHash,
        //                 },
        //                 create: {
        //                   ipfsHash: newAudioHash,
        //                   originalUrl: audioUrl,
        //                   path: `${nftAudioPath}${newAudioHash}`,
        //                   status: isPinnedAudio ? 'PINNED' : 'PENDING',
        //                   type: 'AUDIO',
        //                   pinnedToFileBase: isPinnedAudio,
        //                 },
        //               },
        //             }
        //           : undefined,
        //         song: {
        //           update: {
        //             lossyAudioIPFSHash: newAudioHash,
        //             lossyArtworkIPFSHash: newImageHash,
        //           },
        //         },
        //       },
        //     });
        //     console.log({ data });
        //     return data;
        //   }
        //   if (!found) {
        //     // const data = await ctx.prisma.tokens.upsert({
        //     //   where: {
        //     //     mintAddress: input.mintAddress,
        //     //   },
        //     //   create: {
        //     //     id: nft.address as any as string,
        //     //     tokenUri: nft.uri,
        //     //     audioUri: audioUrl,
        //     //     pinnedImage: newImageHash
        //     //       ? {
        //     //           connectOrCreate: {
        //     //             where: {
        //     //               ipfsHash: newImageHash,
        //     //             },
        //     //             create: {
        //     //               ipfsHash: newImageHash,
        //     //               originalUrl: imageUrl,
        //     //               path: `${nftImagePath}${newImageHash}`,
        //     //               status: imageHash ? 'PENDING' : 'PINNED',
        //     //               type: 'IMAGE',
        //     //             },
        //     //           },
        //     //         }
        //     //       : undefined,
        //     //     pinnedAudio: newAudioHash
        //     //       ? {
        //     //           connectOrCreate: {
        //     //             where: {
        //     //               ipfsHash: newAudioHash,
        //     //             },
        //     //             create: {
        //     //               ipfsHash: newAudioHash,
        //     //               originalUrl: audioUrl,
        //     //               path: `${nftAudioPath}${newAudioHash}`,
        //     //               status: audioHash ? 'PENDING' : 'PINNED',
        //     //               type: 'AUDIO',
        //     //             },
        //     //           },
        //     //         }
        //     //       : undefined,
        //     //     title: nft.name,
        //     //     description: nftJson?.description,
        //     //     slug: `${nft.name.replace(/\s+/g, '-').toLowerCase()}-${nanoid(
        //     //       8
        //     //     )}`,
        //     //     collectionAddress: nft.collection?.address as any as string,
        //     //     externalUrl: nft.json?.external_url,
        //     //     lossyArtworkURL: nft.json?.image,
        //     //     creators: {
        //     //       connectOrCreate: creators.map((c: any) => {
        //     //         return {
        //     //           where: {
        //     //             walletAddress: c.address,
        //     //           },
        //     //           create: {
        //     //             walletAddress: c.address,
        //     //           },
        //     //         };
        //     //       }) as any,
        //     //     },
        //     //     chain: 'solana',
        //     //     mintAddress: nft.address as any as string,
        //     //     song: {
        //     //       connectOrCreate: {
        //     //         where: {
        //     //           lossyAudioURL: audioUrl,
        //     //         },
        //     //         create: {
        //     //           slug: `${
        //     //             songTitle?.replace(/\s+/g, '-').toLowerCase() ||
        //     //             nftJson?.name?.replace(/\s+/g, '-').toLowerCase()
        //     //           }-${nanoid(8)}`,
        //     //           title:
        //     //             (nftJson?.properties?.title as string) ||
        //     //             nftJson?.name ||
        //     //             'Untitled',
        //     //           lossyAudioIPFSHash: newAudioHash,
        //     //           lossyAudioURL: audioUrl,
        //     //           lossyArtworkURL: imageUrl,
        //     //           lossyArtworkIPFSHash: newImageHash,
        //     //           description: nftJson?.description,
        //     //           creators: {
        //     //             connectOrCreate: creators.map((c: any) => {
        //     //               return {
        //     //                 where: {
        //     //                   walletAddress: c.address,
        //     //                 },
        //     //                 create: {
        //     //                   walletAddress: c.address,
        //     //                 },
        //     //               };
        //     //             }) as any,
        //     //           },
        //     //         },
        //     //       },
        //     //     },
        //     //   },
        //     //   update: {
        //     //     pinnedImage: newImageHash
        //     //       ? {
        //     //           connectOrCreate: {
        //     //             where: {
        //     //               ipfsHash: newImageHash,
        //     //             },
        //     //             create: {
        //     //               ipfsHash: newImageHash,
        //     //               originalUrl: imageUrl,
        //     //               path: `${nftImagePath}${newImageHash}`,
        //     //               status: imageHash ? 'PENDING' : 'PINNED',
        //     //               type: 'IMAGE',
        //     //             },
        //     //           },
        //     //         }
        //     //       : undefined,
        //     //     pinnedAudio: newAudioHash
        //     //       ? {
        //     //           connectOrCreate: {
        //     //             where: {
        //     //               ipfsHash: newAudioHash,
        //     //             },
        //     //             create: {
        //     //               ipfsHash: newAudioHash,
        //     //               originalUrl: audioUrl,
        //     //               path: `${nftAudioPath}${newAudioHash}`,
        //     //               status: audioHash ? 'PENDING' : 'PINNED',
        //     //               type: 'AUDIO',
        //     //             },
        //     //           },
        //     //         }
        //     //       : undefined,
        //     //     song: {
        //     //       update: {
        //     //         lossyAudioIPFSHash: newAudioHash,
        //     //         lossyArtworkIPFSHash: newImageHash,
        //     //       },
        //     //       // upsert: {
        //     //       //   // update: {},
        //     //       //   // create: {
        //     //       //   //   slug: `${
        //     //       //   //     songTitle?.replace(/\s+/g, '-').toLowerCase() ||
        //     //       //   //     nftJson?.name?.replace(/\s+/g, '-').toLowerCase()
        //     //       //   //   }-${nanoid(8)}`,
        //     //       //   //   title:
        //     //       //   //     (nftJson?.properties?.title as string) ||
        //     //       //   //     nftJson?.name ||
        //     //       //   //     'Untitled',
        //     //       //   //   lossyAudioIPFSHash: newAudioHash || null,
        //     //       //   //   lossyAudioURL: audioUrl,
        //     //       //   //   lossyArtworkURL: imageUrl,
        //     //       //   //   lossyArtworkIPFSHash: newImageHash,
        //     //       //   //   description: nftJson?.description,
        //     //       //   //   creators: {
        //     //       //   //     connectOrCreate: creators.map((c: any) => {
        //     //       //   //       return {
        //     //       //   //         where: {
        //     //       //   //           walletAddress: c.address,
        //     //       //   //         },
        //     //       //   //         create: {
        //     //       //   //           walletAddress: c.address,
        //     //       //   //         },
        //     //       //   //       };
        //     //       //   //     }) as any,
        //     //       //   //   },
        //     //       //   // },
        //     //       // },
        //     //     },
        //     //   },
        //     // });
        //     // console.log({ data });
        //     const songs = await tx.songs.upsert({
        //       where: {
        //         lossyAudioURL: audioUrl,
        //       },
        //       create: {
        //         lossyAudioURL: audioUrl as string,
        //         slug: `${
        //           songTitle?.replace(/\s+/g, '-').toLowerCase() ||
        //           nftJson?.name?.replace(/\s+/g, '-').toLowerCase()
        //         }-${nanoid(8)}`,
        //         title:
        //           (nftJson?.properties?.title as any) ||
        //           nftJson?.name ||
        //           'Untitled',
        //         lossyAudioIPFSHash: newAudioHash,
        //         // ipfsHash === audioUrl
        //         //   ? null
        //         //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''),
        //         lossyArtworkURL: nft.json?.image,
        //         lossyArtworkIPFSHash: newImageHash,
        //         description: nftJson?.description,
        //         creators: {
        //           connectOrCreate: nft.creators
        //             .filter((c) => c?.share > 0)
        //             .map((c: any) => {
        //               return {
        //                 where: {
        //                   walletAddress: c.address,
        //                 },
        //                 create: {
        //                   walletAddress: c.address,
        //                 },
        //               };
        //             }) as any,
        //         },
        //         tokens: {
        //           connectOrCreate: {
        //             where: {
        //               mintAddressAndChain: {
        //                 mintAddress: nft.address as any as string,
        //                 chain: 'solana',
        //               },
        //             },
        //             create: {
        //               // id: nft.address as any as string,
        //               tokenUri: nft.uri,
        //               audioUri: audioUrl as string,
        //               mintAddress: nft.address as any as string,
        //               chain: 'solana',
        //               lossyArtworkIPFSHash: newImageHash,
        //               audioIpfsHash: newAudioHash,
        //               // ipfsHash === audioUrl
        //               //   ? null
        //               //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''),
        //               title: nft.name,
        //               description: nftJson?.description,
        //               slug: `${nft.name
        //                 .replace(/\s+/g, '-')
        //                 .toLowerCase()}-${nanoid(8)}`,
        //               collectionAddress: nft.collection
        //                 ?.address as any as string,
        //               externalUrl: nft.json?.external_url,
        //               lossyArtworkURL: nft.json?.image,
        //               creators: {
        //                 connectOrCreate: nft.creators
        //                   .filter((c) => c.share > 0)
        //                   .map((c: any) => {
        //                     return {
        //                       where: {
        //                         walletAddress: c.address,
        //                       },
        //                       create: {
        //                         walletAddress: c.address,
        //                       },
        //                     };
        //                   }) as any,
        //               },
        //             },
        //           },
        //         },
        //       },
        //       update: {
        //         lossyAudioIPFSHash: newAudioHash,
        //         lossyArtworkIPFSHash: newImageHash,
        //         tokens: {
        //           connectOrCreate: {
        //             where: {
        //               mintAddressAndChain: {
        //                 mintAddress: nft.address as any as string,
        //                 chain: 'solana',
        //               },
        //             },
        //             create: {
        //               // id: nft.address as any as string,
        //               tokenUri: nft.uri,
        //               mintAddress: nft.address as any as string,
        //               chain: 'solana',
        //               audioUri: audioUrl as string,
        //               audioIpfsHash: newAudioHash,
        //               // ipfsHash === audioUrl
        //               //   ? null
        //               //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''),
        //               title: nft.name,
        //               description: nftJson?.description,
        //               slug: `${nft.name}-${nanoid(8)}`,
        //               collectionAddress: nft.collection
        //                 ?.address as any as string,
        //               externalUrl: nft.json?.external_url,
        //               lossyArtworkURL: nft.json?.image,
        //               lossyArtworkIPFSHash: newImageHash,
        //               creators: {
        //                 connectOrCreate: nft.creators
        //                   .filter((c) => c.share > 0)
        //                   .map((c: any) => {
        //                     return {
        //                       where: {
        //                         walletAddress: c.address,
        //                       },
        //                       create: {
        //                         walletAddress: c.address,
        //                       },
        //                     };
        //                   }) as any,
        //               },
        //             },
        //           },
        //         },
        //       },
        //     });
        //     return songs;
        //   }
        // });
        // return tokenInfo;
      } catch (error) {
        console.log({ error });
        return null;
      }
    }),
  getUserTokensFiltered: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.publicKey) {
        throw new Error("No public key provided");
      }
      const tokens = await ctx.prisma.tokens.findMany({
        where: {
          creators: {
            every: {
              walletAddress: input.publicKey,
            },
          },
        },
        include: {
          creators: true,
          song: true,
        },
      });
      const uniqueUrls: string[] = [];
      const uniqueSongs = tokens
        .filter((token) => {
          if (uniqueUrls.includes(token.audioUri)) {
            return false;
          }
          uniqueUrls.push(token.audioUri);
          return true;
        })
        .map((token) => {
          return {
            ...token.song,
            tokens: token,
          };
        });
      return uniqueSongs;
    }),
  findManyWithNoHash: protectedProcedure.query(async ({ ctx }) => {
    // await ctx.prisma.tokens.updateMany({
    //   where: {
    //     tokenUri: {
    //       contains: 'arweave.net',
    //     }
    //   },
    //   data: {
    //     lossyArtworkIPFSHash: null,
    //   }
    // })
    //   const found = await ctx.prisma.tokens.findFirst({
    //     where: {
    //      audioIpfsHash:{
    //       startsWith: "/"
    //      }
    //     }
    //   })
    //  try {
    //   console.log({ found })
    //   const newAudioHash = found?.audioIpfsHash?.split("/").pop()
    //   const newImageHash = found?.lossyArtworkIPFSHash?.split("/").pop()
    //   console.log({ newAudioHash, newImageHash })
    //   if (!newAudioHash && !newImageHash) {
    //     return ""
    //   }
    //    await ctx.prisma.tokens.update({
    //     where: {
    //       id: found?.id
    //     },
    //     data: {
    //       lossyArtworkIPFSHash: newImageHash,
    //       audioIpfsHash: newAudioHash,
    //     }
    //   })
    //  } catch (error) {
    //   console.log({ error})
    //  }

    // await ctx.prisma.pinnedFiles.update({
    //   where: {
    //     ipfsHash: "/bafkreibtnhaumsgwmtjjywiqsgsvhneq7kjrd37nlf4fhlcirv55dbh7vm"
    //   },
    //   data: {
    //     ipfsHash: newHash
    //   }
    // })
    return await ctx.prisma.tokens.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                lossyArtworkIPFSHash: null,
              },
              {
                audioIpfsHash: null,
              },
            ],
            audioUri: {
              not: "undefined",
            },
          },
        ],
      },
      select: {
        id: true,
        mintAddress: true,
      },
      take: 100,
    });
  }),
  likeUnlikeTrack: publicProcedure
    .input(
      z.object({
        userWallet: z.string(),
        trackId: z.string(),
        isLiked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const likedTrack = await ctx.prisma.likedTracks.upsert({
        where: {
          liked_tracks_track_id_walletAddress_unique: {
            trackId: input.trackId,
            userWallet: input.userWallet,
          },
        },
        create: {
          userWallet: input.userWallet,
          trackId: input.trackId,
          isLiked: input.isLiked,
        },
        update: {
          isLiked: input.isLiked,
        },
      });
      return {
        ...likedTrack,
      };
    }),
});

// export const tokenRouterOld = createRouter()
//   .query('hello', {
//     input: z.string().nullish(),
//     resolve({ input }) {
//       return {
//         greeting: `Hello ${input ?? 'world'}`,
//       };
//     },
//   })
//   .query('getAll', {
//     async resolve({ ctx }) {
//       const tokens = await ctx.ctx.prisma.tokens.findMany({
//         take: 100,
//         where: {
//           platformId: 'nina',
//         },
//         include: {
//           creators: true,
//         },
//       });
//       return {
//         tokens,
//       };
//     },
//   })
//   .query('getTopTracks', {
//     async resolve({ ctx }) {
//       // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
//       const topNfts = await ctx.ctx.prisma.songs.findMany({
//         take: 12,
//         where: {
//           platformId: 'nina',
//         },
//         include: {
//           creators: true,
//         },
//       });
//       return {
//         topNfts,
//       };
//     },
//   })
//   .query('getCollectionDetails', {
//     input: z.object({ contractAddress: z.string() }),
//     async resolve({ ctx, input }) {
//       // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
//       const topNfts = await ctx.prisma?.tokens?.findFirst?.({
//         where: {
//           mintAddress: {
//             contains: input.contractAddress,
//           },
//         },
//         include: {
//           creators: true,
//         },
//       });
//       return {
//         ...topNfts,
//       };
//     },
//   })
//   .query('getSpotlightToken', {
//     async resolve({ ctx }) {
//       // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
//       const spotlight = await ctx.ctx.prisma.tokens.findFirst({
//         take: 1,
//         where: {
//           chain: {
//             startsWith: 'solana',
//           },
//         },
//         include: {
//           creators: true,
//         },
//       });
//       return {
//         ...spotlight,
//       };
//     },
//   })
//   .query('getAllCollectionsPaginated', {
//     input: z.object({
//       skip: z.number().optional(),
//       limit: z.number().min(1).max(100).nullish(),
//       cursor: z.string().nullish(),
//     }),
//     async resolve({ ctx, input }) {
//       const limit = input.limit ?? 12;
//       const { cursor } = input;
//       const collections = await ctx.ctx.prisma.tokens.findMany({
//         take: limit + 1,
//         where: {
//           platformId: {
//             equals: 'nina',
//           },
//         },
//         cursor: cursor ? { id: cursor } : undefined,
//         orderBy: {
//           title: 'asc',
//         },
//         include: {
//           creators: true,
//         },
//       });
//       let nextCursor: typeof cursor | undefined = undefined;
//       if (collections.length > limit) {
//         const nextItem = collections.pop();
//         nextCursor = nextItem!.id;
//       }

//       return {
//         collections,
//         nextCursor,
//       };
//     },
//   })
//   .query('getNftDetails', {
//     input: z.object({ mintAddress: z.string() }),
//     async resolve({ ctx, input }) {
//       console.log({ input });

//       // const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(input.mintAddress) });

//       return {
//         // ...nft
//       };
//     },
//   })
//   .query('getUserTokensFiltered', {
//     input: z.object({
//       publicKey: z.string(),
//     }),
//     async resolve({ ctx, input }) {
//       if (!input.publicKey) {
//         throw new Error('No public key provided');
//       }
//       const tokens = await ctx.ctx.prisma.tokens.findMany({
//         where: {
//           creators: {
//             every: {
//               walletAddress: input.publicKey,
//             },
//           },
//         },
//         include: {
//           creators: true,
//           song: true,
//         },
//       });
//       const uniqueUrls: string[] = [];
//       const uniqueSongs = tokens
//         .filter((token) => {
//           if (uniqueUrls.includes(token.audioUri)) {
//             return false;
//           }
//           uniqueUrls.push(token.audioUri);
//           return true;
//         })
//         .map((token) => {
//           return {
//             ...token.song,
//             tokens: token,
//           };
//         });

//       // console.log({ tokens, uniqueTokens })
//       return uniqueSongs;
//     },
//   })
//   .mutation('likeUnlikeTrack', {
//     input: z.object({
//       userWallet: z.string(),
//       trackId: z.string(),
//       isLiked: z.boolean(),
//     }),
//     async resolve({ ctx, input }) {
//       const likedTrack = await ctx.ctx.prisma.likedTracks.upsert({
//         where: {
//           liked_tracks_track_id_walletAddress_unique: {
//             trackId: input.trackId,
//             userWallet: input.userWallet,
//           },
//         },
//         create: {
//           userWallet: input.userWallet,
//           trackId: input.trackId,
//           isLiked: input.isLiked,
//         },
//         update: {
//           isLiked: input.isLiked,
//         },
//       });
//       return {
//         ...likedTrack,
//       };
//     },
//   });
