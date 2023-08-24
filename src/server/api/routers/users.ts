import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  protectedAdminProcedure,
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
    // console.log({ session: ctx.session });
    if (!ctx.session || !ctx.session.user.walletAddress) {
      throw new Error("No wallet address found in session");
    }

    return ctx.prisma.user.upsert({
      where: {
        walletAddress: ctx.session.user.walletAddress,
      },
      update: {
        email: ctx.session.user.email,
      },
      create: {
        walletAddress: ctx.session.user.walletAddress,
        email: ctx.session.user.email,
        magicSolanaAddress: ctx.session.user.magicSolanaAddress,
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
                    userWallet: ctx.session.user.walletAddress,
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
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  getUser: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.publicKey) {
        throw new Error("No public key provided");
      }
      const user = await ctx.prisma.user.findFirst({
        where: {
          walletAddress: input?.publicKey,
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

          likedTracks: {
            where: {
              isLiked: true,
            },
            // include: {
            //   song: {
            //     include: {
            //       tokens: true,
            //       creators: true,
            //       likes: {
            //         where: {
            //           userWallet: input?.publicKey,
            //         },
            //       },
            //     },
            //   },
            // },
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
      if (!user) {
        const newUser = await ctx.prisma.user.create({
          data: {
            walletAddress: input.publicKey,
            // firstName: artist.name,
            lastName: "",
          },
          include: {
            pinnedProfilePicture: {
              select: {
                path: true,
                status: true,
                ipfsHash: true,
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
                        userWallet: input?.publicKey,
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

        return {
          ...newUser,
        };
      }
      return {
        ...user,
      };
    }),
  getUserSongs: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!input.walletAddress) {
        throw new Error("No public key provided");
      }
      return await ctx.prisma.songs.findMany({
        where: {
          creators: {
            some: {
              walletAddress: input.walletAddress,
            },
          },
        },
        select: {
          id: true,
          artistNames: true,
          title: true,
          lossyArtworkIPFSHash: true,
          lossyArtworkURL: true,
          lossyAudioURL: true,
          lossyAudioIPFSHash: true,
          pinnedImage: {
            select: {
              width: true,
              height: true,
              path: true,
              status: true,
            },
          },
          creators: {
            select: {
              name: true,
              walletAddress: true,
              firstName: true,
            },
          },
          tokens: {
            select: {
              mintAddress: true,
            },
          },
          candyMachines: {
            select: {
              candyMachineId: true,
              slug: true,
            },
          },
        },
      });
    }),
  getLikedSongs: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!input.walletAddress) {
        throw new Error("No public key provided");
      }
      return await ctx.prisma.songs.findMany({
        where: {
          likes: {
            some: {
              isLiked: true,
              userWallet: input.walletAddress,
            },
          },
        },
        select: {
          id: true,
          artistNames: true,
          title: true,
          lossyArtworkIPFSHash: true,
          lossyArtworkURL: true,
          lossyAudioURL: true,
          lossyAudioIPFSHash: true,
          pinnedImage: {
            select: {
              width: true,
              height: true,
              path: true,
              status: true,
            },
          },
          creators: {
            select: {
              name: true,
              walletAddress: true,
              firstName: true,
            },
          },
          tokens: {
            select: {
              mintAddress: true,
            },
          },
          candyMachines: {
            select: {
              candyMachineId: true,
              slug: true,
            },
          },
        },
      });
    }),
  users: publicProcedure
    .input(
      z.object({
        publicKeys: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.publicKeys) {
        throw new Error("No public keys provided");
      }
      const users = await ctx.prisma.user.findMany({
        where: {
          walletAddress: {
            in: input.publicKeys,
          },
        },
      });
      return users;
    }),
  usersByWallets: publicProcedure
    .input(
      z.object({
        wallets: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.wallets) {
        throw new Error("No wallets provided");
      }
      const users = await ctx.prisma.user.findMany({
        where: {
          walletAddress: {
            in: input.wallets,
          },
        },
      });
      return users;
    }),
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      throw new Error("No wallets provided");
    }
    const users = await ctx.prisma.user.findMany({
      where: {
        walletAddress: {
          in: ctx.session.user.walletAddress,
        },
      },
    });
    return users;
  }),
  adminUser: protectedAdminProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      throw new Error("No wallets provided");
    }
    const user = await ctx.prisma.user.findFirst({
      where: {
        walletAddress: {
          in: ctx.session.user.walletAddress,
        },
      },
      select: {
        walletAddress: true,
        // roles: true
      },
    });
    return {
      ...user,
      isAdmin: ctx.session?.user.isAdmin || ctx.session.user.isSuperAdmin,
    };
  }),
  create: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.create({
        data: {
          walletAddress: input.walletAddress,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });
      return {
        ...user,
      };
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        profileBannerImage: z.string().optional(),
        profilePictureImage: z.string().optional(),
        profileBannerHash: z.string().optional(),
        profilePictureHash: z.string().optional(),
        profilePictureXAxis: z.number().optional(),
        profilePictureYAxis: z.number().optional(),
        profileBannerXAxis: z.number().optional(),
        profileBannerYAxis: z.number().optional(),
        description: z.string().max(160).optional(),
        socialWebLinks: z.array(z.string()).optional(),
        magicSolanaAddress: z.string().optional(),
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        twitter: z.string().optional(),
        facebook: z.string().optional(),
        youtube: z.string().optional(),
        soundcloud: z.string().optional(),
        spotify: z.string().optional(),
        discord: z.string().optional(),
        // magicSolanaAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx?.session?.user?.walletAddress) {
        throw new Error("Not Authorized");
      }
      const user = await ctx.prisma.user.update({
        where: {
          walletAddress: ctx?.session?.user.walletAddress,
        },
        data: {
          name: input.name,
          email: input.email,
          profileBannerImage: input.profileBannerImage,
          profilePictureImage: input.profilePictureImage,
          description: input.description,
          profileBannerHash: input.profileBannerHash,
          profilePictureHash: input.profilePictureHash,
          profilePictureXAxis: input.profilePictureXAxis,
          profilePictureYAxis: input.profilePictureYAxis,
          profileBannerXAxis: input.profileBannerXAxis,
          profileBannerYAxis: input.profileBannerYAxis,
          socialWebLinks: input.socialWebLinks,
          magicSolanaAddress: input.magicSolanaAddress,
          instagram: input.instagram,
          tiktok: input.tiktok,
          twitter: input.twitter,
          facebook: input.facebook,
          spotify: input.spotify,
          discord: input.discord,
          youtube: input.youtube,
          soundcloud: input.soundcloud,

          // socials: {
          //   upsert: {
          //     where: {
          //       userAndSocialType: {
          //         userId: ctx?.session?.user.walletAddress,
          //         type: "INSTAGRAM",
          //       },
          //     },
          //     update: {
          //       url: input.instagram,
          //     },
          //     create: {
          //       url: "input.instagram",
          //       type: "INSTAGRAM",
          //     },
          //   },
          // },
        },
      });
      return {
        ...user,
      };
    }),
  likeUnlikeArtist: publicProcedure
    .input(
      z.object({
        artistAddress: z.string(),
        userAddress: z.string(),
        isLiked: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.prisma.likedUsers.upsert({
        where: {
          likedAddressId_likedByAddress: {
            likedAddressId: input.artistAddress,
            likedByAddress: input.userAddress,
          },
        },
        create: {
          isLiked: input.isLiked,
          likedAddressId: input.artistAddress,
          likedByAddress: input.userAddress,
        },
        update: {
          isLiked: input.isLiked,
        },
      });
      return {
        ...res,
      };
    }),
  followUnfollow: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
        followingAddress: z.string(),
        isFollowing: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.prisma.follow.upsert({
        where: {
          followingFollowAddress: {
            followerAddress: input.userAddress,
            followingAddress: input.followingAddress,
          },
        },
        create: {
          followingAddress: input.followingAddress,
          followerAddress: input.userAddress,
          isFollowing: input.isFollowing,
        },
        update: {
          isFollowing: input.isFollowing,
        },
      });
      return {
        ...res,
      };
    }),
});
