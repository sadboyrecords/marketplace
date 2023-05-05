import React from "react";
import Button from "@/components/buttons/Button";
import { PlayIcon, PauseIcon } from "@heroicons/react/20/solid";
// import usePlayer from 'hooks/usePlayer';
// import { type inferRouterOutputs } from '@trpc/server';
// import { type AppRouter } from '@/server/api/root';
// import type { SongDetailType } from 'utils/types';

// type RouterOutput = inferRouterOutputs<AppRouter>;
// { song }: { song: SongDetailType }
function PlayButton() {
  //   const { isPlaying, currentToken, handlePlayPause } = usePlayer();
  return (
    <Button
      variant="ghost"
      className="px-0 py-1 lg:py-3"
      // disabled
      // className="hover:scale-110 text-primary-400 z-10"
      //   onClick={() => handlePlayPause(song)}
    >
      {/* {currentToken?.id === song?.id && isPlaying ? (
        <PauseIcon className="text-primary hover:text-primary-focus h-6 w-6" />
      ) : (
        <PlayIcon className="text-primary hover:text-primary-focus h-6 w-6" />
      )} */}
      <PlayIcon className="h-6 w-6 text-primary hover:text-primary-focus" />
    </Button>
  );
}

export default PlayButton;
