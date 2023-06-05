/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SK as string, {
  apiVersion: "2022-11-15",
});
const OnrampSessionResource = Stripe.StripeResource.extend({
  create: Stripe.StripeResource.method({
    method: "POST",
    path: "crypto/onramp_sessions",
  }),
});

const prisma = new PrismaClient();

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ message: "Method not allowed" });
      return;
    }
    if (!req.body) {
      res.status(400).json({ message: "Missing body" });
      return;
    }
    const { transactionDetails, customerInformation } =
      req?.body as StripeOnrampSessionRequest;
    // console.log({ body: req.body?.transactionDetails.walletAddress });
    console.log({ ip: req.socket.remoteAddress });
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const onrampSession = await new OnrampSessionResource(stripe).create({
      // livemode: process.env.NEXT_ENV === "prod",
      transaction_details: {
        destination_currency: transactionDetails.destinationCurrency, // transactionDetails["destination_currency"],
        destination_exchange_amount:
          transactionDetails.destinationExchangeAmount, //transactionDetails["destination_exchange_amount"],
        destination_network: transactionDetails.destinationNetwork, //transactionDetails["destination_network"],
        wallet_addresses: {
          solana: transactionDetails.walletAddress?.solana,
        },
        // wallet_address: transactionDetails.walletAddress?.solana,
        supported_destination_currencies: ["sol"],
        supported_destination_networks: ["solana"],
      },
      // customer_information: customerInformation,
      customer_wallet_address: transactionDetails.walletAddress?.solana,
      customer_ip_address: "104.171.50.199", //req.socket.remoteAddress,
    });
    console.log({ onrampSession });
    res.send({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/ban-ts-comment
      //   @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      clientSecret: onrampSession?.client_secret,
    });
    // res.send({
    //   clientSecret: onrampSession.client_secret,
    // });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: "Internal server error" });
  }
}

//   export default verifySignature(handler);
export default handler;
