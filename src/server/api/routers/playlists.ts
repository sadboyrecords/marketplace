import { createRouter } from './context';
import { z } from 'zod';
import { prisma } from 'server/db/client';
import { router, publicProcedure } from 'server/trpc';

export const playlistRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(async ({ input }) => {
      return {
        greeting: `Hello ${input ?? 'world'}`,
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
    .query(async ({ input }) => {
      if (!input.playlistId) {
        throw new Error('No playlistId provided');
      }

      const pID = decodeURIComponent(input.playlistId);
      const playlist = await prisma.playlists.findUnique({
        where: {
          id: pID,
        },
        select: {
          id: true,
          name: true,
          description: true,
          walletAddress: true,
          isPublic: true,
          userId: true,
          playlistImageUrl: true,
          songs: {
            where: {
              isDuplicate: false,
            },
            include: {
              pinnedImage: true,
              tokens: true,
              creators: true,
              likes: true,
            },
          },
          creator: true,
          likes: {
            where: {
              isLiked: true,
            },
          },
        },
      });

      const isCreator =
        playlist?.creator?.walletAddress === input?.currentUserAddress || false;
      if (!playlist) {
        throw new Error('Playlist not found');
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
    .query(async ({ input }) => {
      const featuredPlaylist = await prisma.playlists.findFirst({
        where: {
          isPublic: true,
          
        },
        include: {
          songs: {
            where: {
              isDuplicate: false,
            },
            include: {
              creators: true,
              tokens: true,
              likes: true,
              pinnedImage: true
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
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
        include: {
          createdPlaylists: {
            include: {
              // tracks: true,
              songs: {
                where: {
                  isDuplicate: false,
                }
              },
              likes: true,
              creator: true,
            },
          },
        },
      });
      return user?.createdPlaylists;
    }),
  getTopPlaylists: publicProcedure
    // .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const getTopPlaylists = await prisma.playlists.findMany({
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
            }
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
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const playlists = await prisma.playlists.findMany({
        take: limit + 1,
        where: {
          isPublic: true,
        },
        include: {
          creator: true,
          _count: true,
          likes: true,
          songs: {
            where: {
              isDuplicate: false,
            },
            include: {
              tokens: {
                select: {
                  mintAddress: true,
                }
              },
            }
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          name: 'asc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (playlists.length > limit) {
        const nextItem = playlists.pop();
        nextCursor = nextItem!.id;
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
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const likedPlaylists = await prisma.likedPlaylists.findMany({
        where: {
          likedById: user.id,
          isLiked: true,
        },
      });

      const playlists = await prisma.playlists.findMany({
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
            }
          },
        },
      });
      return playlists;
    }),
  createPlaylist: publicProcedure
    .input(
      z.object({
        playlistName: z.string(),
        walletAddress: z.string(),
        firstTokenId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await prisma.playlists.create({
        data: {
          name: input.playlistName,
          walletAddress: input.walletAddress,
        },
      });
      return {
        ...playlist,
      };
    }),
  createPlaylistWithTracks: publicProcedure
    .input(
      z.object({
        playlistName: z.string(),
        walletAddress: z.string(),
        trackId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await prisma.playlists.create({
        data: {
          name: input.playlistName,
          walletAddress: input.walletAddress,
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
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await prisma.playlists.update({
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
  updatePrivatePublicPlaylist: publicProcedure
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
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await prisma.playlists.update({
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
  addTrackToPlaylist: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
        walletAddress: z.string(),
        trackId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log({ input });
      // ctx.
      // console.log({ session: ctx.session })
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: input.walletAddress,
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
  removeTrackFromPlaylist: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
        walletAddress: z.string(),
        trackId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // console.log({ session: ctx.session })
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: input.walletAddress,
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
        throw new Error('Not logged in/Not authorized');
      }
      const user = await prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      const playlist = await prisma.likedPlaylists.upsert({
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
        throw new Error('Not logged in/Not authorized');
      }
      if (!input.playlistId || !input.walletAddress) {
        throw new Error('Playlist ID or wallet address not provided');
      }
      await prisma.likedPlaylists.deleteMany({
        where: {
          playlistId: input.playlistId,
        },
      });
      const playlist = await prisma.playlists.delete({
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
            }
          },
        },
      });
      return {
        status: 'success',
      };
    }),
});

export const playlistRouterOld = createRouter()
  .query('getPlaylist', {
    input: z.object({
      playlistId: z.string(),
      currentUserAddress: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      if (!input.playlistId) {
        throw new Error('No playlistId provided');
      }

      const pID = decodeURIComponent(input.playlistId);
      const playlist = await ctx.prisma.playlists.findUnique({
        where: {
          id: pID,
        },
        select: {
          id: true,
          name: true,
          description: true,
          walletAddress: true,
          isPublic: true,
          userId: true,
          playlistImageUrl: true,
          songs: {
            include: {
              tokens: true,
              creators: true,
              likes: true,
            },
          },
          creator: true,
          likes: {
            where: {
              isLiked: true,
            },
          },
        },
      });

      const isCreator =
        playlist?.creator?.walletAddress === input?.currentUserAddress || false;
      if (!playlist) {
        throw new Error('Playlist not found');
      }
      return {
        ...playlist,
        // isLiked,
        creator: {
          ...playlist.creator,
          isCreator,
        },
      };
    },
  })
  .query('getPlaylistByUser', {
    input: z.object({ walletAddress: z.string() }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
        include: {
          createdPlaylists: {
            include: {
              // tracks: true,
              songs: {
                where: {
                  isDuplicate: false,
                },
              },
              likes: true,
              creator: true,
            },
          },
        },
      });
      return user?.createdPlaylists;
    },
  })
  .query('getTopPlaylists', {
    async resolve({ ctx }) {
      const getTopPlaylists = await ctx.prisma.playlists.findMany({
        take: 6,
        where: {
          isPublic: true,
        },
        include: {
          songs: {
            where: {
              isDuplicate: false,
            }
          },
          creator: true,
          likes: true,
        },
      });
      return getTopPlaylists;
    },
  })
  .query('getFeaturedPlaylist', {
    async resolve({ ctx }) {
      const featuredPlaylist = await ctx.prisma.playlists.findFirst({
        where: {
          isPublic: true,
        },
        include: {
          songs: {
            include: {
              creators: true,
              tokens: true,
              likes: true,
            },
          },
          creator: true,
          // _count: true,
          likes: true,
        },
      });
      return featuredPlaylist;
    },
  })
  .query('getAllPlaylistsPaginated', {
    input: z.object({
      cursor: z.string().optional(),
      skip: z.number().optional(),
      limit: z.number().min(1).max(100).optional(),
    }),
    async resolve({ ctx, input }) {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const playlists = await ctx.prisma.playlists.findMany({
        take: limit + 1,
        where: {
          isPublic: true,
        },
        include: {
          creator: true,
          _count: true,
          likes: true,
          songs: {
            where: {
              isDuplicate: false,
            }
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          name: 'asc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (playlists.length > limit) {
        const nextItem = playlists.pop();
        nextCursor = nextItem!.id;
      }

      return {
        playlists,
        nextCursor,
      };
    },
  })
  .mutation('createPlaylist', {
    input: z.object({
      playlistName: z.string(),
      walletAddress: z.string(),
      firstTokenId: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await ctx.prisma.playlists.create({
        data: {
          name: input.playlistName,
          walletAddress: input.walletAddress,
        },
      });
      return {
        ...playlist,
      };
    },
  })
  .mutation('createPlaylistWithTracks', {
    input: z.object({
      playlistName: z.string(),
      walletAddress: z.string(),
      trackId: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await ctx.prisma.playlists.create({
        data: {
          name: input.playlistName,
          walletAddress: input.walletAddress,
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
    },
  })
  .mutation('updatePlaylist', {
    input: z.object({
      playlistName: z.string().optional(),
      walletAddress: z.string(),
      playlistDescription: z.string().optional(),
      playlistId: z.string(),
      imageUrl: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
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
    },
  })
  .mutation('updatePrivatePublicPlaylist', {
    input: z.object({
      walletAddress: z.string(),
      playlistId: z.string(),
      isPublic: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
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
    },
  })
  .mutation('addTrackToPlaylist', {
    input: z.object({
      playlistId: z.string(),
      walletAddress: z.string(),
      trackId: z.string(),
    }),
    async resolve({ ctx, input }) {
      console.log({ input });
      // ctx.
      // console.log({ session: ctx.session })
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await ctx.prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: input.walletAddress,
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
    },
  })
  .mutation('removeTrackFromPlaylist', {
    input: z.object({
      playlistId: z.string(),
      walletAddress: z.string(),
      trackId: z.string(),
    }),
    async resolve({ ctx, input }) {
      // console.log({ session: ctx.session })
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const playlist = await ctx.prisma.playlists.update({
        where: {
          userWalletAndPlaylistId: {
            id: input.playlistId,
            walletAddress: input.walletAddress,
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
    },
  })
  .mutation('likeUnlikePlaylist', {
    input: z.object({
      walletAddress: z.string(),
      playlistId: z.string(),
      isLiked: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      const user = await ctx.prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
      });
      if (!user) {
        throw new Error('User not found');
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
    },
  })
  .query('getLikedPlaylists', {
    input: z.object({
      walletAddress: z.string(),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findUnique({
        where: {
          walletAddress: input.walletAddress,
        },
      });
      if (!user) {
        throw new Error('User not found');
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
            }
          },
        },
      });
      return playlists;
    },
  })
  .mutation('deletePlaylist', {
    input: z.object({
      playlistId: z.string(),
      walletAddress: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (
        !ctx.session ||
        ctx.session.user?.walletAddress !== input.walletAddress
      ) {
        throw new Error('Not logged in/Not authorized');
      }
      if (!input.playlistId || !input.walletAddress) {
        throw new Error('Playlist ID or wallet address not provided');
      }
      await ctx.prisma.likedPlaylists.deleteMany({
        where: {
          playlistId: input.playlistId,
        },
      });
      const playlist = await ctx.prisma.playlists.delete({
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
            }
          },
        },
      });
      return {
        status: 'success',
      };
    },
  });

// search playlist
// filter playlist
