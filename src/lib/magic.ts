import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rpcUrl = process.env.NEXT_PUBLIC_RPC_HOST!;

export const magic = new Magic("pk_live_80BDE391B04E0DC2", {
  extensions: {
    solana: new SolanaExtension({
      rpcUrl,
    }),
  },
});
