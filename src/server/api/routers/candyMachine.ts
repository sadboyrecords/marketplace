import { z } from 'zod';
import { nanoid } from 'nanoid';
// import { prisma } from 'server/db/client';
// import {
//   router,
//   publicProcedure,
//   protectedProcedure,
//   protectedAdminProcedure,
// } from 'server/trpc';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  protectedAdminProcedure,
} from "@/server/api/trpc";
import { type IMint } from '@/utils/types';

export const candyMachineRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
 
    const candyMachines = await ctx.prisma.candyMachines.findMany({
      take: 100,
    });
    return {
      candyMachines,
    };
  }),
  getLive: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 6;
      const { cursor } = input;
      const candyMachines = await ctx.prisma.candyMachines.findMany({
        take: limit + 1,
        where: {
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
        },
        include: {
          creators: true,
          likes: true,
          song: {
            include: {
              tokens: true,
              creators: true,
              pinnedImage: true,
              candyMachines: {
                select: {
                  candyMachineId: true,
                  slug: true,
                },
              },
            },
          },
          pinnedImage: {
            select: {
              path: true,
              pinnedToFileBase: true,
              width: true,
              height: true,
              status: true,
            },
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          // title: 'asc',
          createdAt: 'asc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (candyMachines.length > limit) {
        const nextItem = candyMachines.pop();
        nextCursor = nextItem!.id;
      }
      const count = await ctx.prisma.candyMachines.count({
        where: {
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
        },
      });
      return {
        candyMachines,
        nextCursor,
        count,
      };
    }),
  getUpcoming: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 6;
      const { cursor } = input;
      const candyMachines = await ctx.prisma.candyMachines.findMany({
        take: limit + 1,
        where: {
          startDate: {
            gte: new Date(),
          },
        },
        include: {
          creators: true,
          likes: true,
          pinnedImage: true,
          song: {
            include: {
              tokens: true,
              creators: true,
              candyMachines: {
                select: {
                  candyMachineId: true,
                  slug: true,
                },
              },
            },
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          // title: 'asc',
          createdAt: 'asc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (candyMachines.length > limit) {
        const nextItem = candyMachines.pop();
        nextCursor = nextItem?.id;
      }
      const count = await ctx.prisma.candyMachines.count({
        where: {
          startDate: {
            gte: new Date(),
          },
        },
      });
      return {
        candyMachines,
        nextCursor,
        count,
      };
    }),
  getEnded: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 6;
      const { cursor } = input;
      const candyMachines = await ctx.prisma.candyMachines.findMany({
        take: limit + 1,
        where: {
          endDate: {
            lte: new Date(),
          },
        },
        include: {
          creators: true,
          likes: true,
          pinnedImage: true,
          song: {
            include: {
              tokens: true,
              creators: true,
              candyMachines: {
                select: {
                  candyMachineId: true,
                  slug: true,
                },
              },
            },
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          // title: 'asc',
          createdAt: 'asc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (candyMachines.length > limit) {
        const nextItem = candyMachines.pop();
        nextCursor = nextItem?.id;
      }
      const count = await ctx.prisma.candyMachines.count({
        where: {
          endDate: {
            lte: new Date(),
          },
        },
      });
      return {
        candyMachines,
        nextCursor,
        count,
      };
    }),
  getByAddress: publicProcedure
    .input(z.object({ candyMachineId: z.string() }))
    .query(async ({ ctx, input}) => {
      // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
      const cm = await ctx.prisma.candyMachines?.findFirstOrThrow?.({
        where: {
          candyMachineId: {
            contains: input.candyMachineId,
          },
        },
      });
      return {
        ...cm,
      };
    }),
  getByOwner: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
      const cms = await ctx.prisma.candyMachines?.findMany?.({
        where: {
          creators: {
            some: {
              walletAddress: {
                equals: input.walletAddress,
              },
            },
          },

          // owner: {
          //   walletAddress: {
          //     equals: input.walletAddress,
          //   },
          // },
        },
        include: {
          song: {
            include: {
              tokens: true,
              creators: true,
              candyMachines: {
                select: {
                  candyMachineId: true,
                  slug: true,
                },
              },
            },
          },
          owner: {
            select: {
              profilePictureImage: true,
              walletAddress: true,
              firstName: true,
            },
          },
        },
      });
      return cms;
    }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      if(!input.slug) throw new Error('No slug provided');
      const cm = await ctx.prisma.candyMachines?.findFirst?.({
        where: {
          slug: {
            equals: input.slug,
          },
        },
        include: {
          creators: true,
          likes: true,
          song: {
            include: {
              tokens: true,
              creators: true,
              candyMachines: {
                select: {
                  candyMachineId: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
      return {
        ...cm,
      };
    }),
  getDraftById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
      return await ctx.prisma.candyMachineDraft?.findFirst?.({
        where: {
          id: {
            equals: input.id,
          },
          ownerWalletAddress: {
            equals: ctx.session.walletAddress,
          },
        },
        include: {
          battleContestant: {
            include: {
              battle: {
                select: {
                  id: true,
                }
              }
            }
          },
        }
      });
    }),
  getAllDrafts: protectedProcedure.query(async ({ ctx }) => {
    // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
    return await ctx.prisma.candyMachineDraft?.findMany?.({
      where: {
        ownerWalletAddress: {
          equals: ctx.session.walletAddress,
        },
        isPublished: {
          equals: false,
        },
      },
    });
  }),
  getFeatured: publicProcedure.query(async ({ ctx, input}) => {
    // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
    const cm = await ctx.prisma.candyMachines?.findMany?.({
      where: {
        isFeatured: {
          equals: true,
        },
      },
      include: {
        creators: true,
        likes: true,
        // pinnedImage: true,
        song: {
          include: {
            tokens: true,
            creators: true,
            candyMachines: {
              select: {
                candyMachineId: true,
                slug: true,
              },
            },
          },
        },
        owner: {
          select: {
            profilePictureImage: true,
            walletAddress: true,
            firstName: true,
          },
        },
        pinnedImage: {
          select: {
            path: true,
            pinnedToFileBase: true,
            width: true,
            height: true,
            status: true,
          },
        },
      },
    });
    return cm;
  }),
  getLikesByUser: publicProcedure
    .input(z.object({ candyMachineId: z.string(), walletAddress: z.string() }))
    .query(async ({ ctx, input}) => {
      // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
      console.log({ input, ctx });
      const dropLikes = await ctx.prisma.likedDrops?.findFirst?.({
        where: {
          candyMachineId: {
            equals: input.candyMachineId,
          },
          likedByWallet: {
            equals: input.walletAddress,
          },
        },
        // include: {
        //   candyMachine: true,
        // },
        select: {
          isLiked: true,
          candyMachine: {
            select: {
              _count: {
                select: {
                  likes: {
                    where: {
                      isLiked: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      console.log({ dropLikes });
      return {
        ...dropLikes,
      };
    }),
  getImportedCollections: protectedAdminProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 6;
      const { cursor } = input;
      console.log({ input, ctx })
      const drops = await ctx.prisma.candyMachineDraft?.findMany?.({
        where: {
          partnerCode: {
            equals: "BRIDG3",
          }
        },
        include:{
          drop: {
            select: {
              slug: true,
              dropName: true,
            }
          }
        }
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (drops.length > limit) {
        const nextItem = drops.pop();
        nextCursor = nextItem?.id;
      }
      const count = await ctx.prisma.candyMachineDraft.count({
        where: {},
      });
      return {
        collections: drops,
        nextCursor,
        count,
      };
    }),
  createDraft: protectedProcedure
    .input(
      z.object({
        formSubmission: z.custom<IMint>(),
        audioIpfsHash: z.string(),
        imageIpfshash: z.string(),
        audioUri: z.string(),
        imageUri: z.string(),
        // jsonIpfshash: z.string(),
        // jsonUri: z.string(),
        // metaDataHash: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input}) => {
      const { formSubmission } = input;
      if (!ctx.session.walletAddress) {
        throw new Error('Wallet not connected');
      }
      return await ctx.prisma.candyMachineDraft?.create?.({
        data: {
          dropName: formSubmission.collectionName,
          formSubmission: formSubmission as object,
          ownerWalletAddress: ctx.session.walletAddress,
          currentStep: 'CREATED',
          audioUri: input.audioUri,
          audioIpfsHash: input.audioIpfsHash,
          imageIpfsHash: input.imageIpfshash,
          candyMachineImageUrl: input.imageUri,
        },
      });

      // return {
      //   slug: newSlug, // cm slug,
      // };
    }),
    updateDraft: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        jsonIpfshash: z.string().optional(),
        jsonUri: z.string().optional(),
        metaDataHash: z.array(z.number()).optional(),
        currentStep: z.enum([
          'CREATED',
          'METADATA_UPLOAD',
          'CREATE_COLLECTION',
          'CREATE_CANDY_MACHINE',
          'INSERT_ITEMS',
          'UPDATE_DB',
        ]),
        candyMachineId: z.string().optional(),
        collectionAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input}) => {
      return await ctx.prisma.candyMachineDraft?.update?.({
        where: {
          id: input.id,
        },
        data: {
          currentStep: input.currentStep,
          candyMachineIdPlaceholder: input.candyMachineId,
          status: 'PENDING',
          jsonIpfsHash: input.jsonIpfshash,
          metadataUri: input.jsonUri,
          metaDataHash: input.metaDataHash,
          collectionAddress: input.collectionAddress,
        },
      });
    }),
  updateDraftAdmin: protectedAdminProcedure
    .input(
      z.object({
        id: z.string(),
        formSubmission: z.custom<IMint>().optional(),
        audioIpfsHash: z.string().optional(),
        imageIpfshash: z.string().optional(),
        audioUri: z.string().optional(),
        imageUri: z.string().optional(),
        status: z.enum(['PENDING', 'DRAFT', 'LAUNCHED']),
        // jsonIpfshash: z.string(),
        // jsonUri: z.string(),
        // metaDataHash: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input}) => {
      const { formSubmission } = input;
      return await ctx.prisma.candyMachineDraft?.update?.({
        where: {
          id: input.id,
        },
        data: {
          dropName: formSubmission?.collectionName,
          formSubmission: formSubmission as object,
          ownerWalletAddress: ctx.session?.walletAddress,
          currentStep: 'CREATED',
          audioUri: input.audioUri,
          audioIpfsHash: input.audioIpfsHash,
          imageIpfsHash: input.imageIpfshash,
          candyMachineImageUrl: input.imageUri,
          status: input.status,
        },
      });

      // return {
      //   slug: newSlug, // cm slug,
      // };
    }),
  create: protectedProcedure
    .input(
      z.object({
        candyMachineId: z.string(),
        creatorWalletAddress: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        slug: z.string(),
        description: z.string(),
        candyMachineImageUrl: z.string(),
        dropName: z.string(),
        songUri: z.string(),
        songIpfsHash: z.string(),
        songTitle: z.string(),
        songTitleSlug: z.string(),
        jsonIpfsHash: z.string(),
        imageIpfsHash: z.string(),
        price: z.number(),
        items: z.number(),
        collectionAddress: z.string(),
        tokenUri: z.string(),
        isPublic: z.boolean().optional(),
        draftId: z.string().optional(),
        externalID: z.string().optional(),
        treasury: z.string().optional(),
        creators: z.array(
          z.object({
            address: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input}) => {
      console.log({ input });
      let newSlug = input.slug;
      await ctx.prisma.$transaction(async (tx) => {
        const found = await tx.candyMachines.findFirst({
          where: {
            slug: input.slug,
          },
        });
        console.log({ found });

        newSlug = found ? `${input.slug}-${nanoid(6)}` : input.slug;

        const creators = input.creators.map((creator) => {
          return {
            where: {
              walletAddress: creator.address,
            },
            create: {
              walletAddress: creator.address,
            },
          };
        });

        await tx.songs.upsert({
          where: {
            lossyAudioIPFSHash: input.songIpfsHash,
          },
          create: {
            slug: `${input.songTitleSlug}-${nanoid(6)}`,
            title: input.songTitle,
            lossyAudioIPFSHash: input.songIpfsHash,
            lossyAudioURL: input.songUri,
            lossyArtworkIPFSHash: input.imageIpfsHash,
            lossyArtworkURL: input.candyMachineImageUrl,
            creators: {
              connectOrCreate: creators,
            },
            description: input.description,
            tokens: {
              connectOrCreate: {
                where: {
                  mintAddress: input.collectionAddress,
                },
                create: {
                  mintAddress: input.collectionAddress,
                  chain: 'solana',
                  tokenUri: input.tokenUri,
                  collectionAddress: input.collectionAddress,
                  audioUri: input.songUri,
                  audioIpfsHash: input.songIpfsHash,
                  title: input.dropName,
                  description: input.description,
                  slug: newSlug,
                  lossyArtworkIPFSHash: input.imageIpfsHash,
                  lossyArtworkURL: input.candyMachineImageUrl,
                  platformId: 'niftytunes',
                  creators: {
                    connectOrCreate: creators,
                  },
                },
              },
            },
            candyMachines: {
              create: {
                candyMachineId: input.candyMachineId,
                ownerWalletAddress: input.externalID && input.treasury ? input.treasury : input.creatorWalletAddress,
                startDate: input.startDate,
                // isPublic: true,
                // input.isPublic || input.startDate > new Date() ? false : true,
                endDate: input.endDate,
                slug: newSlug,
                description: input.description,
                candyMachineImageUrl: input.candyMachineImageUrl,
                dropName: input.dropName,
                audioUri: input.songUri,
                jsonIpfsHash: input.jsonIpfsHash,
                imageIpfsHash: input.imageIpfsHash,
                lowestPrice: input.price,
                items: input.items,
                collectionAddress: input.collectionAddress,
                creators: {
                  connectOrCreate: creators,
                },

              },
            },
          },
          update: {
            tokens: {
              connectOrCreate: {
                where: {
                  mintAddress: input.collectionAddress,
                },
                create: {
                  mintAddress: input.collectionAddress,
                  chain: 'solana',
                  tokenUri: input.tokenUri,
                  collectionAddress: input.collectionAddress,
                  audioUri: input.songUri,
                  audioIpfsHash: input.songIpfsHash,
                  title: input.dropName,
                  description: input.description,
                  slug: newSlug,
                  lossyArtworkIPFSHash: input.imageIpfsHash,
                  lossyArtworkURL: input.candyMachineImageUrl,
                  platformId: 'niftytunes',
                  creators: {
                    connectOrCreate: creators,
                  },
                },
              },
            },
            candyMachines: {
              create: {
                candyMachineId: input.candyMachineId,
                ownerWalletAddress: input.creatorWalletAddress,
                startDate: input.startDate,
                isPublic:
                  input.isPublic || input.startDate > new Date() ? false : true,
                endDate: input.endDate,
                slug: newSlug,
                description: input.description,
                candyMachineImageUrl: input.candyMachineImageUrl,
                dropName: input.dropName,
                audioUri: input.songUri,
                jsonIpfsHash: input.jsonIpfsHash,
                imageIpfsHash: input.imageIpfsHash,
                lowestPrice: input.price,
                items: input.items,
                collectionAddress: input.collectionAddress,
                creators: {
                  connectOrCreate: creators,
                },
              },
            },
          },
          select: {
            candyMachines: true,
          },
        });

        if (input.draftId) {
          await tx.candyMachineDraft.update({
            where: {
              id: input.draftId,
            },
            data: {
              isPublished: true,
              currentStep: 'UPDATE_DB',
              candyMachineSlug: newSlug,
              status: "LAUNCHED",
              candyMachineId: input.candyMachineId,
            },
          });
        }
      });
      //  await tx.candyMachineDraft.

      return {
        slug: newSlug, // cm slug,
      };
    }),
  update: protectedProcedure
    .input(
      z.object({
        candyMachineId: z.string(),
        creatorWalletAddress: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        candyMachineImageUrl: z.string().optional(),
        dropName: z.string().optional(),
        songIpfsHash: z.string().optional(),
        songUri: z.string().optional(),
        jsonIpfsHash: z.string().optional(),
        imageIpfsHash: z.string().optional(),
        price: z.number().optional(),
        items: z.number().optional(),
        totalMinted: z.number().optional(),
        userAddress: z.string(),
        // songId: z.string(),
        creators: z
          .array(
            z.object({
              address: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input}) => {
      console.log({ input, ctx });
      if (
        !ctx.session.walletAddress ||
        ctx.session.walletAddress !== input.userAddress
      ) {
        throw new Error('Unauthorized');
      }
      const updatedCreators = input?.creators?.map((creator) => {
        return {
          where: {
            walletAddress: creator.address,
          },
          create: {
            walletAddress: creator.address,
          },
        };
      });

      const updated = await ctx.prisma.candyMachines.update({
        where: {
          candyMachineId: input.candyMachineId,
        },
        data: {
          creators: {
            set: [],
            connectOrCreate: updatedCreators,
          },
          startDate: input?.startDate,
          endDate: input.endDate,
          slug: input.slug,
          description: input.description,
          candyMachineImageUrl: input.candyMachineImageUrl,
          dropName: input.dropName,
          // audioIpfsHash: input.songIpfsHash,
          audioUri: input.songUri,
          jsonIpfsHash: input.jsonIpfsHash,
          // imageIpfsHash: input.imageIpfsHash,
          lowestPrice: input.price,
          items: input.items,
          totalMinted: input.totalMinted,
          song: {
            update: {
              creators: {
                connectOrCreate: updatedCreators,
              },
            },
          },
        },
      });
      // console.log({ updated })
      return {
        ...updated,
      };
    }),
  updatetotalMinted: protectedProcedure
    .input(
      z.object({
        candyMachineId: z.string(),
        totalMinted: z.number(),
        // userAddress: z.string(),
      })
    )
    .mutation(async ({ ctx, input}) => {
      // if (
      //   !ctx.session.walletAddress ||
      //   ctx.session.walletAddress !== input.userAddress
      // ) {
      //   throw new Error('Unauthorized');
      // }
      const updated = await ctx.prisma.candyMachines.update({
        where: {
          candyMachineId: input.candyMachineId,
        },
        data: {
          totalMinted: input.totalMinted,
        },
      });
      return {
        ...updated,
      };
    }),
  createOrUpdate: publicProcedure
    .input(
      z.object({
        candyMachineId: z.string(),
        creatorWalletAddress: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        slug: z.string(),
        description: z.string(),
        candyMachineImageUrl: z.string(),
        dropName: z.string(),
        songIpfsHash: z.string(),
        songUri: z.string(),
        jsonIpfsHash: z.string(),
        imageIpfsHash: z.string(),
      })
    )
    .mutation(async ({ ctx, input}) => {
      const likedTrack = await ctx.prisma.candyMachines.upsert({
        where: {
          candyMachineId: input.candyMachineId,
        },
        create: {
          candyMachineId: input.candyMachineId,
          ownerWalletAddress: input.creatorWalletAddress,
          startDate: input.startDate,
          endDate: input.endDate,
          slug: input.slug,
          description: input.description,
          candyMachineImageUrl: input.candyMachineImageUrl,
          dropName: input.dropName,
          audioIpfsHash: input.songIpfsHash,
          audioUri: input.songUri,
          jsonIpfsHash: input.jsonIpfsHash,
          imageIpfsHash: input.imageIpfsHash,
        },
        update: {
          startDate: input.startDate,
          endDate: input.endDate,
          slug: input.slug,
          description: input.description,
          candyMachineImageUrl: input.candyMachineImageUrl,
          dropName: input.dropName,
          audioIpfsHash: input.songIpfsHash,
          audioUri: input.songUri,
          jsonIpfsHash: input.jsonIpfsHash,
          imageIpfsHash: input.imageIpfsHash,
        },
      });
      return {
        ...likedTrack,
      };
    }),
  likeUnlikeDrop: publicProcedure
    .input(
      z.object({
        userWallet: z.string(),
        candyMachineId: z.string(),
        isLiked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input}) => {
      const likedDrop = await ctx.prisma.likedDrops.upsert({
        where: {
          dropAndLikedBy: {
            candyMachineId: input.candyMachineId,
            likedByWallet: input.userWallet,
          },
        },
        create: {
          likedByWallet: input.userWallet,
          candyMachineId: input.candyMachineId,
          isLiked: input.isLiked,
        },
        update: {
          isLiked: input.isLiked,
        },
      });
      return {
        ...likedDrop,
      };
    }),
});

// export const candyMachineRouterOld = createTRPCRouter()
//   .query('getAll', {
//     async resolve({ ctx }) {
//       const candyMachines = await ctx.ctx.prisma.candyMachines.findMany({
//         take: 100,
//       });
//       return {
//         candyMachines,
//       };
//     },
//   })
//   .query('getByAddress', {
//     input: z.object({ candyMachineId: z.string() }),
//     async resolve({ ctx, input}) {
//       // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
//       const cm = await ctx.ctx.prisma.candyMachines?.findFirstOrThrow?.({
//         where: {
//           candyMachineId: {
//             contains: input.candyMachineId,
//           },
//         },
//       });
//       return {
//         ...cm,
//       };
//     },
//   })
//   .query('getBySlug', {
//     input: z.object({ slug: z.string() }),
//     async resolve({ ctx, input}) {
//       // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
//       const cm = await ctx.ctx.prisma.candyMachines?.findFirst?.({
//         where: {
//           slug: {
//             equals: input.slug,
//           },
//         },
//         include: {
//           creators: true,
//           likes: true,
//           song: true,
//         },
//       });
//       return {
//         ...cm,
//       };
//     },
//   })
//   .query('getLikesByUser', {
//     input: z.object({ candyMachineId: z.string(), walletAddress: z.string() }),
//     async resolve({ ctx, input}) {
//       // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
//       console.log({ input, ctx });
//       const dropLikes = await ctx.ctx.prisma.likedDrops?.findFirst?.({
//         where: {
//           candyMachineId: {
//             equals: input.candyMachineId,
//           },
//           likedByWallet: {
//             equals: input.walletAddress,
//           },
//         },
//         // include: {
//         //   candyMachine: true,
//         // },
//         select: {
//           isLiked: true,
//           candyMachine: {
//             select: {
//               _count: {
//                 select: {
//                   likes: {
//                     where: {
//                       isLiked: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//         // include: {
//         //   candyMachine: {
//         //     select: {
//         //       _count: {
//         //         select: {
//         //           likes: {
//         //             where: {
//         //               isLiked: true,
//         //             }
//         //           }
//         //         }
//         //       },
//         //     },
//         //   },
//         // },
//       });
//       console.log({ dropLikes });
//       return {
//         ...dropLikes,
//       };
//     },
//   })
//   .mutation('create', {
//     input: z.object({
//       candyMachineId: z.string(),
//       creatorWalletAddress: z.string(),
//       startDate: z.date(),
//       endDate: z.date(),
//       slug: z.string(),
//       description: z.string(),
//       candyMachineImageUrl: z.string(),
//       dropName: z.string(),
//       songUri: z.string(),
//       songIpfsHash: z.string(),
//       songTitle: z.string(),
//       songTitleSlug: z.string(),
//       jsonIpfsHash: z.string(),
//       imageIpfsHash: z.string(),
//       creators: z.array(
//         z.object({
//           address: z.string(),
//         })
//       ),
//     }),
//     async resolve({ ctx, input}) {
//       console.log({ input, ctx });
//       const found = await ctx.ctx.prisma.candyMachines.findFirst({
//         where: {
//           slug: input.slug,
//         },
//       });
//       console.log({ found });

//       const newSlug = found ? `${input.slug}-${nanoid(6)}` : input.slug;
//       // const cm = await ctx.ctx.prisma.candyMachines.create({
//       //   data: {
//       //     candyMachineId: input.candyMachineId,
//       //     ownerWalletAddress: input.creatorWalletAddress,
//       //     startDate: input.startDate,
//       //     endDate: input.endDate,
//       //     slug: newSlug,
//       //     description: input.description,
//       //     candyMachineImageUrl: input.candyMachineImageUrl,
//       //     dropName: input.dropName,
//       //     audioUri: input.songUri,
//       //     audioIpfsHash: input.songIpfsHash,
//       //   },

//       // });

//       const creators = input.creators.map((creator) => {
//         return {
//           where: {
//             walletAddress: creator.address,
//           },
//           create: {
//             walletAddress: creator.address,
//           },
//         };
//       });

//       await ctx.ctx.prisma.songs.upsert({
//         where: {
//           lossyAudioIPFSHash: input.songIpfsHash,
//         },
//         create: {
//           slug: `${input.songTitleSlug}-${nanoid(6)}`,
//           title: input.songTitle,
//           lossyAudioIPFSHash: input.songIpfsHash,
//           lossyArtworkIPFSHash: input.candyMachineImageUrl,
//           lossyAudioURL: input.songUri,
//           candyMachines: {
//             create: {
//               candyMachineId: input.candyMachineId,
//               ownerWalletAddress: input.creatorWalletAddress,
//               startDate: input.startDate,
//               endDate: input.endDate,
//               slug: newSlug,
//               description: input.description,
//               candyMachineImageUrl: input.candyMachineImageUrl,
//               dropName: input.dropName,
//               audioUri: input.songUri,
//               jsonIpfsHash: input.jsonIpfsHash,
//               imageIpfsHash: input.imageIpfsHash,
//               creators: {
//                 connectOrCreate: creators,
//               },
//             },
//           },
//         },
//         update: {
//           candyMachines: {
//             create: {
//               candyMachineId: input.candyMachineId,
//               ownerWalletAddress: input.creatorWalletAddress,
//               startDate: input.startDate,
//               endDate: input.endDate,
//               slug: newSlug,
//               description: input.description,
//               candyMachineImageUrl: input.candyMachineImageUrl,
//               dropName: input.dropName,
//               audioUri: input.songUri,
//               jsonIpfsHash: input.jsonIpfsHash,
//               imageIpfsHash: input.imageIpfsHash,
//               creators: {
//                 connectOrCreate: creators,
//               },
//             },
//           },
//         },
//         select: {
//           candyMachines: true,
//         },
//       });
//       return {
//         slug: newSlug, // cm slug,
//       };
//     },
//   })
//   .mutation('update', {
//     input: z.object({
//       candyMachineId: z.string(),
//       creatorWalletAddress: z.string().optional(),
//       startDate: z.date().optional(),
//       endDate: z.date().optional(),
//       slug: z.string().optional(),
//       description: z.string().optional(),
//       candyMachineImageUrl: z.string().optional(),
//       dropName: z.string().optional(),
//       songIpfsHash: z.string().optional(),
//       songUri: z.string().optional(),
//       jsonIpfsHash: z.string().optional(),
//       imageIpfsHash: z.string().optional(),
//       creators: z
//         .array(
//           z.object({
//             address: z.string(),
//           })
//         )
//         .optional(),
//     }),
//     async resolve({ ctx, input}) {
//       console.log({ input, ctx });
//       const updatedCreators = input?.creators?.map((creator) => {
//         return {
//           where: {
//             walletAddress: creator.address,
//           },
//           create: {
//             walletAddress: creator.address,
//           },
//         };
//       });
//       const updated = await ctx.ctx.prisma.candyMachines.update({
//         where: {
//           candyMachineId: input.candyMachineId,
//         },
//         data: {
//           creators: {
//             set: [],
//             connectOrCreate: updatedCreators,
//           },
//           startDate: input?.startDate,
//           endDate: input.endDate,
//           slug: input.slug,
//           description: input.description,
//           candyMachineImageUrl: input.candyMachineImageUrl,
//           dropName: input.dropName,
//           audioIpfsHash: input.songIpfsHash,
//           audioUri: input.songUri,
//           jsonIpfsHash: input.jsonIpfsHash,
//           imageIpfsHash: input.imageIpfsHash,
//         },
//       });
//       // console.log({ updated })
//       return {
//         ...updated,
//       };
//     },
//   })
//   .mutation('createOrUpdate', {
//     input: z.object({
//       candyMachineId: z.string(),
//       creatorWalletAddress: z.string(),
//       startDate: z.date(),
//       endDate: z.date(),
//       slug: z.string(),
//       description: z.string(),
//       candyMachineImageUrl: z.string(),
//       dropName: z.string(),
//       songIpfsHash: z.string(),
//       songUri: z.string(),
//       jsonIpfsHash: z.string(),
//       imageIpfsHash: z.string(),
//     }),
//     async resolve({ ctx, input}) {
//       const likedTrack = await ctx.ctx.prisma.candyMachines.upsert({
//         where: {
//           candyMachineId: input.candyMachineId,
//         },
//         create: {
//           candyMachineId: input.candyMachineId,
//           ownerWalletAddress: input.creatorWalletAddress,
//           startDate: input.startDate,
//           endDate: input.endDate,
//           slug: input.slug,
//           description: input.description,
//           candyMachineImageUrl: input.candyMachineImageUrl,
//           dropName: input.dropName,
//           audioIpfsHash: input.songIpfsHash,
//           audioUri: input.songUri,
//           jsonIpfsHash: input.jsonIpfsHash,
//           imageIpfsHash: input.imageIpfsHash,
//         },
//         update: {
//           startDate: input.startDate,
//           endDate: input.endDate,
//           slug: input.slug,
//           description: input.description,
//           candyMachineImageUrl: input.candyMachineImageUrl,
//           dropName: input.dropName,
//           audioIpfsHash: input.songIpfsHash,
//           audioUri: input.songUri,
//           jsonIpfsHash: input.jsonIpfsHash,
//           imageIpfsHash: input.imageIpfsHash,
//         },
//       });
//       return {
//         ...likedTrack,
//       };
//     },
//   })
//   .mutation('likeUnlikeDrop', {
//     input: z.object({
//       userWallet: z.string(),
//       candyMachineId: z.string(),
//       isLiked: z.boolean(),
//     }),
//     async resolve({ ctx, input}) {
//       const likedDrop = await ctx.ctx.prisma.likedDrops.upsert({
//         where: {
//           dropAndLikedBy: {
//             candyMachineId: input.candyMachineId,
//             likedByWallet: input.userWallet,
//           },
//         },
//         create: {
//           likedByWallet: input.userWallet,
//           candyMachineId: input.candyMachineId,
//           isLiked: input.isLiked,
//         },
//         update: {
//           isLiked: input.isLiked,
//         },
//       });
//       return {
//         ...likedDrop,
//       };
//     },
//   });
