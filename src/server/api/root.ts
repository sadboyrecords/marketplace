import { createTRPCRouter } from "@/server/api/trpc";
import { exampleRouter } from "@/server/api/routers/example";
import { userRouter } from "@/server/api/routers/users";
import { pinnedFilesRouter } from "@/server/api/routers/pinnedFiles";
import { battleRouter } from "@/server/api/routers/battle";
import { candyMachineRouter } from "./routers/candyMachine";
import { songRouter } from "./routers/songs";
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
  // healthcheck: publicProcedure.query(() => 'yay!'), 
 
  // playlist: playlistRouter,
  
  // artist: artistRouter,
  // listing: listingRouter,
  
  // token: tokenRouter,
  //
});

// export type definition of API
export type AppRouter = typeof appRouter;
