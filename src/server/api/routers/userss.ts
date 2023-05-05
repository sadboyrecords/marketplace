import { createRouter } from './context';
import { z } from 'zod';
// import sign from 'utils/sign';
// import SIGNATURE_MESSAGES from 'constants/signature_messages';
// import { prisma } from '@/server/db/client';
// import {
//   router,
//   publicProcedure,
//   protectedAdminProcedure,
//   protectedProcedure,
// } from 'server/trpc';

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";



export const userRouter = router({
  getUser: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (!input.publicKey) {
        throw new Error('No public key provided');
      }
      const user = await prisma.user.findFirst({
        where: {
          walletAddress: input?.publicKey,
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
      if (!user) {
        const newUser = await prisma.user.create({
          data: {
            walletAddress: input.publicKey,
            // firstName: artist.name,
            lastName: '',
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
  users: publicProcedure
    .input(
      z.object({
        publicKeys: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      if (!input.publicKeys) {
        throw new Error('No public keys provided');
      }
      const users = await prisma.user.findMany({
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
    .query(async ({ input }) => {
      if (!input.wallets) {
        throw new Error('No wallets provided');
      }
      const users = await prisma.user.findMany({
        where: {
          walletAddress: {
            in: input.wallets,
          },
        },
      });
      return users;
    }),
  getMyProfile: protectedProcedure.query(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new Error('No wallets provided');
    }
    const users = await prisma.user.findMany({
      where: {
        walletAddress: {
          in: ctx.user.walletAddress,
        },
      },
    });
    return users;
  }),
  adminUser: protectedAdminProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('No wallets provided');
    }
    const user = await prisma.user.findFirst({
      where: {
        walletAddress: {
          in: ctx.user.walletAddress,
        },
      },
      select: {
        walletAddress: true,
        // roles: true
      }
    });
    return {
      ...user,
      isAdmin: ctx.isAdmin || ctx.isSuperAdmin,
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
    .mutation(async ({ input }) => {
      const user = await prisma.user.create({
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
  updateUser: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        profileBannerImage: z.string().optional(),
        profilePictureImage: z.string().optional(),
        profileBannerHash: z.string().optional(),
        profilePictureHash: z.string().optional(),
        profilePictureXAxis: z.number().optional(),
        profilePictureYAxis: z.number().optional(),
        profileBannerXAxis: z.number().optional(),
        profileBannerYAxis: z.number().optional(),
        description: z.string().optional(),
        signature: z.string(),
        socialWebLinks: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { signature, walletAddress } = input;
      console.log({ input });

      if (!signature) {
        throw new Error('No signature provided');
      }

      const isValid = await sign({
        signature,
        message: SIGNATURE_MESSAGES.UPDATE_PROFILE,
        publicKey: walletAddress,
      });

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      const user = await prisma.user.update({
        where: {
          walletAddress: input.walletAddress,
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
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
    .mutation(async ({ input }) => {
      const res = await prisma.likedUsers.upsert({
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
    .mutation(async ({ input }) => {
      const res = await prisma.follow.upsert({
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

export const userRouterOld = createRouter()
  // .query('getUser', {
  //   input: z.object({
  //     publicKey: z.string(),
  //   }),
  //   async resolve({ ctx, input }) {
  //     if (!input.publicKey) {
  //       throw new Error('No public key provided');
  //     }
  //     const user = await ctx.prisma.user.findFirst({
  //       where: {
  //         walletAddress: input?.publicKey,
  //       },
  //       include: {
  //         likedTracks: {
  //           where: {
  //             isLiked: true,
  //           },
  //           include: {
  //             song: {
  //               include: {
  //                 tokens: true,
  //                 creators: true,
  //                 likes: {
  //                   where: {
  //                     userWallet: input?.publicKey,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         likedPlaylists: {
  //           where: {
  //             isLiked: true,
  //           },
  //         },
  //         likedUsers: true,
  //         creatorTokens: true,
  //         followers: {
  //           where: {
  //             isFollowing: true,
  //           },
  //         },
  //         following: {
  //           where: {
  //             isFollowing: true,
  //           },
  //         },
  //       },
  //     });
  //     if (!user) {
  //       const newUser = await ctx.prisma.user.create({
  //         data: {
  //           walletAddress: artist.id,
  //           firstName: artist.name,
  //           lastName: '',
  //         },
  //         include: {
  //           likedTracks: {
  //             where: {
  //               isLiked: true,
  //             },
  //             include: {
  //               song: {
  //                 include: {
  //                   tokens: true,
  //                   creators: true,
  //                   likes: {
  //                     where: {
  //                       userWallet: input?.publicKey,
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           likedPlaylists: {
  //             where: {
  //               isLiked: true,
  //             },
  //           },
  //           likedUsers: true,
  //           creatorTokens: true,
  //           followers: {
  //             where: {
  //               isFollowing: true,
  //             },
  //           },
  //           following: {
  //             where: {
  //               isFollowing: true,
  //             },
  //           },
  //         },
  //       });

  //       return {
  //         ...newUser,
  //       };
  //     }
  //     return {
  //       ...user,
  //     };
  //   },
  // })
  // .query('users', {
  //   input: z.object({
  //     publicKeys: z.array(z.string()),
  //   }),
  //   async resolve({ ctx, input }) {
  //     if (!input.publicKeys) {
  //       throw new Error('No public keys provided');
  //     }
  //     const users = await ctx.prisma.user.findMany({
  //       where: {
  //         walletAddress: {
  //           in: input.publicKeys,
  //         },
  //       },
  //     });
  //     return users;
  //   },
  // })
  // .query('usersByWallets', {
  //   input: z.object({
  //     wallets: z.array(z.string()),
  //   }),
  //   async resolve({ ctx, input }) {
  //     if (!input.wallets) {
  //       throw new Error('No wallets provided');
  //     }
  //     const users = await ctx.prisma.user.findMany({
  //       where: {
  //         walletAddress: {
  //           in: input.wallets,
  //         },
  //       },
  //     });
  //     return users;
  //   },
  // })
  .mutation('create', {
    input: z.object({
      walletAddress: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
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
    },
  })
  .mutation('updateUser', {
    input: z.object({
      walletAddress: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      profileBannerImage: z.string().optional(),
      profilePictureImage: z.string().optional(),
      description: z.string().optional(),
      signature: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { signature, walletAddress, ...rest } = input;

      if (!signature) {
        throw new Error('No signature provided');
      }

      const isValid = await sign({
        publicKey: walletAddress,
        message: SIGNATURE_MESSAGES.UPDATE_PROFILE,
        signature,
      });

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      const user = await ctx.prisma.user.update({
        where: {
          walletAddress: input.walletAddress,
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          profileBannerImage: input.profileBannerImage,
          profilePictureImage: input.profilePictureImage,
          description: input.description,
        },
      });
      return {
        ...user,
      };
    },
  })
  .mutation('likeUnlikeArtist', {
    input: z.object({
      artistAddress: z.string(),
      userAddress: z.string(),
      isLiked: z.boolean(),
    }),
    async resolve({ ctx, input }) {
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
    },
  })
  .mutation('followUnfollow', {
    input: z.object({
      userAddress: z.string(),
      followingAddress: z.string(),
      isFollowing: z.boolean(),
    }),
    async resolve({ ctx, input }) {
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
    },
  });
