import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "@/server/api/trpc";

export const artistRouter = createTRPCRouter({
  getArtistBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const artist = await ctx.prisma.user?.findFirst({
        where: {
          walletAddress: input.slug,
        },
        include: {
          pinnedProfilePicture: {
            select: {
              path: true,
              width: true,
              height: true,
              status: true,
              ipfsHash: true,
            },
          },
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
      return {
        ...artist,
      };
    }),
  getTopArtists: publicProcedure
    // .input(z.string().nullish())
    .query(async ({ ctx }) => {
      // get top artists
      const topArtists = await ctx.prisma.user.findMany({
        where: {
          songs: {
            some: {},
          },
        },
        take: 12,
        include: {
          followers: {
            where: {
              isFollowing: true,
            },
            select: {
              followerAddress: true,
            },
          },
          songs: {
            select: {
              lossyArtworkURL: true,
              lossyArtworkIPFSHash: true,
              pinnedImage: {
                select: {
                  width: true,
                  height: true,
                  status: true,
                },
              },
            },
          },
          pinnedProfilePicture: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return topArtists;
    }),
  getAllArtistsPaginated: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 40;
      const { cursor } = input;
      const creators = await ctx.prisma.user.findMany({
        take: limit + 1,
        where: {
          songs: {
            some: {},
          },
          // songs: ,
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          pinnedProfilePicture: {
            select: {
              path: true,
              width: true,
              height: true,
              status: true,
              ipfsHash: true,
            },
          },
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
        nextCursor = nextItem?.id;
      }

      return {
        creators,
        nextCursor,
      };
    }),
});
