/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Nft } from "@metaplex-foundation/js";
import axios from "axios";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { body } = req;
    // console.log({ body });
    if (!body || !body?.nftData) {
      return res.status(400).json({
        success: false,
        message: "No body",
      });
    }
    console.log("----TOKEN----", process.env.QSTASH_TOKEN);
    const response = await axios({
      method: "post",
      url: `https://qstash.upstash.io/v1/publish/${process.env
        .NEXT_API_ENDPOINT!}index-new-audio-item`,
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN!}`,
        "Content-Type": "application/json",
      },
      data: {
        nftData: {
          nftJson: JSON.stringify(req.body?.nftData),
        },
        fromWeb: true,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.data;
    // console.log({ data });

    res.status(200).json({
      message: "Data sent",
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      message: "There was an error",
    });
    // throw new Error(error as any);
  }
};

export default handler;
