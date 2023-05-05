// src/server/router/context.ts
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { prisma } from '../db/client';
// import { getIronSession } from 'iron-session/edge';
import { getIronSession } from "iron-session"
import { sessionOptions } from 'lib/withSession';

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = Record<string, never>;

/** Use this helper for:
 * - testing, where we dont have to Mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    prisma,
    session: {
      message: 'Hello World',
      // ...opts.
    },
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/


export const returnIronSession = async (req: any, res: any) => {
  try {
    const session = await getIronSession(req, res, {
      ...sessionOptions,
    });
    return session;
  } catch (error) {
    console.log({ error });
    return null;
  }
}


export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  // const session = await getIronSession(opts.req, opts.res, {
  //   ...sessionOptions,
  // });
  const sessionResponse = await returnIronSession(opts.req, opts.res);
  let session = {
    test: "this is a test message",
      user: {
        walletAddress: "",
      },
  }
  console.log({ sessionResponse })
  if (sessionResponse) {
    session = {
      ...session,
      user: {
        ...session.user,
        ...sessionResponse.user,
      }
    }
  }
  // console.log({ session });
  return {
    prisma,
    session,
    // req: opts.req,
    // res: opts.res,

  }
  // return await createContextInner({});
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
