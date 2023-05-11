/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from "next";
import { type Nft } from "@metaplex-foundation/js";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { verifySignature } from "@upstash/qstash/nextjs";
import { sign } from "aws4";
import { type Method } from "axios";
// import { captureEvent } from '@sentry/nextjs';
import { nftAudioPath, nftImagePath, filebaseEndpoints } from "@/utils/helpers";
import sharp from "sharp";
import axios from "axios";
import { getHashAndUriFromNFT } from "@/utils/helpers";
import crypto from "crypto";

import S3 from "aws-sdk/clients/s3";

export const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.NEXT_FILEBASE_KEY,
  secretAccessKey: process.env.NEXT_FILEBASE_SECRET,
  region: "us-east-1",
  endpoint: "https://s3.filebase.com",
  signatureVersion: "v4",
  s3ForcePathStyle: true,
});

export const hashArray = (url: string) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    const hash = crypto.createHash("sha256");
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const data = Buffer.from(arrayBuffer);
    hash.update(data);
    const hashHex = hash.digest("hex");
    console.log({ hashHex });

    resolve(hashHex);

    // const hashBuffer = await crypto.subtle.digest(
    //   'SHA-256',
    //   arrayBuffer as ArrayBuffer
    // );
    // const hashArray = Array.from(new Uint8Array(hashBuffer));
    // const hashHex = hashArray
    //   .map((b) => b.toString(16).padStart(2, '0'))
    //   .join('');
    // resolve(hashHex);
  });
};

const prisma = new PrismaClient();

type Data = {
  success?: boolean;
  message?: string;
  data?: string[];
  error?: string;
};

interface SignedRequest {
  method: Method;
  service: string;
  region: string;
  host: string;
  headers: Record<string, string>;
  body: string;
}

async function isAudio(url: string) {
  // Fetch the URL and get the response
  try {
    const response = await fetch(url);

    // Check the content-type of the response
    if (response?.headers?.get("content-type")?.startsWith("audio/")) {
      // If it's an audio file, return true
      return true;
    } else {
      // If it's not an audio file, return false
      return false;
    }
  } catch (error) {
    return false;
  }
}

const {
  UPDATE_AUDIO_LAMBDA_URL: FUNCTION_URL,
  NIFTY_BACKEND_ROLE_IAM_ACCESS_KEY_ID: ACCESS_KEY_ID,
  NIFTY_BACKEND_ROLE_IAM_SECRET: SECRET,
} = process.env;
const functionUrl = FUNCTION_URL ?? "";
const { host } = new URL(functionUrl);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // const audioContent = axData?.data;
  try {
    console.log({ host, functionUrl });
    const { body } = req;
    // console.log({ body });

    // console.log({ audioContent });
    if (!body || !body.nftData) {
      return res.status(400).json({
        success: false,
        message: "No body",
      });
    }
    // const bodyParsed = JSON.parse(body);
    let nftData: Nft = JSON.parse(body?.nftData?.nftJson);
    console.log({ nftData });
    const audioFile = nftData?.json?.properties?.files?.filter(
      (f: any) =>
        f?.type?.includes("audio") ||
        f?.file_type?.includes("audio") ||
        f?.fileType?.includes("audio")
    );
    console.log({ audioFile });
    if (!audioFile || audioFile?.length === 0) {
      const getFiles = nftData.json?.properties?.files?.map((f: any) => {
        return new Promise(async (resolve, reject) => {
          const urlIsAUdio = await isAudio(f?.uri);
          console.log({ urlIsAUdio, f });
          if (urlIsAUdio) {
            resolve({
              ...f,
              type: "audio/mp3",
            });
          }
          resolve(f);
        });
      });
      // @ts-ignore
      const files = await Promise.all(getFiles);
      nftData = {
        ...nftData,
        json: {
          ...nftData.json,
          properties: {
            ...nftData.json?.properties,
            // @ts-ignore
            files,
          },
        },
      };
    }

    console.log({ json: nftData.json });
    let imageWidth: number | undefined;
    let imageHeight: number | undefined;
    if (nftData.json?.image) {
      const imageUrl = nftData.json.image;
      const input = (
        await axios({ url: imageUrl, responseType: "arraybuffer" })
      ).data as Buffer;
      const metaData = await sharp(input).metadata();
      // console.log({ metaData })
      const { width, height } = metaData;
      console.log({ width, height });
      imageHeight = height;
      imageWidth = width;
    }

    // console.log({ files: nftData.json?.properties?.files });
    //
    const results = [];
    const nftJson = nftData.json;
    const { audioHash, audioUrl, imageHash, imageUrl } =
      getHashAndUriFromNFT(nftData);
    let newImageHash = imageHash;
    let path: string | undefined;
    let newAudioHash = audioHash;
    let audioPath: string | undefined;

    if (!imageHash && imageUrl) {
      const response = await fetch(imageUrl);
      const imageData = await response.arrayBuffer();
      const input = Buffer.from(imageData);
      const uniqueImageHash = await hashArray(imageUrl);

      const metaData = await sharp(input).metadata();

      const { width, height, format } = metaData;
      const key = `${nftImagePath}${uniqueImageHash}${format && "." + format}`;
      const type = "image/" + format;
      // console.log({ type, width, height, format, key });
      imageWidth = width;
      imageHeight = height;
      const params = {
        Bucket: process.env.NEXT_FILEBASE_BUCKET_NAME,
        Key: key,
        ContentType: type,
        Expires: 60,
      };
      console.log("upload------");
      const url = s3.getSignedUrl("putObject", params);
      const { headers } = await axios.put(url, imageData, {
        headers: {
          "Content-Type": type,
          // 'Access-Control-Allow-Origin': '*',
        },
      });
      const cid = headers["x-amz-meta-cid"];
      console.log({ cid });
      newImageHash = cid;
      path = key;
    }
    if (!audioHash && audioUrl) {
      const response = await fetch(audioUrl);
      const audioData = await response.arrayBuffer();
      const uniqueHash = await hashArray(audioUrl);
      const key = `${nftAudioPath}${uniqueHash}`;
      const audioFile = nftJson?.properties?.files?.filter((f: any) =>
        f.type.includes("audio")
      );
      const type = audioFile?.[0]?.type || "audio/mp3";
      console.log("Audio------", { key });
      const params = {
        Bucket: process.env.NEXT_FILEBASE_BUCKET_NAME,
        Key: key,
        ContentType: type,
        Expires: 60,
      };
      console.log("upload--AUDIO----");
      const url = s3.getSignedUrl("putObject", params);
      const { headers } = await axios.put(url, audioData, {
        headers: {
          "Content-Type": type,
          // 'Access-Control-Allow-Origin': '*',
        },
      });
      const cid = headers["x-amz-meta-cid"];
      console.log({ cid });
      newAudioHash = cid;
      audioPath = key;
    }

    const pinsData = await axios({
      method: "get",
      url: `${filebaseEndpoints.getPins}?cid=${newImageHash},${newAudioHash}`,
      headers: {
        Authorization: "Bearer " + process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN,
      },
    });
    const pins = await pinsData.data;
    console.log({ pins });
    const foundImage = pins?.results.find(
      (p: any) => p.pin.cid === newImageHash
    );
    const foundAudio = pins?.results.find(
      (p: any) => p.pin.cid === newAudioHash
    );
    let isPinnedImage = foundImage?.status === "pinned";
    let isPinnedAudio = foundAudio?.status === "pinned";

    console.log({
      audioUrl,
      // ipfsHash,
      imageHash,
      // imageIpfsHash,
      audioHash,
      newAudioHash,
      newImageHash,
      isPinnedAudio,
      isPinnedImage,
      foundAudio,
      foundImage,
    });

    if (imageHash && !foundImage && nftData.json?.image) {
      console.log("----IMAGE IS NOT PINNED----");

      const response = await fetch(nftData.json?.image);
      const imageData = await response.arrayBuffer();
      const input = Buffer.from(imageData);
      const uniqueImageHash = await hashArray(nftData.json?.image);

      const metaData = await sharp(input).metadata();

      const { width, height, format } = metaData;
      imageWidth = width;
      imageHeight = height;
      const key = `${nftImagePath}${uniqueImageHash}${format && "." + format}`;
      const { data } = await axios({
        method: "post",
        url: filebaseEndpoints.pinFile,
        headers: {
          Authorization:
            "Bearer " + process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN,
        },
        data: {
          cid: imageHash,
          name: key,
        },
      });
      path = key;
      console.log({ pinnedImage: data, pin: data?.pin });
    }
    if (audioHash && !foundAudio && audioUrl) {
      console.log("----AUDIO IS NOT PINNED----");
      const response = await fetch(audioUrl);
      const audioData = await response.arrayBuffer();
      const uniqueHash = await hashArray(audioUrl);
      await axios({
        method: "post",
        url: filebaseEndpoints.pinFile,
        headers: {
          Authorization:
            "Bearer " + process.env.NEXT_FILEBASE_NIFTYBUCKET_TOKEN,
        },
        data: {
          cid: newAudioHash,
          name: `${nftAudioPath}${uniqueHash}`,
        },
      });
      audioPath = `${nftAudioPath}${uniqueHash}`;
    }

    await prisma.$transaction(
      async (tx) => {
        if (imageHash && !foundImage && nftData.json?.image) {
          await tx.pinnedFiles.upsert({
            where: {
              ipfsHash: imageHash,
            },
            update: {},
            create: {
              ipfsHash: newImageHash as string,
              path: path as string,
              status: "IN_PROGRESS",
              type: "IMAGE",
              width: imageWidth,
              height: imageHeight,
              originalUrl: nftData.json?.image,
            },
          });
        }
        if (audioHash && !foundAudio && audioUrl) {
          await tx.pinnedFiles.upsert({
            where: {
              ipfsHash: audioHash,
            },
            update: {},
            create: {
              ipfsHash: audioHash,
              path: path as string,
              status: "IN_PROGRESS",
              type: "AUDIO",
              originalUrl: audioUrl,
            },
          });
        }
        if (foundImage && foundImage?.status === "pinned") {
          // image was found in filebase and it's pinned
          isPinnedImage = true;
          path = foundImage?.pin?.name;
          console.log("----IMAGE IS PINNED----", { newImageHash });
          await tx.pinnedFiles.upsert({
            where: {
              ipfsHash: newImageHash,
            },
            update: {
              status: "PINNED",
              path: foundImage?.pin?.name,
              pinnedToFileBase: true,
            },
            create: {
              ipfsHash: newImageHash as string,
              path: foundImage?.pin?.name,
              status: "PINNED",
              type: "IMAGE",
              width: imageWidth,
              height: imageHeight,
              originalUrl: nftData.json?.image,
              pinnedToFileBase: true,
            },
          });
        }

        if (foundAudio && foundAudio?.status === "pinned") {
          console.log("----AUDIO IS PINNED----", { newAudioHash });
          isPinnedAudio = true;
          (audioPath = foundAudio?.pin?.name),
            await tx.pinnedFiles.upsert({
              where: {
                ipfsHash: newAudioHash,
              },
              update: {
                status: "PINNED",
                path: foundAudio?.pin?.name,
                pinnedToFileBase: true,
              },
              create: {
                ipfsHash: newAudioHash as string,
                path: foundAudio?.pin?.name,
                status: "PINNED",
                type: "AUDIO",
                originalUrl: audioUrl,
                pinnedToFileBase: true,
              },
            });
        }

        const found = await tx.songs.findFirst({
          where: {
            OR: [
              { lossyAudioURL: audioUrl },
              { lossyAudioIPFSHash: imageHash },
            ],
          },
        });
        console.log({ found });
        if (found) {
          if (!found.lossyArtworkIPFSHash || !found.lossyAudioIPFSHash) {
            const songWithHash = await tx.songs.findFirst({
              where: {
                lossyAudioIPFSHash: newAudioHash,
              },
            });
            if (songWithHash) {
              console.log("---FIRING SONG WITH HASH---");
              // if a song with the current audio hash exists
              // connect this token to this song
              // we also need to move the existing connection to the old song so there's still reference
              // we need mark the existing song as a duplicate
              await tx.tokens.upsert({
                where: {
                  mintAddressAndChain: {
                    mintAddress: nftData.address as any as string,
                    chain: "solana",
                  },
                },
                create: {
                  // id: nftData.address as any as string,
                  // songId: found.id,
                  song: {
                    connect: {
                      id: songWithHash.id,
                    },
                  },
                  pinnedImage: newImageHash
                    ? {
                        connectOrCreate: {
                          where: {
                            ipfsHash: newImageHash,
                          },
                          create: {
                            ipfsHash: newImageHash,
                            originalUrl: imageUrl,
                            path: path as string,
                            status: isPinnedImage ? "PINNED" : "PENDING",
                            type: "IMAGE",
                            pinnedToFileBase: isPinnedImage,
                          },
                        },
                      }
                    : undefined,
                  pinnedAudio: newAudioHash
                    ? {
                        connectOrCreate: {
                          where: {
                            ipfsHash: newAudioHash,
                          },
                          create: {
                            ipfsHash: newAudioHash,
                            originalUrl: audioUrl,
                            path: audioPath as string,
                            status: isPinnedAudio ? "PINNED" : "PENDING",
                            type: "AUDIO",
                            pinnedToFileBase: isPinnedAudio,
                          },
                        },
                      }
                    : undefined,
                  tokenUri: nftData.uri,
                  audioUri: audioUrl as string,
                  // audioIpfsHash: newAudioHash,
                  // ipfsHash === audioUrl
                  //   ? null
                  //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''), //.replace(/\//, ''),
                  title: nftData.name,
                  description: nftJson?.description,
                  slug: `${nftData.name
                    .replace(/\s+/g, "-")
                    .toLowerCase()}-${nanoid(8)}`,
                  collectionAddress: nftData.collection
                    ?.address as any as string,
                  externalUrl: nftData.json?.external_url,
                  lossyArtworkURL: nftData.json?.image,
                  // lossyArtworkIPFSHash: newImageHash,
                  // imageIpfsHash === nftData.json?.image
                  //   ? null
                  //   : imageIpfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                  creators: {
                    connectOrCreate: nftData.creators
                      .filter((c) => c.share > 0)
                      .map((c: any) => {
                        return {
                          where: {
                            walletAddress: c.address,
                          },
                          create: {
                            walletAddress: c.address,
                          },
                        };
                      }) as any,
                  },
                  chain: "solana",
                  mintAddress: nftData.address as any as string,
                },
                update: {
                  title: nftData.name,
                  audioIpfsHash: newAudioHash,
                  lossyArtworkIPFSHash: newImageHash,
                  songId: songWithHash.id,
                },
              });
              console.log("---FIRING DUPLICATE--");
              await tx.songs.update({
                where: {
                  id: found.id,
                },
                data: {
                  isDuplicate: true,
                  lossyArtworkIPFSHash: newImageHash,
                  oldTokens: {
                    connect: {
                      mintAddressAndChain: {
                        mintAddress: nftData.address as any as string,
                        chain: "solana",
                      },
                    },
                  },
                  // tokens: {
                  //   disconnect
                  // }
                },
              });
            }
            if (!songWithHash) {
              // update existing song with new hash
              console.log("---FIRING UPDATE existing SONG---");
              await tx.songs.update({
                where: {
                  id: found.id,
                },
                data: {
                  lossyArtworkIPFSHash: newImageHash,
                  lossyAudioIPFSHash: newAudioHash,
                  slug: found.slug.replace(/\s+/g, "-"),
                  tokens: {
                    upsert: {
                      where: {
                        mintAddressAndChain: {
                          mintAddress: nftData.address as any as string,
                          chain: "solana",
                        },
                      },
                      create: {
                        pinnedImage: newImageHash
                          ? {
                              connectOrCreate: {
                                where: {
                                  ipfsHash: newImageHash,
                                },
                                create: {
                                  ipfsHash: newImageHash,
                                  originalUrl: imageUrl,
                                  path: path as string,
                                  status: isPinnedImage ? "PINNED" : "PENDING",
                                  type: "IMAGE",
                                  pinnedToFileBase: isPinnedImage,
                                },
                              },
                            }
                          : undefined,
                        pinnedAudio: newAudioHash
                          ? {
                              connectOrCreate: {
                                where: {
                                  ipfsHash: newAudioHash,
                                },
                                create: {
                                  ipfsHash: newAudioHash,
                                  originalUrl: audioUrl,
                                  path: audioPath as string,
                                  status: isPinnedAudio ? "PINNED" : "PENDING",
                                  type: "AUDIO",
                                  pinnedToFileBase: isPinnedAudio,
                                },
                              },
                            }
                          : undefined,
                        tokenUri: nftData.uri,
                        audioUri: audioUrl as string,
                        // audioIpfsHash: newAudioHash,
                        // ipfsHash === audioUrl
                        //   ? null
                        //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''), //.replace(/\//, ''),
                        title: nftData.name,
                        description: nftJson?.description,
                        slug: `${nftData.name
                          .replace(/\s+/g, "-")
                          .toLowerCase()}-${nanoid(8)}`,
                        collectionAddress: nftData.collection
                          ?.address as any as string,
                        externalUrl: nftData.json?.external_url,
                        lossyArtworkURL: nftData.json?.image,
                        // lossyArtworkIPFSHash: newImageHash,
                        // imageIpfsHash === nftData.json?.image
                        //   ? null
                        //   : imageIpfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                        creators: {
                          connectOrCreate: nftData.creators
                            .filter((c) => c.share > 0)
                            .map((c: any) => {
                              return {
                                where: {
                                  walletAddress: c.address,
                                },
                                create: {
                                  walletAddress: c.address,
                                },
                              };
                            }) as any,
                        },
                        chain: "solana",
                        mintAddress: nftData.address as any as string,
                      },
                      update: {
                        title: nftData.name,
                        audioIpfsHash: newAudioHash,
                        // ipfsHash === audioUrl
                        //   ? null
                        //   : ipfsHash.replace(/^ipfs:\/\/|\//g, ''),
                        lossyArtworkIPFSHash: newImageHash,
                      },
                    },
                  },
                },
              });
            }
          } else {
            const token = await tx.tokens.upsert({
              where: {
                mintAddressAndChain: {
                  mintAddress: nftData.address as any as string,
                  chain: "solana",
                },
              },
              create: {
                // id: nftData.address as any as string,
                // songId: found.id,
                song: {
                  connect: {
                    id: found.id,
                  },
                },
                pinnedImage: newImageHash
                  ? {
                      connectOrCreate: {
                        where: {
                          ipfsHash: newImageHash,
                        },
                        create: {
                          ipfsHash: newImageHash,
                          originalUrl: imageUrl,
                          path: path as string,
                          status: isPinnedImage ? "PINNED" : "PENDING",
                          type: "IMAGE",
                          pinnedToFileBase: isPinnedImage,
                        },
                      },
                    }
                  : undefined,
                pinnedAudio: newAudioHash
                  ? {
                      connectOrCreate: {
                        where: {
                          ipfsHash: newAudioHash,
                        },
                        create: {
                          ipfsHash: newAudioHash,
                          originalUrl: audioUrl,
                          path: audioPath as string,
                          status: isPinnedAudio ? "PINNED" : "PENDING",
                          type: "AUDIO",
                          pinnedToFileBase: isPinnedAudio,
                        },
                      },
                    }
                  : undefined,
                tokenUri: nftData.uri,
                audioUri: audioUrl as string,
                // audioIpfsHash: newAudioHash,
                // ipfsHash === audioUrl
                //   ? null
                //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''), //.replace(/\//, ''),
                title: nftData.name,
                description: nftJson?.description,
                slug: `${nftData.name
                  .replace(/\s+/g, "-")
                  .toLowerCase()}-${nanoid(8)}`,
                collectionAddress: nftData.collection?.address as any as string,
                externalUrl: nftData.json?.external_url,
                lossyArtworkURL: nftData.json?.image,
                // lossyArtworkIPFSHash: newImageHash,
                // imageIpfsHash === nftData.json?.image
                //   ? null
                //   : imageIpfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                creators: {
                  connectOrCreate: nftData.creators
                    .filter((c) => c.share > 0)
                    .map((c: any) => {
                      return {
                        where: {
                          walletAddress: c.address,
                        },
                        create: {
                          walletAddress: c.address,
                        },
                      };
                    }) as any,
                },
                chain: "solana",
                mintAddress: nftData.address as any as string,
              },
              update: {
                title: nftData.name,
                audioIpfsHash: newAudioHash,
                // ipfsHash === audioUrl
                //   ? null
                //   : ipfsHash.replace(/^ipfs:\/\/|\//g, ''),
                lossyArtworkIPFSHash: newImageHash,
              },
            });
            results.push(token);
            console.log({ token });
          }
        }

        if (!found) {
          const songWithHash = await tx.songs.findFirst({
            where: {
              lossyAudioIPFSHash: newAudioHash,
            },
          });
          if (songWithHash) {
            console.log("---FIRING SONG WITH HASH---");
            // if a song with the current audio hash exists
            // connect this token to this song
            // we also need to move the existing connection to the old song so there's still reference
            // we need mark the existing song as a duplicate
            await tx.tokens.upsert({
              where: {
                mintAddressAndChain: {
                  mintAddress: nftData.address as any as string,
                  chain: "solana",
                },
              },
              create: {
                // id: nftData.address as any as string,
                // songId: found.id,
                song: {
                  connect: {
                    id: songWithHash.id,
                  },
                },
                pinnedImage: newImageHash
                  ? {
                      connectOrCreate: {
                        where: {
                          ipfsHash: newImageHash,
                        },
                        create: {
                          ipfsHash: newImageHash,
                          originalUrl: imageUrl,
                          path: path as string,
                          status: isPinnedImage ? "PINNED" : "PENDING",
                          type: "IMAGE",
                          pinnedToFileBase: isPinnedImage,
                        },
                      },
                    }
                  : undefined,
                pinnedAudio: newAudioHash
                  ? {
                      connectOrCreate: {
                        where: {
                          ipfsHash: newAudioHash,
                        },
                        create: {
                          ipfsHash: newAudioHash,
                          originalUrl: audioUrl,
                          path: audioPath as string,
                          status: isPinnedAudio ? "PINNED" : "PENDING",
                          type: "AUDIO",
                          pinnedToFileBase: isPinnedAudio,
                        },
                      },
                    }
                  : undefined,
                tokenUri: nftData.uri,
                audioUri: audioUrl as string,
                // audioIpfsHash: newAudioHash,
                // ipfsHash === audioUrl
                //   ? null
                //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''), //.replace(/\//, ''),
                title: nftData.name,
                description: nftJson?.description,
                slug: `${nftData.name
                  .replace(/\s+/g, "-")
                  .toLowerCase()}-${nanoid(8)}`,
                collectionAddress: nftData.collection?.address as any as string,
                externalUrl: nftData.json?.external_url,
                lossyArtworkURL: nftData.json?.image,
                // lossyArtworkIPFSHash: newImageHash,
                // imageIpfsHash === nftData.json?.image
                //   ? null
                //   : imageIpfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                creators: {
                  connectOrCreate: nftData.creators
                    .filter((c) => c.share > 0)
                    .map((c: any) => {
                      return {
                        where: {
                          walletAddress: c.address,
                        },
                        create: {
                          walletAddress: c.address,
                        },
                      };
                    }) as any,
                },
                chain: "solana",
                mintAddress: nftData.address as any as string,
              },
              update: {
                title: nftData.name,
                audioIpfsHash: newAudioHash,
                lossyArtworkIPFSHash: newImageHash,
                songId: songWithHash.id,
              },
            });
          }

          if (!songWithHash) {
            let songTitle: string | undefined;
            if (nftJson?.properties?.title) {
              songTitle = nftJson.properties?.title as string;
            }

            const songs = await tx.songs.upsert({
              where: {
                lossyAudioURL: audioUrl,
              },
              create: {
                lossyAudioURL: audioUrl as string,
                slug: `${
                  songTitle?.replace(/\s+/g, "-").toLowerCase() ||
                  nftJson?.name?.replace(/\s+/g, "-").toLowerCase()
                }-${nanoid(8)}`,
                title:
                  (nftJson?.properties?.title as any) ||
                  nftJson?.name ||
                  "Untitled",
                lossyAudioIPFSHash: newAudioHash,
                // ipfsHash === audioUrl
                //   ? null
                //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                lossyArtworkURL: nftData.json?.image,
                lossyArtworkIPFSHash: newImageHash,
                description: nftJson?.description,
                creators: {
                  connectOrCreate: nftData.creators
                    .filter((c) => c?.share > 0)
                    .map((c: any) => {
                      return {
                        where: {
                          walletAddress: c.address,
                        },
                        create: {
                          walletAddress: c.address,
                        },
                      };
                    }) as any,
                },
                tokens: {
                  connectOrCreate: {
                    where: {
                      mintAddressAndChain: {
                        mintAddress: nftData.address as any as string,
                        chain: "solana",
                      },
                    },
                    create: {
                      // id: nftData.address as any as string,
                      tokenUri: nftData.uri,
                      audioUri: audioUrl as string,
                      mintAddress: nftData.address as any as string,
                      chain: "solana",
                      lossyArtworkIPFSHash: newImageHash,
                      audioIpfsHash: newAudioHash,
                      // ipfsHash === audioUrl
                      //   ? null
                      //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                      title: nftData.name,
                      description: nftJson?.description,
                      slug: `${nftData.name
                        .replace(/\s+/g, "-")
                        .toLowerCase()}-${nanoid(8)}`,
                      collectionAddress: nftData.collection
                        ?.address as any as string,
                      externalUrl: nftData.json?.external_url,
                      lossyArtworkURL: nftData.json?.image,

                      // imageIpfsHash === nftData.json?.image
                      //   ? null
                      //   : imageIpfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                      creators: {
                        connectOrCreate: nftData.creators
                          .filter((c) => c.share > 0)
                          .map((c: any) => {
                            return {
                              where: {
                                walletAddress: c.address,
                              },
                              create: {
                                walletAddress: c.address,
                              },
                            };
                          }) as any,
                      },
                    },
                  },
                },
              },
              update: {
                lossyAudioIPFSHash: newAudioHash,
                lossyArtworkIPFSHash: newImageHash,
                tokens: {
                  connectOrCreate: {
                    where: {
                      mintAddressAndChain: {
                        mintAddress: nftData.address as any as string,
                        chain: "solana",
                      },
                    },
                    create: {
                      // id: nftData.address as any as string,
                      tokenUri: nftData.uri,
                      mintAddress: nftData.address as any as string,
                      chain: "solana",
                      audioUri: audioUrl as string,
                      audioIpfsHash: newAudioHash,
                      // ipfsHash === audioUrl
                      //   ? null
                      //   : ipfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                      title: nftData.name,
                      description: nftJson?.description,
                      slug: `${nftData.name}-${nanoid(8)}`,
                      collectionAddress: nftData.collection
                        ?.address as any as string,
                      externalUrl: nftData.json?.external_url,
                      lossyArtworkURL: nftData.json?.image,
                      lossyArtworkIPFSHash: newImageHash,
                      // imageIpfsHash === nftData.json?.image
                      //   ? null
                      //   : imageIpfsHash?.replace(/^ipfs:\/\/|\//g, ''),
                      creators: {
                        connectOrCreate: nftData.creators
                          .filter((c) => c.share > 0)
                          .map((c: any) => {
                            return {
                              where: {
                                walletAddress: c.address,
                              },
                              create: {
                                walletAddress: c.address,
                              },
                            };
                          }) as any,
                      },
                    },
                  },
                },
              },
            });
            results.push(songs);
            console.log({ songs });
          }
        }
      },
      {
        timeout: 12000,
      }
    );

    const signed = sign(
      {
        method: "POST",
        service: "lambda",
        region: "us-east-1",
        host,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mintAddress: nftData?.address,
          isUpdated: true,
        }),
      },
      { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET }
    ) as SignedRequest;

    if (req.body.fromWeb) {
      console.log("-----FROM WEB-----");
      res
        .status(200)
        .json({ success: true, message: "Successfully indexed audio" });
    }

    const response = await fetch(functionUrl, signed);

    const info = await response.json();
    console.log({ info });

    res
      .status(200)
      .json({ success: true, message: "Successfully indexed audio" });
  } catch (error) {
    console.log("THIS IS AN ERROR", {
      error,
      nftAddress: req.body?.nftData?.nftJson?.address,
    });
    // await prisma.indexingError.create({
    //   data: {
    //     error: JSON.stringify(error),
    //     originalData: req.body?.nftData,
    //   },
    // });
    // if (process.env.NEXT_ENV !== "local") {
    //   captureEvent(error as any);
    // }

    res.status(500).json({
      success: false,
      error: JSON.stringify(error),
      data: req.body?.nftData,
    });
  }
}

export default verifySignature(handler);
// export default handler;
