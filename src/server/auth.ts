import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { SigninMessage } from "@/utils/SignMessage";
import { getCsrfToken } from "next-auth/react";
import { type NextApiRequest } from "next";
import { adminWallets } from "@/utils/constants";
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

// NextAuthOptions
export function authOptions(req: NextApiRequest): NextAuthOptions {
  const providers = [
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID || "eee",
    //   clientSecret: env.DISCORD_CLIENT_SECRET || "eee",
    // }),
    CredentialsProvider({
      id: "solana-auth",
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
        // console.log("----AUTHORIZING----")
        try {
          // console.log({ credentials, message: credentials?.message})
          const signinMessage = new SigninMessage(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            JSON.parse(credentials?.message || "{}")
          );
          // console.log({ body: req.body, stringy: JSON.stringify(req.body)})

          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || "");
          // console.log({ nextAuthUrl, signinMessage })
          if (signinMessage.domain !== nextAuthUrl.host) {
            return null;
          }
          // console.log("chcking csrf", {
          //   header: req.headers, body: req.body, cookies: req.cookies })

          const csrfToken = await getCsrfToken({
            req: { headers: req.headers },
          });
          //  {...req, body: JSON.stringify(req.body)},
          // console.log("----SIGNING IN----")
          // console.log({ csrfToken, signinMessage })
          if (signinMessage.nonce !== csrfToken) {
            console.log("csrf failed");
            return null;
          }

          const validationResult = signinMessage.validate(
            credentials?.signature || ""
          );
          console.log({ validationResult });

          if (!validationResult)
            throw new Error("Could not validate the signed message");

          return {
            id: signinMessage.publicKey as string,
            walletAddress: signinMessage.publicKey as string,
          };
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
      jwt({ token, user }) {
        // console.log({ token, user });
        if (user) {
          token.user = user;
        }
        return token;
      },
      session: ({ session, token }) => {
        // console.log({ session, user, token });
        // session
        let isAdmin = false;
        if (token.sub && adminWallets.includes(token.sub)) {
          isAdmin = true;
        }
        return {
          ...session,
          walletAddress: token.sub,
          isAdmin,
          user: {
            ...session.user,
            walletAddress: token.sub,
            isAdmin,
          },
          // user: {
          //   ...session.user,
          //   id: user.id,
          //   // walletAddress: token.sub
          // },
        };
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
