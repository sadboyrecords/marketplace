/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
// import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { SigninMessage } from "@/utils/SignMessage";
import { getCsrfToken } from "next-auth/react";
import { type NextApiRequest } from "next";
// import { adminWallets } from "@/utils/constants";
import { Magic, WalletType } from "@magic-sdk/admin";
import { authProviderNames } from "@/utils/constants";
// import { api } from "@/utils/api";
import { env } from "@/env.mjs";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    user: {
      id: string;
      walletAddress?: string;
      isAdmin?: boolean;
      isSuperAdmin?: boolean;
      provider?: string;
      magicSolanaAddress?: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const magic: Magic = new Magic(env.MAGIC_SK, {});
// NextAuthOptions
export function authOptions(req: NextApiRequest): NextAuthOptions {
  const providers = [
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID || "eee",
    //   clientSecret: env.DISCORD_CLIENT_SECRET || "eee",
    // }),
    CredentialsProvider({
      id: authProviderNames.solana,
      name: "Solana",
      type: "credentials",
      // callbackUrl: 'http://localhost:3000/api/auth/callback/my-custom-provider',
      credentials: {
        message: {
          label: "Message",
          type: "text",
        },
        signature: {
          label: "Signature",
          type: "text",
        },
      },

      async authorize(credentials) {
        try {
          const signinMessage = new SigninMessage(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            JSON.parse(credentials?.message || "{}")
          );

          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || "");

          if (signinMessage.domain !== nextAuthUrl.host) {
            return null;
          }

          const csrfToken = await getCsrfToken({
            req: { headers: req.headers },
          });
          if (signinMessage.nonce !== csrfToken) {
            return null;
          }

          const validationResult = signinMessage.validate(
            credentials?.signature || ""
          );

          if (!validationResult)
            throw new Error("Could not validate the signed message");

          return {
            id: signinMessage.publicKey,
            walletAddress: signinMessage.publicKey,
          };
        } catch (e) {
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: authProviderNames.magic,
      name: "Magic Link",
      type: "credentials",
      credentials: {
        didToken: { label: "DID Token", type: "text" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.didToken) return null;
          magic.token.validate(credentials?.didToken || "");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const metadata = await magic.users.getMetadataByToken(
            credentials?.didToken || ""
          );

          const walletData = await magic.users.getMetadataByTokenAndWallet(
            credentials?.didToken || "",
            WalletType.SOLANA
          );

          // walletData.wallets?.forEach((wallet) => {
          //   console.log({ wallet });
          // });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const solanaAddress = walletData.wallets?.find(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (wallet) => wallet.wallet_type === WalletType.SOLANA
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
          )?.public_address as string;
          const data = {
            id: metadata.publicAddress as string,
            walletAddress: metadata.publicAddress as string,
            email: metadata.email as string | null | undefined,
            wallets: metadata.wallets,
            phoneNumber: metadata.phoneNumber as string | null | undefined,
            provider: authProviderNames.magic,
            issuer: metadata.issuer,
            magicSolanaAddress: solanaAddress,
          };

          return data;
        } catch (e) {
          return null;
        }
      },
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ];
  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth?.includes("signin");
  if (isDefaultSigninPage) {
    providers.pop();
  }

  return {
    callbacks: {
      // signIn: async ({ user, account }) => {
      //   console.log({ user, account });
      //   return true;
      // },

      //  signIn({ user, account, profile, email, credentials }) {
      //   console.log({ user, account, profile, email, credentials})
      //   return true
      //   // const isAllowedToSignIn = true
      //   // if (isAllowedToSignIn) {
      //   //   return true
      //   // } else {
      //   //   // Return false to display a default error message
      //   //   return false
      //   //   // Or you can return a URL to redirect to:
      //   //   // return '/unauthorized'
      //   // }
      // },
      // async jwt({ token, user, profile }) {
      //   console.log({ token, user, profile });
      //   if (user) {
      //     console.log("jwt user---", user);
      //     token.user = user;
      //     // token.provider = user.provider as string;
      //   }
      //   return Promise.resolve(token); //token
      // },
      jwt: async ({ token, user }) => {
        console.log("JWT===", { token, user });
        user && (token.user = user);
        let isAdmin = false;
        if (token.sub) {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                {
                  email: token.email,
                },
                {
                  walletAddress: token.sub,
                },
                {
                  magicSolanaAddress: token.sub,
                },
              ],
            },
          });

          if (!user) {
            console.log("user not found");
            await prisma.user.create({
              data: {
                walletAddress: token.sub,
                email: token.email,
              },
            });
          }

          if (
            user &&
            // @ts-ignore
            token?.user?.magicSolanaAddress &&
            (token?.email !== user.email ||
              token?.walletAddress !== user.walletAddress ||
              // @ts-ignore
              token?.user?.magicSolanaAddress !== user.magicSolanaAddress)
          ) {
            console.log("updating user");
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                email: token.email,
                walletAddress: token.sub,
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                magicSolanaAddress: token?.user?.magicSolanaAddress,
              },
            });
            // token.user = user;
          }

          if (user?.isAdmin) {
            isAdmin = true;
          }
          token.isAdmin = isAdmin;
          return token;
        }

        // if (token.sub && adminWallets.includes(token.sub)) {
        //   isAdmin = true;
        // }
        token.isAdmin = isAdmin;
        return token;
      },
      session: ({ session, token }) => {
        session = {
          ...session,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          user: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...token?.user,
            isAdmin: token?.isAdmin,
          },
        };
        return session;
        // return {
        //   ...session,
        //   // ...token.,
        //   // walletAddress: token.sub,
        //   isAdmin,
        //   user: {
        //     ...session.user,
        //     // ...(token.user as any),
        //     walletAddress: token.sub,
        //     isAdmin,
        //   },
        // };
      },
    },
    adapter: PrismaAdapter(prisma),
    providers,
    debug: true,
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: "jwt",
    },
  };
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const options = authOptions(ctx.req as NextApiRequest);
  return getServerSession(ctx.req, ctx.res, options);
};
