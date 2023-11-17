/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "@/server/api/trpc";

export const songRouter = createTRPCRouter({
  checkCanPlay: publicProcedure.query(async ({ ctx }) => {
    const battle = await ctx.prisma.battle.findMany({
      where: {
        AND: [
          {
            isActive: true,
            battleEndDate: {
              gte: new Date(),
            },
          },
        ],
      },
      select: {
        id: true,
        battleContestants: {
          select: {
            primaryArtistName: true,
            candyMachineDraft: {
              select: {
                drop: {
                  select: {
                    dropName: true,
                    candyMachineId: true,
                    transactions: {
                      select: {
                        tokenAddressReferenceOnly: true,
                        tokenAddress: true,
                        receiverWalletAddress: true,
                        receiver: {
                          select: {
                            walletAddress: true,
                            magicSolanaAddress: true,
                            firstName: true,
                            name: true,
                            pinnedProfilePicture: {
                              select: {
                                ipfsHash: true,
                                width: true,
                                height: true,
                                originalUrl: true,
                                path: true,
                                status: true,
                              },
                            },
                          },
                        },
                      },
                    },
                    song: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return battle;
  }),
  getRecentTracks: publicProcedure.query(async ({ ctx }) => {
    // const tokens = await ctx.ctx.prisma.raw_nfts.findMany();
    const recentSongs = await ctx.prisma.songs.findMany({
      take: 8,
      where: {
        lossyAudioURL: {
          not: "",
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });
    // const data = await Promise.allSettled(
    //   recentSongs.map(async (song) => {
    //     const response = await fetch(song.lossyAudioURL);
    //     return { response, song };
    //   })
    // );

    // type songType = typeof recentSongs;

    // const filteredSongs = (
    //   data.filter(
    //     (s) => s.status === "fulfilled"
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   ) as PromiseFulfilledResult<any>[]
    // )
    //   .map((m) => m?.value)
    //   .filter((d) => d?.response?.status === 200)
    //   .map((d) => d?.song);
    // const filteredSongs = recentSongs
    return recentSongs.slice(0, 8);
    // return filteredSongs.slice(0, 8) as songType;
  }),
  getAllSongsPaginated: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 12;
      const { cursor } = input;
      const songs = await ctx.prisma.songs.findMany({
        take: limit + 1,
        where: {
          lossyAudioURL: {
            not: "",
          },
          isDuplicate: false,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          // title: 'asc',
          updatedAt: "desc",
        },
        include: {
          _count: true,
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
      });
      // type songType = typeof songs;

      // const filteredSongs = (
      //   data.filter(
      //     (s) => s.status === 'fulfilled'
      //   ) as PromiseFulfilledResult<any>[]
      // ).map((m) => m?.value).filter((d) => d?.response?.status === 200).map((d) => d?.song);

      let nextCursor: typeof cursor | undefined = undefined;
      if (songs.length > limit) {
        const nextItem = songs.pop();
        nextCursor = nextItem?.id;
      }
      return {
        songs, //filteredSongs as songType,
        nextCursor,
      };
    }),
  getSongInfo: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const song = await ctx.prisma.songs.findUnique({
        where: {
          id: input.id,
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
      return song;
    }),
  getSongDetails: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const song = await ctx.prisma.songs.findUnique({
        where: {
          id: input.id,
        },
        include: {
          creators: true,
          tokens: true,
          pinnedImage: true,
          candyMachines: {
            select: {
              candyMachineId: true,
              slug: true,
            },
          },
        },
      });
      return song;
    }),
  getSongsByCreator: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.publicKey) {
        throw new Error("No public key provided");
      }
      const songs = await ctx.prisma.songs.findMany({
        where: {
          creators: {
            some: {
              walletAddress: input.publicKey,
            },
          },
          lossyAudioURL: {
            not: "",
          },
          isDuplicate: false,
        },
        include: {
          creators: true,
          tokens: true,
          likes: true,
        },
      });
      const filtered = songs.filter((song) => {
        return song.creators.length > 0;
      });

      return filtered;
    }),
  getSongsByToken: publicProcedure
    .input(
      z.object({
        mintAddress: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const song = await ctx.prisma.songs.findFirst({
        where: {
          lossyAudioURL: {
            not: "",
          },
          isDuplicate: false,
          tokens: {
            some: {
              mintAddress: input.mintAddress,
            },
          },
        },
        include: {
          creators: true,
          tokens: true,
          likes: true,
        },
      });

      return {
        ...song,
      };
    }),
  getSongsByUriHash: publicProcedure
    .input(
      z.object({
        // mintAddress: z.string(),
        uri: z.string().optional(),
        hash: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.uri && !input.hash) {
        throw new Error("No uri or hash provided");
      }
      const song = await ctx.prisma.songs.findFirst({
        where: {
          OR: [
            {
              lossyAudioURL: input.uri,
            },
            {
              lossyAudioIPFSHash: input.hash,
            },
          ],
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

      return song;
    }),
  getSuggestedSongs: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        skipIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 12;
      const { cursor } = input;
      const songs = await ctx.prisma.songs.findMany({
        where: {
          id: {
            notIn: input.skipIds,
          },
          lossyAudioURL: {
            not: "",
          },
          isDuplicate: false,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          _count: true,
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
      let nextCursor: typeof cursor | undefined = undefined;
      if (songs.length > limit) {
        const nextItem = songs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        songs,
        nextCursor,
      };
    }),
  likeUnlikeTrack: publicProcedure
    .input(
      z.object({
        userWallet: z.string(),
        trackId: z.string(),
        isLiked: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !ctx.session ||
        ctx.session?.user?.walletAddress !== input.userWallet
      ) {
        throw new Error("Not logged in/Not authorized");
      }
      const likedTrack = await ctx.prisma.likedTracks.upsert({
        where: {
          liked_tracks_track_id_walletAddress_unique: {
            trackId: input.trackId,
            userWallet: input.userWallet,
          },
        },
        create: {
          userWallet: input.userWallet,
          trackId: input.trackId,
          isLiked: input.isLiked,
        },
        update: {
          isLiked: input.isLiked,
        },
      });
      return {
        ...likedTrack,
      };
    }),
});
