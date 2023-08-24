import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const playlistRouter = createTRPCRouter({
  hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
    return {
      greeting: `Hello ${input ?? "world"}`,
    };
  }),
  // replaces getPlaylist
  byId: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
        currentUserAddress: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.playlistId) {
        throw new Error("No playlistId provided");
      }

      const pID = decodeURIComponent(input.playlistId);
      const playlist = await ctx.prisma.playlists.findUnique({
        where: {
          id: pID,
        },
        include: {
          songs: {
            where: {
              isDuplicate: false,
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
          },
          creator: true,
          // _count: true,
          likes: true,
        },
      });

      const isCreator =
        playlist?.creator?.walletAddress === ctx?.session?.user.walletAddress ||
        false;
      if (!playlist) {
        throw new Error("Playlist not found");
      }
      return {
        ...playlist,
        // isLiked,
        creator: {
          ...playlist.creator,
          isCreator,
        },
      };
    }),
  getFeatured: publicProcedure
    // .input(z.string().nullish())
    .query(async ({ ctx }) => {
      const featuredPlaylist = await ctx.prisma.playlists.findFirst({
        where: {
          isPublic: true,
        },
        include: {
          songs: {
            where: {
              isDuplicate: false,
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
          },
          creator: true,
          // _count: true,
          likes: true,
        },
      });
      return featuredPlaylist;
    }),
  getPlaylistByUser: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!input.walletAddress) {
        return null;
      }
      const user = await ctx.prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
        include: {
          createdPlaylists: {
            include: {
              songs: {
                where: {
                  isDuplicate: false,
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
              },
              creator: true,
              // _count: true,
              likes: true,
            },
          },
        },
      });
      if (input.walletAddress !== ctx.session?.user?.walletAddress) {
        return user?.createdPlaylists.filter((playlist) => playlist.isPublic);
      }
      return user?.createdPlaylists;
    }),
  getTopPlaylists: publicProcedure
    // .input(z.object({ walletAddress: z.string() }))
    .query(async ({ ctx }) => {
      const getTopPlaylists = await ctx.prisma.playlists.findMany({
        take: 6,
        where: {
          isPublic: true,
        },
        include: {
          songs: {
            where: {
              isDuplicate: false,
            },
            include: {
              pinnedImage: true,
            },
          },
          creator: true,
          likes: true,
        },
      });
      return getTopPlaylists;
    }),
  getAllPlaylistsPaginated: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const playlists = await ctx.prisma.playlists.findMany({
        take: limit + 1,
        where: {
          isPublic: true,
        },
        include: {
          _count: true,
          songs: {
            where: {
              isDuplicate: false,
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
          },
          creator: true,
          // _count: true,
          likes: true,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          name: "asc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (playlists.length > limit) {
        const nextItem = playlists.pop();
        nextCursor = nextItem?.id;
      }

      return {
        playlists,
        nextCursor,
      };
    }),
  getLikedPlaylists: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }

      const likedPlaylists = await ctx.prisma.likedPlaylists.findMany({
        where: {
          likedById: user.id,
          isLiked: true,
        },
      });

      const playlists = await ctx.prisma.playlists.findMany({
        where: {
          id: {
            in: likedPlaylists.map((playlist) => playlist.playlistId),
          },
        },
        include: {
          creator: true,
          _count: true,
          likes: true,
          songs: {
            where: {
              isDuplicate: false,
            },
          },
        },
      });
      return playlists;
    }),
  createPlaylist: protectedProcedure
    .input(
      z.object({
        playlistName: z.string(),
        walletAddress: z.string(),
        firstTokenId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx?.session?.user?.walletAddress) {
        throw new Error("Not logged in/Not authorized");
      }
      const playlist = await ctx.prisma.playlists.create({
        data: {
          name: input.playlistName,
          walletAddress: ctx.session.user?.walletAddress,
        },
      });
      return {
        ...playlist,
      };
    }),
  createPlaylistWithTracks: protectedProcedure
    .input(
      z.object({
        playlistName: z.string(),
        walletAddress: z.string(),
        trackId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user?.walletAddress) {
        throw new Error("Not logged in/Not authorized");
      }
      const playlist = await ctx.prisma.playlists.create({
        data: {
          name: input.playlistName,
          walletAddress: ctx.session?.user?.walletAddress,
          songs: {
            connect: {
              id: input.trackId,
            },
          },
        },
      });
      return {
        ...playlist,
      };
    }),
  updatePlaylist: publicProcedure
    .input(
      z.object({
        playlistName: z.string().optional(),
        walletAddress: z.string(),
        playlistDescription: z.string().optional(),
        playlistId: z.string(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error("Not logged in/Not authorized");
      }
      const playlist = await ctx.prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: input.walletAddress,
          },
        },
        data: {
          name: input.playlistName || undefined,
          description: input.playlistDescription || undefined,
          playlistImageUrl: input.imageUrl || undefined,
        },
      });
      return {
        ...playlist,
      };
    }),
  updatePrivatePublicPlaylist: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        playlistId: z.string(),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error("Not logged in/Not authorized");
      }
      const playlist = await ctx.prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: input.walletAddress,
          },
        },
        data: {
          isPublic: input.isPublic,
        },
      });
      return {
        ...playlist,
      };
    }),
  addTrackToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        trackId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user?.walletAddress) {
        throw new Error("Not logged in/Not authorized");
      }
      const playlist = await ctx.prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: ctx.session?.user?.walletAddress,
          },
        },
        data: {
          songs: {
            connect: {
              id: input.trackId,
            },
          },
        },
      });
      return {
        ...playlist,
      };
    }),
  removeTrackFromPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        trackId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user?.walletAddress) {
        throw new Error("Not logged in/Not authorized");
      }
      const playlist = await ctx.prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: ctx.session?.user?.walletAddress,
          },
        },
        data: {
          songs: {
            disconnect: {
              id: input.trackId,
            },
          },
        },
      });
      return {
        ...playlist,
      };
    }),
  likeUnlikePlaylist: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        playlistId: z.string(),
        isLiked: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error("Not logged in/Not authorized");
      }
      const user = await ctx.prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const playlist = await ctx.prisma.likedPlaylists.upsert({
        where: {
          playlistAndLikedBy: {
            playlistId: input.playlistId,
            likedById: user.id,
          },
        },
        create: {
          likedById: user.id,
          playlistId: input.playlistId,
          isLiked: input.isLiked,
        },
        update: {
          isLiked: input.isLiked,
        },
      });
      return {
        ...playlist,
      };
    }),
  deletePlaylist: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
        walletAddress: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error("Not logged in/Not authorized");
      }
      if (!input.playlistId || !input.walletAddress) {
        throw new Error("Playlist ID or wallet address not provided");
      }
      await ctx.prisma.likedPlaylists.deleteMany({
        where: {
          playlistId: input.playlistId,
        },
      });
      await ctx.prisma.playlists.delete({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: input.walletAddress,
          },
        },
        include: {
          likes: true,
          songs: {
            where: {
              isDuplicate: false,
            },
          },
        },
      });
      return {
        status: "success",
      };
    }),
});
