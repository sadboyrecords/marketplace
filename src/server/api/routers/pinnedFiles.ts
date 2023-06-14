/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
// import { prisma } from 'server/db/client';

import { ipfsPublicGateway } from "@/utils/constants";
import { filebaseEndpoints } from "@/utils/helpers";
import axios from "axios";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

interface Pin {
  pin: {
    cid: string;
    name: string;
  };
  status: string;
  // Add other properties here if needed
}

interface PinsResult {
  results: Pin[];
  // Add other properties here if needed
}

export const pinnedFilesRouter = createTRPCRouter({
  createUpdateImage: protectedProcedure
    .input(
      z.object({
        width: z.number(),
        height: z.number(),
        ipfsHash: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pinsData = await axios({
        method: "get",
        url: `${filebaseEndpoints.getPins}?cid=${input.ipfsHash}`,
        headers: {
          Authorization: `Bearer ${
            process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN ?? ""
          }`,
        },
      });
      const pins: PinsResult = await pinsData.data;
      const foundPin: Pin | undefined = pins?.results?.find(
        (p: Pin) => p.pin.cid === input.ipfsHash
      );
      console.log({ foundPin });
      return await ctx.prisma.pinnedFiles.upsert({
        where: {
          ipfsHash: input.ipfsHash,
        },
        create: {
          ipfsHash: input.ipfsHash,
          path: input.path,
          width: input.width,
          height: input.height,
          status: foundPin?.status === "pinned" ? "PINNED" : "IN_PROGRESS",
          type: "IMAGE",
          pinnedToFileBase: foundPin?.status === "pinned" ? true : false,
          originalUrl: `${ipfsPublicGateway}${input.ipfsHash}`,
        },
        update: {
          path: foundPin?.pin?.name,
          height: input.height,
          width: input.width,
          status: foundPin?.status === "pinned" ? "PINNED" : "IN_PROGRESS",
          pinnedToFileBase: foundPin?.status === "pinned" ? true : false,
          originalUrl: `${ipfsPublicGateway}${input.ipfsHash}`,
        },
      });
    }),
  createUpdateAudio: protectedProcedure
    .input(
      z.object({
        ipfsHash: z.string(),
        path: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pinsData = await axios({
        method: "get",
        url: `${filebaseEndpoints.getPins}?cid=${input.ipfsHash}`,
        headers: {
          Authorization: `Bearer ${
            process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN ?? ""
          }`,
        },
      });
      const pins = await pinsData.data;
      const foundPin = pins?.results.find(
        (p: Pin) => p.pin.cid === input.ipfsHash
      );
      console.log({ foundPin });
      return await ctx.prisma.pinnedFiles.upsert({
        where: {
          ipfsHash: input.ipfsHash,
        },
        create: {
          ipfsHash: input.ipfsHash,
          path: input.path,
          status: foundPin?.status === "pinned" ? "PINNED" : "IN_PROGRESS",
          type: "AUDIO",
          originalUrl: `${ipfsPublicGateway}${input.ipfsHash}`,
        },
        update: {
          status: foundPin?.status === "pinned" ? "PINNED" : "IN_PROGRESS",
          originalUrl: `${ipfsPublicGateway}${input.ipfsHash}`,
        },
      });
    }),
});
