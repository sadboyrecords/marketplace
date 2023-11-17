import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  protectedAdminProcedure,
} from "@/server/api/trpc";
import { type IMint } from "@/utils/types";

export const battleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAllBattles: protectedAdminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.battle.findMany({});
  }),
  getBattleById: publicProcedure
    .input(z.object({ battleId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.battle.findUnique({
        where: {
          id: input.battleId,
        },
        include: {
          battleContestants: {
            include: {
              user: {
                select: {
                  name: true,
                  firstName: true,
                  description: true,
                  walletAddress: true,
                  pinnedProfilePicture: {
                    select: {
                      path: true,
                      width: true,
                      height: true,
                      status: true,
                      ipfsHash: true,
                    },
                  },
                },
              },
              candyMachineDraft: {
                include: {
                  drop: {
                    include: {
                      pinnedImage: {
                        select: {
                          width: true,
                          height: true,
                          path: true,
                          status: true,
                        },
                      },
                      song: {
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
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
  getBattleByIdSummary: publicProcedure
    .input(z.object({ battleId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.battle.findUnique({
        where: {
          id: input.battleId,
        },
        select: {
          id: true,
          displayOnHomePage: true,
          battleName: true,
          isActive: true,
          battleContestants: {
            include: {
              user: {
                select: {
                  name: true,
                  firstName: true,
                  description: true,
                  walletAddress: true,
                  pinnedProfilePicture: {
                    select: {
                      path: true,
                      width: true,
                      height: true,
                      status: true,
                      ipfsHash: true,
                    },
                  },
                },
              },
              candyMachineDraft: {
                include: {
                  drop: {
                    include: {
                      pinnedImage: {
                        select: {
                          width: true,
                          height: true,
                          path: true,
                          status: true,
                        },
                      },
                      song: {
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
                    },
                  },
                },
              },
            },
          },
          battleEndDate: true,
          battleStartDate: true,
          battlePrice: true,
        },
      });
    }),
  getHomePageBattle: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.battle.findFirst({
      where: {
        displayOnHomePage: true,
        isActive: true,
      },
      select: {
        id: true,
        displayOnHomePage: true,
        battleName: true,
        isActive: true,
        battleContestants: {
          include: {
            user: {
              select: {
                name: true,
                firstName: true,
                description: true,
                walletAddress: true,
                pinnedProfilePicture: {
                  select: {
                    path: true,
                    width: true,
                    height: true,
                    status: true,
                    ipfsHash: true,
                  },
                },
              },
            },
            candyMachineDraft: {
              include: {
                drop: {
                  include: {
                    pinnedImage: {
                      select: {
                        width: true,
                        height: true,
                        path: true,
                        status: true,
                      },
                    },
                    song: {
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
                  },
                },
              },
            },
          },
        },
        battleEndDate: true,
        battleStartDate: true,
        battlePrice: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  }),

  createBattle: protectedProcedure
    .input(
      z.object({
        battleName: z.string(),
        battleDescription: z.string().optional(),
        battlePrice: z.number().optional(),
        battleStartDate: z.date(),
        battleEndDate: z.date(),
        royalties: z.number().optional(),
        itemsAvailable: z.number().optional(),
        contestantOne: z.object({
          name: z.string(),
          bio: z.string().optional(),
          walletAddress: z.string(),
          dropData: z.custom<IMint>().optional(),
        }),
        contestantTwo: z.object({
          name: z.string(),
          bio: z.string().optional(),
          walletAddress: z.string(),
          dropData: z.custom<IMint>().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // console.log({ session: ctx.session });
      if (!ctx.session || !ctx.session.user.walletAddress) {
        throw new Error("No wallet address found in session");
      }
      const battle = await ctx.prisma.$transaction(async (tx) => {
        const createdBattle = await tx.battle.create({
          data: {
            isLive: false,
            // createdByWallet: ctx.session.user.walletAddress as string,
            createdBy: {
              connect: {
                walletAddress: ctx.session.user.walletAddress as string,
              },
            },
            displayOnHomePage: false,
            createdByNifty: true,
            battleName: input.battleName,
            battleDescription: input.battleDescription,
            battlePrice: input.battlePrice,
            battleStartDate: input.battleStartDate,
            battleEndDate: input.battleEndDate,
            royalties: input.royalties,
            itemsAvailable: input.itemsAvailable,
            battleContestants: {
              create: {
                primaryArtistName: input.contestantOne.name,
                candyMachineDraft: {
                  create: {
                    currentStep: "CREATED",
                    status: "DRAFT",
                    formSubmission:
                      (input.contestantOne?.dropData as object) || {},
                    startDate: input.battleStartDate,
                    endDate: input.battleEndDate,
                    ownerWalletAddress: ctx.session.user
                      .walletAddress as string,
                    audioUri: input.contestantOne?.dropData?.audioUri,
                    audioIpfsHash: input.contestantOne?.dropData?.audioHash,
                    candyMachineImageUrl:
                      input.contestantOne?.dropData?.imageUri,
                    imageIpfsHash: input.contestantOne?.dropData?.imageHash,
                    description: input.contestantOne?.dropData?.description,
                    dropName: input.contestantOne?.dropData?.collectionName,
                    lowestPrice: input.battlePrice,
                  },
                },
                user: {
                  connectOrCreate: {
                    where: {
                      walletAddress: input.contestantOne.walletAddress,
                    },
                    create: {
                      name: input.contestantOne.name,
                      description: input.contestantOne.bio,
                      walletAddress: input.contestantOne.walletAddress,
                    },
                  },
                },
              },
            },
          },
        });

        return tx.battle.update({
          where: {
            id: createdBattle.id,
          },
          data: {
            battleContestants: {
              create: {
                primaryArtistName: input.contestantTwo.name,
                candyMachineDraft: {
                  create: {
                    currentStep: "CREATED",
                    status: "DRAFT",
                    formSubmission:
                      (input.contestantTwo?.dropData as object) || {},
                    startDate: input.battleStartDate,
                    endDate: input.battleEndDate,
                    ownerWalletAddress: ctx.session.user
                      .walletAddress as string,
                    audioUri: input.contestantTwo?.dropData?.audioUri,
                    audioIpfsHash: input.contestantTwo?.dropData?.audioHash,
                    candyMachineImageUrl:
                      input.contestantTwo?.dropData?.imageUri,
                    imageIpfsHash: input.contestantTwo?.dropData?.imageHash,
                    description: input.contestantTwo?.dropData?.description,
                    dropName: input.contestantTwo?.dropData?.collectionName,
                    lowestPrice: input.battlePrice,
                  },
                },
                user: {
                  connectOrCreate: {
                    where: {
                      walletAddress: input.contestantTwo.walletAddress,
                    },
                    create: {
                      name: input.contestantTwo.name,
                      description: input.contestantTwo.bio,
                      walletAddress: input.contestantTwo.walletAddress,
                    },
                  },
                },
              },
            },
          },
          include: {
            battleContestants: {
              include: {
                candyMachineDraft: true,
                candymachine: true,
                user: {
                  select: {
                    name: true,
                    walletAddress: true,
                    profilePictureHash: true,
                  },
                },
              },
            },
          },
        });
      });
      return battle;
    }),
  updateBattle: protectedProcedure
    .input(
      z.object({
        battleId: z.string(),
        battleName: z.string(),
        battleDescription: z.string().optional(),
        battlePrice: z.number().optional(),
        battleStartDate: z.date(),
        battleEndDate: z.date(),
        royalties: z.number().optional(),
        itemsAvailable: z.number().optional(),
        contestantOneId: z.string().optional(),
        contestantTwoId: z.string().optional(),
        contestantOne: z.object({
          name: z.string(),
          bio: z.string().optional(),
          walletAddress: z.string(),
          dropData: z.custom<IMint>().optional(),
        }),
        contestantTwo: z.object({
          name: z.string(),
          bio: z.string().optional(),
          walletAddress: z.string(),
          dropData: z.custom<IMint>().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // console.log({ session: ctx.session });
      if (!ctx.session || !ctx.session.user.walletAddress) {
        throw new Error("No wallet address found in session");
      }
      const battle = await ctx.prisma.$transaction(async (tx) => {
        // const b = await tx.battle.findUnique({ where: { id: input.battleId } });
        if (!ctx.session.user.isAdmin) {
          throw new Error("Not authoirized");
        }
        const createdBattle = await tx.battle.update({
          where: {
            id: input.battleId,
          },
          data: {
            isLive: false,
            createdBy: {
              connect: {
                walletAddress: ctx.session.user.walletAddress,
              },
            },
            displayOnHomePage: false,
            createdByNifty: true,
            battleName: input.battleName,
            battleDescription: input.battleDescription,
            battlePrice: input.battlePrice,
            battleStartDate: input.battleStartDate,
            battleEndDate: input.battleEndDate,
            royalties: input.royalties,
            itemsAvailable: input.itemsAvailable,
            battleContestants: {
              update: {
                where: {
                  id: input.contestantOneId,
                },
                data: {
                  primaryArtistName: input.contestantOne.name,
                  candyMachineDraft: {
                    update: {
                      currentStep: "CREATED",
                      status: "DRAFT",
                      formSubmission:
                        (input.contestantOne?.dropData as object) || {},
                      startDate: input.battleStartDate,
                      endDate: input.battleEndDate,
                      ownerWalletAddress: ctx.session.user.walletAddress,
                      audioUri: input.contestantOne?.dropData?.audioUri,
                      audioIpfsHash: input.contestantOne?.dropData?.audioHash,
                      candyMachineImageUrl:
                        input.contestantOne?.dropData?.imageUri,
                      imageIpfsHash: input.contestantOne?.dropData?.imageHash,
                      description: input.contestantOne?.dropData?.description,
                      dropName: input.contestantOne?.dropData?.collectionName,
                      lowestPrice: input.battlePrice,
                    },
                  },
                  user: {
                    connectOrCreate: {
                      where: {
                        walletAddress: input.contestantOne.walletAddress,
                      },
                      create: {
                        name: input.contestantOne.name,
                        description: input.contestantOne.bio,
                        walletAddress: input.contestantOne.walletAddress,
                      },
                    },
                    // upsert: {
                    //   create: {
                    //     name: input.contestantOne.name,
                    //     description: input.contestantOne.bio,
                    //     walletAddress: input.contestantOne.walletAddress,
                    //   },
                    //   update: {
                    //     description: input.contestantOne.bio,
                    //   }

                    //   // where: {
                    //   //   walletAddress: input.contestantOne.walletAddress,
                    //   // },
                    //   // create: {
                    //   //   name: input.contestantOne.name,
                    //   //   description: input.contestantOne.bio,
                    //   //   walletAddress: input.contestantOne.walletAddress,
                    //   // }
                    // },
                  },
                },
              },
            },
          },
        });

        return tx.battle.update({
          where: {
            id: createdBattle.id,
          },
          data: {
            battleContestants: {
              update: {
                where: {
                  id: input.contestantTwoId,
                },
                data: {
                  primaryArtistName: input.contestantTwo.name,
                  candyMachineDraft: {
                    update: {
                      currentStep: "CREATED",
                      status: "DRAFT",
                      formSubmission:
                        (input.contestantTwo?.dropData as object) || {},
                      startDate: input.battleStartDate,
                      endDate: input.battleEndDate,
                      ownerWalletAddress: ctx.session.user.walletAddress,
                      audioUri: input.contestantTwo?.dropData?.audioUri,
                      audioIpfsHash: input.contestantTwo?.dropData?.audioHash,
                      candyMachineImageUrl:
                        input.contestantTwo?.dropData?.imageUri,
                      imageIpfsHash: input.contestantTwo?.dropData?.imageHash,
                      description: input.contestantTwo?.dropData?.description,
                      dropName: input.contestantTwo?.dropData?.collectionName,
                      lowestPrice: input.battlePrice,
                    },
                  },
                  user: {
                    connectOrCreate: {
                      where: {
                        walletAddress: input.contestantTwo.walletAddress,
                      },
                      create: {
                        name: input.contestantTwo.name,
                        description: input.contestantTwo.bio,
                        walletAddress: input.contestantTwo.walletAddress,
                      },
                    },
                  },
                },
              },
            },
          },
          include: {
            battleContestants: {
              include: {
                candyMachineDraft: true,
                candymachine: true,
                user: {
                  select: {
                    name: true,
                    walletAddress: true,
                    profilePictureHash: true,
                  },
                },
              },
            },
          },
        });
      });
      return battle;
    }),
  activateBattle: protectedProcedure
    .input(
      z.object({
        battleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const battle = await ctx.prisma.$transaction(async (tx) => {
        const b = await tx.battle.findUnique({ where: { id: input.battleId } });
        if (
          !b?.createdByWallet ||
          b?.createdByWallet !== ctx.session.user.walletAddress
        ) {
          throw new Error("Battle not found");
        }
        const updateBattle = await tx.battle.update({
          where: {
            id: input.battleId,
          },
          data: {
            isActive: true,
          },
          include: {
            battleContestants: {
              include: {
                candyMachineDraft: true,
                candymachine: true,
                user: {
                  select: {
                    name: true,
                    walletAddress: true,
                    profilePictureHash: true,
                  },
                },
              },
            },
          },
        });

        return updateBattle;
      });
      return battle;
    }),
  displayOnHome: protectedAdminProcedure
    .input(
      z.object({
        battleId: z.string(),
        displayOnHome: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const battle = await ctx.prisma.$transaction(async (tx) => {
        // const b = await tx.battle.findUnique({ where: { id: input.battleId } });
        // if (
        //   !b?.createdByWallet ||
        //   b?.createdByWallet !== ctx.session.user.walletAddress
        // ) {
        //   throw new Error("Battle not found");
        // }
        const updateBattle = await tx.battle.update({
          where: {
            id: input.battleId,
          },
          data: {
            displayOnHomePage: input.displayOnHome,
          },
          include: {
            battleContestants: {
              include: {
                candyMachineDraft: true,
                candymachine: true,
                user: {
                  select: {
                    name: true,
                    walletAddress: true,
                    profilePictureHash: true,
                  },
                },
              },
            },
          },
        });

        return updateBattle;
      });
      return battle;
    }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
