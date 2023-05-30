import { Magic } from "magic-sdk";
// import { } from "@magic-ext/auth"
import { SolanaExtension } from "@magic-ext/solana";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rpcUrl = "process.env.NEXT_PUBLIC_RPC_HOST!"; // "https://api.devnet.solana.com"; //process.env.NEXT_PUBLIC_RPC_HOST!;
// console.log({ magicRpcUrl: rpcUrl });

const createMagic = (key: string) =>
  typeof window != "undefined" &&
  new Magic(key, {
    extensions: [
      new SolanaExtension({
        rpcUrl,
      }),
    ],
  });

export const magic = createMagic("pk_live_80BDE391B04E0DC2");
