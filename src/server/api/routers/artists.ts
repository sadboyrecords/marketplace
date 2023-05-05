

import { createRouter } from './context';
import { z } from 'zod';
import { prisma } from 'server/db/client';
import { router, publicProcedure } from 'server/trpc';

export const artistRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(async ({ input }) => {
      return {
        greeting: `Hello ${input ?? 'world'}`,
      };
    }),
    getArtistBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const artist = await prisma?.user?.findFirst({
        where: {
          walletAddress: input.slug,
        },
        include: {
        },
      });
      return {
        ...artist,
      };
    }),
    getTopArtists: publicProcedure
    // .input(z.string().nullish())
    .query(async ({ input }) => {
      // get top artists
      const topArtists = await prisma.user.findMany({
        take: 20,
        include: {
         songs: true,
        },
      });
      return { topArtists };
    }),
    getAllArtistsPaginated: publicProcedure
    .input(z.object({
      skip: z.number().optional(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
    }))
    .query(async ({ input }) => {
      const limit = input.limit ?? 40;
      const { cursor } = input;
      const creators = await prisma.user.findMany({
        take: limit + 1,
        where: {
          songs: {
            some: { }
          }
          // songs: ,
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          pinnedProfilePicture: true,
          creatorTokens: {
            select: {
              lossyArtworkURL: true,
              lossyArtworkIPFSHash: true,
              description: true,
              pinnedImage: true,
            },
          },
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (creators.length > limit) {
        const nextItem = creators.pop();
        nextCursor = nextItem!.id;
      }

      return {
        creators,
        nextCursor,
      };
    }),
});

export const artistRouterOld = createRouter()
  .query('getArtistBySlug', {
    input: z.object({ slug: z.string() }),
    async resolve({ ctx, input }) {
      const artist = await ctx?.prisma?.user?.findFirst({
        where: {
          walletAddress: input.slug,
        },
        include: {
        },
      });
      return {
        ...artist,
      };
    },
  })
  .query('getTopArtists', {
    async resolve({ ctx }) {
      // get top artists
      const topArtists = await ctx.prisma.user.findMany({
        take: 20,
        include: {
         songs: true,
        },
      });
      return { topArtists };
    },
  })
  .query('getAllArtistsPaginated', {
    input: z.object({
      skip: z.number().optional(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
    }),
    async resolve({ ctx, input }) {
      const limit = input.limit ?? 40;
      const { cursor } = input;
      const creators = await ctx.prisma.user.findMany({
        take: limit + 1,
        where: {
          songs: {
            some: { }
          }
          // songs: ,
        },
        cursor: cursor ? { id: cursor } : undefined,
        // orderBy: {
        //   name: 'asc',
        // },
        include: {
          creatorTokens: {
            select: {
              lossyArtworkURL: true,
              lossyArtworkIPFSHash: true,
              description: true,
            },
          },
          // rawArtistProfiles: true,

          // rawProcessedTracks: {
          //   select: {
          //     lossyArtworkURL: true,
          //     lossyArtworkIPFSHash: true,
          //     description: true,
          //   },
          // },
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (creators.length > limit) {
        const nextItem = creators.pop();
        nextCursor = nextItem!.id;
      }

      return {
        creators,
        nextCursor,
      };
    },
  });
