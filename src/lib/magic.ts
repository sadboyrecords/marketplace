import { Magic } from "magic-sdk";
// import { } from "@magic-ext/auth"
import { SolanaExtension } from "@magic-ext/solana";
// import { env } from "@/env.mjs";
import * as web3 from "@solana/web3.js";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rpcUrl = process.env.NEXT_PUBLIC_RPC_HOST!; // "https://api.devnet.solana.com"; //process.env.NEXT_PUBLIC_RPC_HOST!;
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

export const magic = createMagic("pk_live_B4A4FA0BBE63CFBD");
console.log({ magic });

export async function signTransaction(
  tx: web3.Transaction
): Promise<web3.Transaction> {
  console.log({ magic, tx });
  if (!magic) return tx;

  const serializeConfig = {
    requireAllSignatures: false,
    verifySignatures: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const signedTransaction = await magic?.solana.signTransaction(
    tx,
    serializeConfig
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const transaction = web3.Transaction.from(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    signedTransaction?.rawTransaction
  );

  // transaction?.signatures?.forEach((s) => {
  //   console.log({ sig: s?.publicKey?.toBase58() });
  // });

  // add missing signers from original transaction to the newly created one
  const missingSigners = transaction.signatures
    .filter((s) => !s?.signature)
    .map((s) => s.publicKey);
  missingSigners.forEach((publicKey) => {
    const signature = tx?.signatures.find((s) => {
      return publicKey.equals(s.publicKey);
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (signature) transaction.addSignature(publicKey, signature?.signature);
  });

  return transaction;
}
