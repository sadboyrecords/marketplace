import { z } from "zod";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import {
  createTRPCRouter,
  publicProcedure,
  // protectedProcedure,
} from "@/server/api/trpc";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const network = process.env.NEXT_SOLANA_NETWORK || WalletAdapterNetwork.Devnet;

const connection = new Connection(
  process.env.NEXT_RPC_HOST || clusterApiUrl(network as WalletAdapterNetwork),
  "confirmed"
);

export const transactionRouter = createTRPCRouter({
  getCandyTransactions: publicProcedure
    .input(z.object({ candymachineId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.transactions.findMany({
        where: {
          candymachineAddress: input.candymachineId,
          transactionType: "MINT",
        },
        orderBy: {
          blockTime: "desc",
        },
        include: {
          receiver: {
            select: {
              name: true,
              walletAddress: true,
              magicSolanaAddress: true,
              pinnedProfilePicture: {
                select: {
                  ipfsHash: true,
                  width: true,
                  height: true,
                  originalUrl: true,
                  path: true,
                  status: true,
                },
              },
            },
          },
        },
      });
    }),
  updateCandy: publicProcedure
    .input(
      z.object({
        candymachineId: z.string(),
        redeemed: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // get the last signature from the database
      const transactions = await ctx.prisma.transactions.findMany({
        where: {
          candymachineAddress: input.candymachineId,
          transactionType: "MINT",
        },
        orderBy: {
          blockTime: "desc",
        },
      });
      if (transactions.length === input.redeemed) return transactions;
      const lastSignature = transactions && transactions[0]?.signature;
      console.log({ lastSignature });

      const signatures = await connection.getSignaturesForAddress(
        new PublicKey(input.candymachineId),
        {
          // limit: 1,
          until: lastSignature,
        }
      );

      const mappedSig = signatures
        .filter((s) => !s.err)
        .map((sig) => sig.signature);
      console.log({ mappedSig });
      const parsedTransactions = await connection.getParsedTransactions(
        mappedSig,
        {
          maxSupportedTransactionVersion: 0,
        }
      );

      const minted = parsedTransactions.filter((t) =>
        t?.transaction?.message?.instructions?.find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (int) => int?.parsed?.type === "mintTo"
        )
      );
      console.log({ minted });
      if (minted?.length === 0 || mappedSig.length === 0) return null;

      const forSave = minted?.map((t, i) => {
        const int = t?.transaction?.message?.instructions?.find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (int) => int?.parsed?.type === "mintTo"
        );
        return {
          signature: mappedSig[i] as string,
          blockTime: signatures[i]?.blockTime as number,
          transactionType: "MINT" as const,
          candymachineAddress: input.candymachineId,
          // eslint-disable-next-line
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          receiverWalletAddress: int?.parsed?.info?.mintAuthority as string,
          // eslint-disable-next-line
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          tokenAddressReferenceOnly: int?.parsed?.info?.mint as string,
        };
      });
      console.log({ forSave });

      const updated = await ctx.prisma.$transaction(async (tx) => {
        const mapped = await Promise.all(
          forSave.map(async (f) => {
            const user = await tx.user.findFirst({
              where: {
                OR: [
                  {
                    walletAddress: f.receiverWalletAddress,
                  },
                  {
                    magicSolanaAddress: f.receiverWalletAddress,
                  },
                ],
              },
            });

            return {
              ...f,
              receiverWalletAddress: user?.walletAddress,
            };
          })
        );
        return mapped;
      });

      return await ctx.prisma.transactions.createMany({
        data: updated,
      });
    }),
});
