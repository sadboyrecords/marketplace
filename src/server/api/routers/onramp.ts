import { z } from "zod";
import crypto from "crypto";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export type b = StripeOnrampSessionRequest;
// export type x = infer<StripeOnrampSessionRequest>
export const onrampRouter = createTRPCRouter({
  // getMoonpayQuote: protectedProcedure.mutation(async ({ ctx }) => {}),
  signMoonpayUrl: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(({ input }) => {
      // ctx.
      return crypto
        .createHmac("sha256", process.env.MOONPAY_SK as string)
        .update(new URL(input.url).search)
        .digest("base64");
    }),
  // stripeOnramp: protectedProcedure
  //   .input(
  //     z.()
  //     // z.ZodType<StripeOnrampSessionRequest>(
  //     //   z.object({
  //     //     transactionDetails: z.object({
  //     //       destinationCurrency: z.string(),
  //     //       destinationExchangeAmount: z.number(),
  //     //       destinationNetwork: z.string(),
  //     //       sourceCurrency: z.string(),
  //     //       walletAddress: z.object({
  //     //         solana: z.string(),
  //     //       }),
  //     //     }),
  //     //     customerInformation: z.object({
  //     //       address: z.object({
  //     //         city: z.string(),
  //     //         country: z.string(),
  //     //         line1: z.string(),
  //     //         line2: z.string(),
  //     //         postalCode: z.string(),
  //     //         state: z.string(),
  //     //       }),
  //     //       dob: z.object({
  //     //         day: z.number(),
  //     //         month: z.number(),
  //     //         year: z.number(),
  //     //       }),
  //     //       email: z.string(),
  //     //       firstName: z.string(),
  //     //       lastName: z.string(),
  //     //     }),
  //     //   })
  //     // )
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return "";
  //   }),
  //   stripeOnramp: protectedProcedure.input(z.string()),
  // }).mutation(({ input }) => {
  //   // ctx.
  //   //   return crypto
  //   //     .createHmac("sha256", process.env.MOONPAY_SK as string)
  //   //     .update(new URL(input.url).search)
  //   //     .digest("base64");
  //   // }),
});
