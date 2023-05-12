/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";
import { routes } from "@/utils/constants";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { externalID } = req.query;
    if (!externalID) {
      // throw new Error("No externalID provided");
      res.status(500).json({
        error: "No externalID provided",
      });
      return;
    }
    const updates = await prisma.candyMachineDraft.findFirst({
      where: {
        externalID: {
          equals: externalID as string,
        },
        partnerCode: {
          equals: "BRIDG3",
        },
      },
      select: {
        status: true,
        isPublished: true,
        drop: {
          select: {
            lowestPrice: true,
            slug: true,
            totalMinted: true,
            items: true,
            _count: {
              select: {
                likes: {
                  where: {
                    isLiked: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const totalAmountSol =
      updates?.drop?.totalMinted && updates?.drop?.lowestPrice
        ? updates?.drop?.totalMinted * updates?.drop?.lowestPrice
        : null;
    let priceInUsd = null;
    if (totalAmountSol) {
      const response = await fetch("https://price.jup.ag/v1/price?id=sol");
      const data = await response.json();
      const price = data?.data?.price;
      priceInUsd = price ? totalAmountSol * price : null;
    }
    res.status(200).json({
      drop: {
        // ...updates?.drop,
        likes: updates?.drop?._count?.likes,
        totalMinted: updates?.drop?.totalMinted,
        items: updates?.drop?.items,
        totalAmountSol,
        priceInUsd,
        status: updates?.status,
        isPublished: updates?.isPublished,
        url: updates?.drop?.slug
          ? process.env.NEXT_NIFTY_URL + routes.dropDetails(updates?.drop?.slug)
          : null,
      },
    });
    // const { limit = 50, cursor, externalID } = req.query;
    // const candyMachines = await prisma.candyMachineDraft.findMany({
    //   take: Number(limit) + 1,
    //   where: {

    //   },
    //   include: {
    //     creators: true,
    //     likes: true,
    //     song: {
    //       include: {
    //         tokens: true,
    //         creators: true,
    //         pinnedImage: true,
    //         candyMachines: {
    //           select: {
    //             candyMachineId: true,
    //             slug: true,
    //           },
    //         },
    //       },
    //     },
    //     pinnedImage: {
    //       select: {
    //         path: true,
    //         pinnedToFileBase: true,
    //         width: true,
    //         height: true,
    //         status: true,
    //       },
    //     },
    //   },
    //   cursor: cursor ? { id: cursor } : undefined,
    //   orderBy: {
    //     // title: 'asc',
    //     createdAt: 'asc',
    //   },
    // });
    // let nextCursor: typeof cursor | undefined = undefined;
    // if (candyMachines.length > limit) {
    //   const nextItem = candyMachines.pop();
    //   nextCursor = nextItem!.id;
    // }
    // const count = await prisma.candyMachines.count({
    //   where: {
    //     startDate: {
    //       lte: new Date(),
    //     },
    //     endDate: {
    //       gte: new Date(),
    //     },
    //   },
    // });
    // return {
    //   candyMachines,
    //   nextCursor,
    //   count,
    // };
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "there was an error",
    });
  }
};

export default examples;
