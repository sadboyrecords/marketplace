import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const likesRouter = createTRPCRouter({
  getLikesBySongId: publicProcedure
    .input(z.object({ songId: z.string() }))
    .query(({ input, ctx }) => {
      // ctx.prisma.likedTracks.count({
      //   where: {
      //     isLiked: true,
      //   },
      //   select: {
      //     id: true,
      //     userWallet: true,
      //   },

      // });
      return ctx.prisma.likedTracks.findMany({
        where: {
          trackId: input.songId,
          isLiked: true,
        },
        select: {
          userWallet: true,
          isLiked: true,
          song: {
            select: {
              candyMachines: {
                select: {
                  likes: {
                    where: {
                      isLiked: true,
                    },
                    select: {
                      isLiked: true,
                      likedByWallet: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),

  // getSongUserLikes: protectedProcedure
  // .input(z.object({ songId: z.string() }))
  // .query(({ input, ctx }) => {
  //   return ctx
  // }),
  likeSong: protectedProcedure
    .input(
      z.object({
        songId: z.string(),
        isLiked: z.boolean(),
        candyId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user.walletAddress) {
        throw new Error("Not logged in");
      }
      return await ctx.prisma.$transaction(async (tx) => {
        if (!ctx.session.user.walletAddress) {
          throw new Error("Not logged in");
        }
        if (input.candyId) {
          await tx.likedDrops.upsert({
            where: {
              dropAndLikedBy: {
                candyMachineId: input.candyId,
                likedByWallet: ctx.session.user.walletAddress,
              },
            },
            update: {
              isLiked: input.isLiked,
            },
            create: {
              candyMachineId: input.candyId,
              likedByWallet: ctx.session.user.walletAddress,
              isLiked: input.isLiked,
            },
          });
        }
        return await tx.likedTracks.upsert({
          where: {
            liked_tracks_track_id_walletAddress_unique: {
              trackId: input.songId,
              userWallet: ctx.session.user.walletAddress || "",
            },
          },
          update: {
            isLiked: input.isLiked,
          },
          create: {
            trackId: input.songId,
            userWallet: ctx.session.user.walletAddress,
            isLiked: input.isLiked,
          },
        });
      });
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
