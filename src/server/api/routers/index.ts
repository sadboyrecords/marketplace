// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';

import { exampleRouter } from './example';
import { tokenRouter } from './tokens';
import { artistRouter } from './artists';
import { userRouter } from './users';
import { playlistRouter } from './playlists';
import { candyMachineRouter } from './candyMachine';
import { listingRouter } from './listing';
import { pinataRouter } from './pinata';
import { songRouter } from './songs';

export const appRouter = createRouter()
  .transformer(superjson)
  // .merge('token.', tokenRouter)
  // .merge('artist.', artistRouter)
  // .merge('user.', userRouter)
  // .merge('playlist.', playlistRouter)
  // .merge('auth.', authRouter)
  // .merge('candyMachine.', candyMachineRouter)
  // .merge('listing.', listingRouter)
  // .merge('pinata.', pinataRouter)
  // .merge('songs.', songRouter);


// export type definition of API
export type AppRouter = typeof appRouter;
