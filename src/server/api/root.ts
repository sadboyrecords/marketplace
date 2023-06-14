import { createTRPCRouter } from "@/server/api/trpc";
import { exampleRouter } from "@/server/api/routers/example";
import { userRouter } from "@/server/api/routers/users";
import { pinnedFilesRouter } from "@/server/api/routers/pinnedFiles";
import { battleRouter } from "@/server/api/routers/battle";
import { candyMachineRouter } from "./routers/candyMachine";
import { songRouter } from "./routers/songs";
import { playlistRouter } from "./routers/playlists";
import { likesRouter } from "./routers/likes";
import { artistRouter } from "./routers/artists";
import { tokenRouter } from "./routers/tokens";
import { transactionRouter } from "./routers/transactions";
import { onrampRouter } from "./routers/onramp";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  user: userRouter,
  pinnedFiles: pinnedFilesRouter,
  battle: battleRouter,
  candyMachine: candyMachineRouter,
  songs: songRouter,
  playlist: playlistRouter,
  likes: likesRouter,
  artist: artistRouter,
  token: tokenRouter,
  transaction: transactionRouter,
  onramp: onrampRouter,
  // healthcheck: publicProcedure.query(() => 'yay!'),

  //

  // artist: artistRouter,
  // listing: listingRouter,

  // token: tokenRouter,
  //
});

// export type definition of API
export type AppRouter = typeof appRouter;
