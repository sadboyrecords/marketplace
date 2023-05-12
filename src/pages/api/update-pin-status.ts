/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from "@prisma/client";
// import { captureEvent } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ipfsPublicGateway } from "@/utils/constants";
import {
  // hashArray,
  nftAudioPath,
  nftImagePath,
  filebaseEndpoints,
} from "@/utils/helpers";
import sharp from "sharp";
import crypto from "crypto";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export const hashArray = (url: string) => {
  return new Promise(async (resolve) => {
    const hash = crypto.createHash("sha256");
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const data = Buffer.from(arrayBuffer);
    hash.update(data);
    const hashHex = hash.digest("hex");
    console.log({ hashHex });

    resolve(hashHex);
  });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const audioContent = axData?.data;
  try {
    console.log("update-pin-status.ts");
    // use prisma transactions
    // await prisma.pinnedFiles.updateMany({
    //   where: {
    //     type: 'IMAGE',
    //   },
    //   data: {
    //     status: 'PENDING',
    //   }
    // });
    const foundPins = await prisma.pinnedFiles.findMany({
      where: {
        status: {
          equals: "IN_PROGRESS",
        },
        // ipfsHash: "QmNMQd86NWfrYasK6Jg98J4emagJr9UJKuh3KRjswuqmse"
        // status: {
        //   not: 'PINNED',
        // },
      },
      take: 10,
      select: {
        ipfsHash: true,
        type: true,
        width: true,
        height: true,
      },
    });
    console.log({ foundPins });
    const pins = foundPins.map((p) => p.ipfsHash).join(",");
    // console.log({ pins });

    const pinsData = await axios({
      method: "get",
      url: `https://api.filebase.io/v1/ipfs/pins?cid=${pins}&limit=20`,
      headers: {
        Authorization: "Bearer " + process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN,
      },
    });
    // console.log({ pinsData });
    const pinResponse = await pinsData?.data?.results;
    console.log({ pinResponse });

    const pinned: { ipfsHash: string; name: string }[] = await pinResponse
      ?.filter((p: any) => p.status === "pinned")
      .map((p: any) => {
        return {
          ipfsHash: p.pin.cid,
          name: p.pin.name,
        };
      });
    console.log({ pinned });

    const notAdded = foundPins.filter(
      (str) => !pinResponse.some((obj: any) => obj.pin.cid === str.ipfsHash)
    );
    console.log({ notAdded });
    const updatePinsNotAdded: {
      ipfsHash: string;
      width?: number;
      height?: number;
      path: string;
    }[] = [];
    if (notAdded.length > 0) {
      const pdata = await Promise.allSettled(
        notAdded.map(async (p, index) => {
          let width: number | undefined;
          let height: number | undefined;
          let format: string | undefined;
          let path: string | undefined;
          // const response = await fetch(`${ipfsPublicGateway}${p.ipfsHash}`, {});
          const response = await axios.get(
            `${ipfsPublicGateway}${p.ipfsHash}`,
            {
              responseType: "arraybuffer",
              timeout: 15000, // 15 seconds
            }
          );
          // const data = await response.arrayBuffer();
          const data = Buffer.from(response.data);
          if (p.type === "IMAGE") {
            const input = Buffer.from(data);
            const metadata = await sharp(input).metadata();
            // console.log({ metadata });
            width = metadata.width;
            height = metadata.height;
            format = metadata.format;
          }

          const hash = await hashArray(`${ipfsPublicGateway}${p.ipfsHash}`);

          // pin file
          const name = `${
            p.type === "IMAGE" ? nftImagePath : nftAudioPath
          }${hash}${p.type === "IMAGE" ? `.${format}` : ""}`;
          console.log({ name, index });
          path = name;
          const pinnedFile = await axios({
            method: "post",
            url: filebaseEndpoints.pinFile,
            headers: {
              Authorization:
                "Bearer " + process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN,
            },
            data: {
              cid: p.ipfsHash,
              name,
            },
          });
          // console.log({ pinnedFile: pinnedFile?.data });
          // console.log({ pinning, data: pinning?.data });
          return updatePinsNotAdded.push({
            ipfsHash: p.ipfsHash,
            width,
            height,
            path,
          });
        })
      );
      // console.log({ pdata, reason: pdata[0]?.reason?.response });
    }
    console.log({ updatePinsNotAdded });
    await prisma.$transaction(
      async (tx) => {
        if (updatePinsNotAdded.length > 0) {
          await Promise.allSettled(
            updatePinsNotAdded.map(async (p) => {
              return await tx.pinnedFiles.update({
                where: {
                  ipfsHash: p.ipfsHash,
                },
                data: {
                  status: "IN_PROGRESS",
                  path: p.path,
                  width: p.width,
                  height: p.height,
                },
              });
            })
          );
        }
        if (pinned.length > 0) {
          await Promise.allSettled(
            pinned.map(async (p) => {
              const found = foundPins.find((f) => f.ipfsHash === p.ipfsHash);
              console.log({ found });

              return await tx.pinnedFiles.update({
                where: {
                  ipfsHash: p.ipfsHash,
                },
                data: {
                  status: "PINNED",
                  pinnedToFileBase: true,
                  path: p.name,
                },
              });
            })
          );
        }
      },
      {
        timeout: 15000,
      }
    );

    return res.status(200).json({
      success: true,
      pins,
    });
    // const
  } catch (error) {
    console.log("THIS IS AN ERROR", { error });
    // if (process.env.NEXT_ENV !== 'local') {
    //   captureEvent(error as any);
    // }

    res.status(500).json({
      success: false,
      error: JSON.stringify(error),
      // data: req.body?.nftData,
    });
  }
}

//   export default verifySignature(handler);
export default handler;
