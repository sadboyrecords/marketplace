import { z } from "zod";

import {
  createTRPCRouter,
  protectedAdminProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { convertToSlug } from "@/utils/helpers";
import type { PrismaClient } from "@prisma/client";

async function createUniqueSlug(
  prisma: PrismaClient,
  slug: string
): Promise<string> {
  // let uniqueSlug = slug
  //   .toLowerCase()
  //   .replace(/[^a-zA-Z0-9 -]/g, "")
  //   .replace(/ /g, "-");
  let uniqueSlug = convertToSlug(slug).toLowerCase();
  let counter = 1;
  let checking = true;
  // const maxAttempts = 100;
  // let continue = true

  while (checking) {
    try {
      const existingLeak = await prisma.leaks.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existingLeak) {
        checking = false;
        break;
      }
    } catch (error) {
      console.log({ error });
      throw new Error(`Error finding challenge with "${uniqueSlug}"`);
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  console.log({ uniqueSlug });
  return uniqueSlug;
}

async function createUniqueSlugSong(
  prisma: PrismaClient,
  slug: string
): Promise<string> {
  let uniqueSlug = slug
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .replace(/ /g, "-");
  let counter = 1;
  let checking = true;
  // const maxAttempts = 100;
  // let continue = true

  while (checking) {
    try {
      const existingSong = await prisma.songs.findUnique({
        where: {
          slug: uniqueSlug,
        },
      });

      if (!existingSong) {
        checking = false;
        break;
      }
    } catch (error) {
      console.log({ error });
      throw new Error(`Error finding challenge with "${uniqueSlug}"`);
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  console.log({ uniqueSlug });
  return uniqueSlug;
}

export const leaksRouter = createTRPCRouter({
  getLeak: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.leaks.findFirst({
        where: {
          slug: input.slug,
        },
        include: {
          songs: {
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
                  pinnedProfilePicture: true,
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
          pinnedImage: true,
        },
      });
    }),
  getFeaturedLeaks: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.leaks.findMany({
      where: {
        isFeatured: true,
      },
      include: {
        songs: true,
      },
    });
  }),
  getAllLeaks: protectedAdminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.leaks.findMany({
      // where: {
      //   isFeatured: true,
      // },
      // include: {
      //   songs: true,
      // },
    });
  }),
  createLeak: protectedAdminProcedure
    .input(
      z.object({
        artistName: z.string(),
        leakName: z.string(),
        artistWalletAddress: z.string(),
        songTitle: z.string(),
        audioHash: z.string(),
        audioUrl: z.string(),
        imageHash: z.string(),
        imageUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const leakSlug = await createUniqueSlug(ctx.prisma, input.leakName);
      const songSlug = await createUniqueSlugSong(ctx.prisma, input.songTitle);
      return ctx.prisma.leaks.create({
        data: {
          slug: leakSlug,
          imageIpfsHash: input.imageHash,
          leakName: input.leakName,
          songs: {
            connectOrCreate: {
              where: {
                lossyAudioIPFSHash: input.audioHash,
              },
              create: {
                lossyAudioURL: input.audioUrl,
                slug: songSlug,
                lossyAudioIPFSHash: input.audioHash,
                title: input.songTitle,
                lossyArtworkIPFSHash: input.imageHash,
                lossyArtworkURL: input.imageUrl,
                creators: {
                  connectOrCreate: {
                    where: {
                      walletAddress: input.artistWalletAddress,
                    },
                    create: {
                      walletAddress: input.artistWalletAddress,
                      name: input.artistName,
                    },
                  },
                },
              },
            },
          },
          isPublic: false,
          // audioUri: input.audioUrl,
          // audioIpfsHash: input.audioHash,

          // artistWalletAddress: input.artistWalletAddress,
          // songTitle: input.songTitle,
        },
      });
      // ctx.prisma.user.create({
      //     data: {
      //     }
      // })
      //   return await ctx.prisma. ({
      //     data: {
      //       publicKey: input.publicKey,
      //       uniqueType: "LOOKUP",
      //       ownerKey: input.owner,
      //     },
      //   });
    }),
  update: protectedAdminProcedure
    .input(
      z.object({
        leakName: z.string().optional(),
        imageHash: z.string().optional(),
        imageUrl: z.string().optional(),
        disconnctAudioHash: z.string().optional(),
        leakId: z.string(),
        songInfo: z
          .object({
            artistWalletAddress: z.string(),
            songTitle: z.string(),
            audioHash: z.string(),
            audioUrl: z.string(),
            artistName: z.string(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let leakSlug: string | null = null;
      if (input.leakName) {
        leakSlug = await createUniqueSlug(ctx.prisma, input.leakName);
      }
      let songSlug: string | null = null;
      if (input.songInfo) {
        songSlug = await createUniqueSlugSong(
          ctx.prisma,
          input.songInfo.songTitle
        );
      }

      const leaks = ctx.prisma.leaks.update({
        where: {
          id: input.leakId,
        },
        data: {
          slug: leakSlug || undefined,
          imageIpfsHash: input.imageHash,
          leakName: input.leakName,

          songs:
            input.songInfo || input.disconnctAudioHash
              ? {
                  connectOrCreate: input.songInfo
                    ? {
                        where: {
                          lossyAudioIPFSHash: input.songInfo.audioHash,
                        },
                        create: {
                          lossyAudioURL: input.songInfo.audioUrl,
                          slug: songSlug as string,
                          lossyAudioIPFSHash: input.songInfo.audioHash,
                          title: input.songInfo.songTitle,
                          lossyArtworkIPFSHash: input.imageHash,
                          lossyArtworkURL: input.imageUrl,
                          creators: {
                            connectOrCreate: {
                              where: {
                                walletAddress:
                                  input.songInfo.artistWalletAddress,
                              },
                              create: {
                                walletAddress:
                                  input.songInfo.artistWalletAddress,
                                name: input.songInfo.artistName,
                              },
                            },
                          },
                        },
                      }
                    : undefined,
                  disconnect: {
                    lossyAudioIPFSHash: input.disconnctAudioHash,
                  },
                }
              : undefined,
        },
      });

      // if (input.disconnctAudioHash) {
      //   await ctx.prisma.songs.delete({
      //     where: {
      //       lossyAudioIPFSHash: input.disconnctAudioHash,
      //     },
      //   });
      // }
      return leaks;
    }),
  displayOnHomePage: protectedAdminProcedure
    .input(
      z.object({
        leakId: z.string(),
        featureOnHome: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.leaks.update({
        where: {
          id: input.leakId,
        },
        data: {
          isFeatured: input.featureOnHome,
        },
      });
    }),
  activateLeak: protectedAdminProcedure
    .input(
      z.object({
        leakId: z.string(),
        activate: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.leaks.update({
        where: {
          id: input.leakId,
        },
        data: {
          isPublic: input.activate,
        },
      });
    }),
});
