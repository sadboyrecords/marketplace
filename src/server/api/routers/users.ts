import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  myProfile: protectedProcedure.query(({ ctx }) => {
    console.log({ session: ctx.session });
    if (!ctx.session || !ctx.session.walletAddress) {
      throw new Error("No wallet address found in session");
    }

    return ctx.prisma.user.upsert({
      where: { walletAddress: ctx.session.walletAddress },
      update: {},
      create: {
        walletAddress: ctx.session.walletAddress,
      },
      include: {
        pinnedProfilePicture: {
          select: {
            path: true,
            status: true,
          },
        },
        likedTracks: {
          where: {
            isLiked: true,
          },
          include: {
            song: {
              include: {
                tokens: true,
                creators: true,
                likes: {
                  where: {
                    userWallet: ctx.session.walletAddress,
                  },
                },
              },
            },
          },
        },
        likedPlaylists: {
          where: {
            isLiked: true,
          },
        },
        likedUsers: true,
        creatorTokens: true,
        followers: {
          where: {
            isFollowing: true,
          },
        },
        following: {
          where: {
            isFollowing: true,
          },
        },
      },
    });
  }),

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
