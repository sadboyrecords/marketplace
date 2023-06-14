/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import slugify from "slugify";
import { imageDomains, routes } from "@/utils/constants";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import type { PartialSongType, SongType } from "./types";
import axios from "axios";
import { liveIpfsGateway, cdnUrl } from "@/utils/constants";
import type { GuardFormType } from "./types";
import type {
  Sft,
  SftWithToken,
  Nft,
  NftWithToken,
} from "@metaplex-foundation/js";

type RouterOutput = inferRouterOutputs<AppRouter>;

export function classNames(...classes: [string]) {
  return classes.filter(Boolean).join(" ");
}

export const getHashAndUriFromNFT = (
  nftData: Nft | NftWithToken | Sft | SftWithToken
) => {
  let audioUrl: string | undefined = nftData.json?.properties?.files?.[0]?.uri;
  const audioFile = nftData?.json?.properties?.files?.filter((f) =>
    f?.type?.includes("audio")
  );
  if (audioFile && audioFile?.length > 0) {
    audioUrl =
      audioFile[0]?.uri || (audioFile[0]?.url as string | undefined) || "";
  }
  const ipfsAudioHash = audioUrl?.split("/ipfs").pop(); //.replace(/^ipfs:\/\/|\//g, '')
  const imageIpfsHash = nftData.json?.image?.split("/ipfs").pop();
  let audioHash: string | undefined;
  let imageHash: string | undefined;
  if (ipfsAudioHash !== audioUrl) {
    audioHash = ipfsAudioHash?.replace(/^ipfs:\/\/|\//g, "");
  }
  if (imageIpfsHash !== nftData.json?.image) {
    imageHash = imageIpfsHash?.replace(/^ipfs:\/\/|\//g, "");
  }
  const imageUrl = nftData.json?.image;
  // console.log({ imageHash, audioHash, audioUrl, imageUrl });

  return {
    imageHash,
    audioHash,
    audioUrl,
    imageUrl,
  };
};

export const getLowestSolpaymentFromGuard = (guards?: GuardFormType[]) => {
  if (!guards) return null;
  // const sortedGuards = guards.sort((a, b) => a.solPayment?.amount - b?.solPayment?.amount);
  // return sortedGuards[0].solPayment;
  let price;
  const lowestNumber = guards.reduce((acc, curr) => {
    if (!curr.solPayment?.amount) {
      return acc || curr;
    }
    if (!acc.solPayment?.amount) {
      return curr || null;
    }
    if (acc.solPayment?.amount < curr.solPayment?.amount) {
      return acc;
    }
    return curr;
  });
  price = lowestNumber?.solPayment?.amount;
  if (!price) {
    price = guards[0]?.solPayment?.amount;
  }
  return price;
};

export const nftImagePath = "nft/images/";
export const nftINonIpfsImagePath = "nft/images/nonIpfs/";
export const nftMetaDataPath = "nft/metadata/";
export const nftAudioPath = "nft/audio/";
export const filebaseEndpoints = {
  getPins: "https://api.filebase.io/v1/ipfs/pins",
  pinFile: "https://api.filebase.io/v1/ipfs/pins",
};

// application/json

export const hashFile = (file: File) => {
  // return new Promise((resolve, reject) => {
  //   const fileReader = new FileReader();
  //   fileReader.onload = () => {
  //     const buffer = Buffer.from(fileReader.result as ArrayBuffer);
  //     const hash = window.crypto.subtle.digest('SHA-256', buffer);
  //     resolve(hash);
  //   };
  //   fileReader.onerror = reject;
  //   fileReader.readAsArrayBuffer(file);
  // });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
  return new Promise(async (resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result;
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        arrayBuffer as ArrayBuffer
      );

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      resolve(hashHex);
    };
    fileReader.onerror = reject;

    // Read the file as an array buffer
    fileReader.readAsArrayBuffer(file);
  });
};

export const hashArray = (arrayBuffer: string | ArrayBuffer) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      arrayBuffer as ArrayBuffer
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    resolve(hashHex);
  });
};
export const hashJSON = (json: string) => {
  //  hash json string
  const jsonStr = JSON.stringify(json);
  const data = new TextEncoder().encode(jsonStr);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    resolve(hashHex);
  });
};

export const hashJsonToNumber = (json: string) => {
  //  hash json string
  // Calculate the SHA-256 hash of the JSON string
  // const hash = crypto.createHash('sha256').update(objJson).digest('hex');

  // // Convert the hexadecimal hash to an array of decimal numbers
  // const hashArray = hash.match(/.{2}/g).map(hex => parseInt(hex, 16));

  // // Print the hash array
  // console.log(hashArray);
  const jsonStr = JSON.stringify(json);
  const data = new TextEncoder().encode(jsonStr);
  return new Promise(async (resolve) => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // const hashHex = hashArray
    //   .map((b) => b.toString(16).padStart(2, '0'))
    //   .join('');
    resolve(hashArray);
  });
};

interface ipfsUploadType {
  contentType: string;
}

interface ipfJsonUploadType extends ipfsUploadType {
  json: JSON;
}

interface ipfFileUploadType extends ipfsUploadType {
  audioFile: File;
}
interface ipfFileUploadType2 extends ipfsUploadType {
  imageFile: File;
}

type ipfsUploadParams =
  | ipfJsonUploadType
  | ipfFileUploadType
  | ipfFileUploadType2;

interface UploadFileToIpfsParams {
  audioFile?: File;
  imageFile?: File;
  json?: any;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface UploadFileReturnType {
  cid: string | undefined;
  key: string;
}
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = event?.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const uploadFileToIpfs = async ({
  audioFile,
  imageFile,
  json,
}: UploadFileToIpfsParams): Promise<UploadFileReturnType | undefined> => {
  let stringifyJson;
  let hash = "";
  let path = "";
  let forUpload;
  let fileType;
  let fileExtension;

  if (!audioFile && !imageFile && !json) return;
  if (json) {
    stringifyJson = JSON.stringify(json);
  }

  if (audioFile) {
    hash = (await hashFile(audioFile)) as string;
    path = nftAudioPath;
    forUpload = audioFile;
    fileType = audioFile.type;
  }
  if (imageFile) {
    hash = (await hashFile(imageFile)) as string;
    path = nftImagePath;
    forUpload = imageFile;
    fileType = imageFile.type;
    fileExtension = fileType.split("/")[1];
  }
  if (json && stringifyJson) {
    hash = (await hashJSON(stringifyJson)) as string;
    path = nftMetaDataPath;
    forUpload = json as unknown;
    fileType = "application/json";
  }

  const key = `${path}${hash}${json ? ".json" : ""}${
    fileExtension ? `.${fileExtension}` : ""
  }`;
  const params = {
    Bucket: process.env.NEXT_PUBLIC_FILEBASE_BUCKET,
    Key: key,
    ContentType: fileType,
    // ACL: 'public-read',
  };
  const dataUrl = await fetch("/api/upload-url", {
    method: "POST",
    body: JSON.stringify(params),
  });
  console.log({ dataUrl });
  const url = (await dataUrl?.json()) as string;
  console.log({ url, forUpload });
  // debugger
  const { headers } = await axios.put(url, forUpload, {
    headers: {
      "Content-Type": fileType,
      "Access-Control-Allow-Origin": "*",
    },
  });
  console.log({ headers });

  const cid = headers["x-amz-meta-cid"] as string;
  console.log({ cid, key });
  return { cid, key };
};

export const convertToSlug = (text: string) => {
  return slugify(text, {
    // replacement: "-",
    // remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
  });
};

export const stripHtml = (html: string) => {
  // strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
  return html.replace(/<[^>]*>?/gm, "");
};

export const primaryNotificationMessage = {
  error: "Error",
  success: "Success",
  info: "Info",
  warning: "Warning",
};

export const secondaryNotificationMessage = {
  error: "Something went wrong. Please try again later",
  success: "Operation completed successfully",
  info: "Info",
  warning: "Warning",
};

export function myImageLoader({
  src,
  width,
  quality,
  height,
}: {
  src: string;
  width?: number;
  quality?: number;
  height?: number;
}) {
  return `${cdnUrl}${src}?quality=${quality || 75}${
    width ? `&width=${width}` : ""
  }${height ? `&height=${height}` : ""}`;
}

export const ipfsUrl = (
  hash: string | null | undefined,
  quality = 90,
  path?: string,
  pinnedStatus?: string,
  width?: number,
  height?: number
) => {
  if (!hash) return;
  if (path && pinnedStatus === "PINNED") {
    // console.log("returning cdn url---------", cdnUrl, path, quality, width, height)
    return path;
    // return `${cdnUrl}${path}?quality=${quality}${width ?`&width=${width}`:""}${height ?`&height=${height}`:""}`;
  }
  // const pinataUrl = `https://reamp.mypinata.cloud/ipfs/${hash}?img-width=250&img-height=250&img-fit=scale-down&img-quality=${quality}`;
  // const pinataUrl = `https://reamp.mypinata.cloud/ipfs/${hash}`;

  const ipfsUrl = `${liveIpfsGateway}${hash}`;
  // ?img-quality=${quality}&img-width=250&img-height=250&img-fit=scale-down&

  // niftytunes.mypinata.cloud
  // https://niftytunes.mypinata.cloud/ipfs/bafybeifw2v7aj22kvbtogm7kqspuqefg2kov344pdc5dtlww7duwzgdscu

  return ipfsUrl;
};
export const audioIpfsUrl = ({ hash }: { hash: string | null | undefined }) => {
  if (!hash) return;
  const ipfsUrl = `${liveIpfsGateway}${hash}`;

  return ipfsUrl;
};

export const mainPinataUrl = (hash?: string) => {
  if (!hash) return;
  return `https://niftytunes.mypinata.cloud/ipfs/${hash}`;
};

export const handleImageUrl = (
  url: string | null | undefined,
  hash: string | null,
  quality = 50
) => {
  // console.log({ url, hash })
  if (!url) return;
  const { hostname } = new URL(url);

  if (hash) {
    const pinataUrl = `https://reamp.mypinata.cloud/ipfs/${hash}`;
    // https://ipfs.io/ipfs/
    //  console.log({ pinataUrl})
    // ?img-quality=${quality}img-width=250&img-height=250&img-fit=scale-down&
    return pinataUrl;
  }
  if (!imageDomains.includes(hostname)) {
    return null;
  }

  return url;
};

// export const abbreviateNumber = (num: number, fixed: number | string) => {
//     if (num === null) { return null; } // terminate early
//     if (num === 0) { return '0'; } // terminate early
//     fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
//     const b = (num).toPrecision(2).split("e"), // get power
//         k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
//         c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
//         d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
//         e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
//     return e;
//   }

export const abbreviateNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
};

export const creditRolesConvert = (role: string) => {
  switch (role) {
    case "PRODUCER":
      return "Producers";
    case "SONGWRITER":
      return "Songwriters";
    case "PRIMARY_ARTIST":
      return "Primary Artists";
    case "FEATURED_ARTIST":
      return "Featured Artists";
    case "LABEL":
      return "Labels";
    case "MANAGER":
      return "Managers";
    case "PUBLISHER":
      return "Publishers";
    case "DISTRIBUTOR":
      return "Distributors";
    case "COLLECTIVE":
      return "Collectives";
    case "OTHER":
      return "Others";

    default:
      return role;
  }
};

export const getCreatorNames = (track: SongType) => {
  const creatorNames: { name?: string; walletAddress: string }[] = [];
  track?.creators?.forEach((creator) => {
    creatorNames.push({
      name:
        creator.name ||
        creator.firstName ||
        `${creator.walletAddress.slice(0, 3)}...${creator.walletAddress.slice(
          -4
        )}`,
      walletAddress: creator.walletAddress,
    });
  });
  // console.log({ creatorNames})
  return creatorNames;
};

export const getCreatorname = ({
  name,
  walletAddress,
}: {
  name?: string;
  walletAddress: string;
}) => {
  return name || `${walletAddress.slice(0, 3)}...${walletAddress.slice(-4)}`;
};

export const getTrackUrl = (track?: SongType | PartialSongType) => {
  if (!track?.tokens) return null;
  if (!track?.candyMachines) return null;

  if (track?.candyMachines && track?.candyMachines?.length > 0) {
    return routes.dropDetails(track?.candyMachines[0]?.slug as string);
  }
  if (track?.tokens[0]?.mintAddress) {
    return routes.tokenItemDetails(track?.tokens[0]?.mintAddress);
  }
  return null;
};
