import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
  getLookup: protectedAdminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.adminValues.findUnique({
      where: {
        uniqueType: "LOOKUP",
      },
    });
  }),
  createLookup: protectedAdminProcedure
    .input(z.object({ publicKey: z.string(), owner: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.adminValues.create({
        data: {
          publicKey: input.publicKey,
          uniqueType: "LOOKUP",
          ownerKey: input.owner,
        },
      });
    }),
});
