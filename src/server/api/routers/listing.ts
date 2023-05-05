import { createRouter } from './context';
import { z } from 'zod';
import { prisma } from 'server/db/client';
import { router, publicProcedure, protectedProcedure } from 'server/trpc';

export const listingRouter = router({
  getActiveTokenListing: publicProcedure
    .input(
      z.object({
        mintAddress: z.string(),
        // collectionAddress: z.string(),
        // owner: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // if (input.owner !== ctx.session?.user?.walletAddress) {
      //   throw new Error('Unauthorized');
      // }
      const listing = await prisma?.listing.findFirst({
        where: {
          tokenMintAddress: input.mintAddress,
          status: 'LISTED',
        },
      });
      return listing;
    }),
  getListingByUser: protectedProcedure
    .input(
      z.object({
        user: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // if (input.owner !== ctx.session?.user?.walletAddress) {
      //   throw new Error('Unauthorized');
      // }
      if (!ctx.user) {
        return null;
      }
      const listing = await prisma?.listing.findMany({
        where: {
          sellerWalletAddress: input.user,
          status: 'LISTED',
        },
      });
      return listing;
    }),
  getLiveListings: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 6;
      const { cursor } = input;
      const listings = await prisma.listing.findMany({
        take: limit + 1,
        where: {
          status: 'LISTED',
          OR: [
            {
              startDate: {
                lte: new Date(),
              },
              endDate: {
                gte: new Date(),
              },
            },
            {
              startDate: {
                lte: new Date(),
              },
              endDate: null,
            },
          ],
        },
        include: {
          token: {
            include: {
              creators: {
                select: {
                  walletAddress: true,
                  // address: true,
                },
              },
              // likes: true,
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
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          // title: 'asc',
          createdAt: 'asc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (listings.length > limit) {
        const nextItem = listings.pop();
        nextCursor = nextItem!.id;
      }
      const count = await prisma.listing.count({
        where: {
          OR: [
            {
              startDate: {
                lte: new Date(),
              },
              endDate: {
                gte: new Date(),
              },
            },
            {
              startDate: {
                lte: new Date(),
              },
              endDate: null,
            },
          ],
        },
      });
      return {
        listings,
        nextCursor,
        count,
      };
    }),
  getListings: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        isLive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 6;
      const { cursor } = input;
      const listings = await prisma.listing.findMany({
        take: limit + 1,
        where: {
          status: 'LISTED',
          OR: input.isLive
            ? [
                {
                  startDate: {
                    lte: new Date(),
                  },
                  endDate: {
                    gte: new Date(),
                  },
                },
                {
                  startDate: {
                    lte: new Date(),
                  },
                  endDate: null,
                },
                // !input.isLive && {}
              ]
            : [
                {
                  // startDate: {
                  //   lte: new Date(),
                  // },
                  endDate: {
                    gte: new Date(),
                  },
                },
                {
                  // startDate: {
                  //   lte: new Date(),
                  // },
                  endDate: null,
                },
                // !input.isLive && {}
              ],
        },
        include: {
          token: {
            include: {
              creators: {
                select: {
                  walletAddress: true,
                  // address: true,
                },
              },
              // likes: true,
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
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          // title: 'asc',
          createdAt: 'asc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (listings.length > limit) {
        const nextItem = listings.pop();
        nextCursor = nextItem!.id;
      }
      const count = await prisma.listing.count({
        where: {
          OR: [
            {
              startDate: {
                lte: new Date(),
              },
              endDate: {
                gte: new Date(),
              },
            },
            {
              startDate: {
                lte: new Date(),
              },
              endDate: null,
            },
          ],
        },
      });
      return {
        listings,
        nextCursor,
        count,
      };
    }),
  createListing: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        tokenMintAddress: z.string(),
        sellerWalletAddress: z.string(),
        receiptAddress: z.string(),
        freeSellerTradeState: z.string().optional(),
        price: z.number(),
        status: z.enum(['LISTED', 'SOLD', 'CANCELLED', 'EXPIRED']),
        currency: z.enum(['USD', 'SOL']).optional(),
        // songUrl: z.string(),
        // metadataUrl: z.string(),
        listingType: z.enum(['AUCTION', 'FIXED']),
        auctionHouseAddress: z.string(),
        auctioneerAuthority: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const listing = await prisma?.listing.upsert({
        where: {
          receiptAddress: input.receiptAddress,
        },
        create: {
          ...input,
        },
        update: {
          ...input,
        },
      });
      return {
        ...listing,
      };
    }),
  updateListing: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        receiptAddress: z.string(),
        price: z.number().optional(),
        status: z.enum(['LISTED', 'SOLD', 'CANCELLED', 'EXPIRED']),
        songUrl: z.string().optional(),
        metadataUrl: z.string().optional(),
        listingType: z.enum(['AUCTION', 'FIXED']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const listing = await prisma?.listing.update({
        where: {
          receiptAddress: input.receiptAddress,
        },
        data: {
          ...input,
        },
      });
      return {
        ...listing,
      };
    }),
});

export const listingRouterOld = createRouter()
  .query('getActiveTokenListing', {
    input: z.object({ mintAddress: z.string() }),
    async resolve({ input, ctx }) {
      const listing = await ctx.prisma?.listing.findFirst({
        where: {
          tokenMintAddress: input.mintAddress,
          status: 'LISTED',
        },
      });
      return listing;
    },
  })
  .mutation('createListing', {
    input: z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      tokenMintAddress: z.string(),
      sellerWalletAddress: z.string(),
      receiptAddress: z.string(),
      freeSellerTradeState: z.string().optional(),
      price: z.number(),
      status: z.enum(['LISTED', 'SOLD', 'CANCELLED', 'EXPIRED']),
      currency: z.enum(['USD', 'SOL']).optional(),
      songUrl: z.string(),
      metadataUrl: z.string(),
      listingType: z.enum(['AUCTION', 'FIXED']),
      auctionHouseAddress: z.string(),
    }),
    async resolve({ input, ctx }) {
      const listing = await ctx.prisma?.listing.upsert({
        where: {
          receiptAddress: input.receiptAddress,
        },
        create: {
          ...input,
        },
        update: {
          ...input,
        },
      });
      return {
        ...listing,
      };
    },
  })
  .mutation('updateListing', {
    input: z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      receiptAddress: z.string(),
      price: z.number().optional(),
      status: z.enum(['LISTED', 'SOLD', 'CANCELLED', 'EXPIRED']),
      songUrl: z.string().optional(),
      metadataUrl: z.string().optional(),
      listingType: z.enum(['AUCTION', 'FIXED']).optional(),
    }),
    async resolve({ input, ctx }) {
      const listing = await ctx.prisma?.listing.update({
        where: {
          receiptAddress: input.receiptAddress,
        },
        data: {
          ...input,
        },
      });
      return {
        ...listing,
      };
    },
  });
