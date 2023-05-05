import React, { useState, useRef, useEffect } from "react";
import PlayerRange from "./Range";
import VolumeRange from "./VolumeRange";
import ControlSection from "./ControlSection";
import MediaSession from "./MediaSession";
// import Details from './Details';
// import PlaylistContainer from './PlaylistContainer';
import { usePlayerProvider } from "./Provider";
import ReactPlayer from "react-player/lazy";
import Image from "next/image";
import { ipfsUrl, audioIpfsUrl } from "utils/helpers";

import { toast } from "react-toastify";
// import { LooksOne, Repeat, RepeatOne, Menu } from '';
import {
  AVAILABLE_PLAYBACK_STATES,
  PREV_BUTTON_RESET_TIME,
  SEEK_STEP,
  FAIL_ATTEMPTS,
} from "./constants";
import {
  ArrowRight,
  Rewind,
  Play,
  Pause,
  Shuffle,
} from "components/IconComponents";
import PlaylistButton from "./PlaylistButton";
import ImageDisplay from "components/ImageDisplay/ImageDisplay";
import { getCreatorNames } from "utils/helpers";
import Link from "next/link";
import Typography from "components/Typography";
import { routes } from "utils/constants";

function Bar() {
  const hackUrl = "https://niftytuness.mypinata.cloud/ipfs/QmZ";
  const playerRef = useRef(null) as React.MutableRefObject<ReactPlayer | null>;
  const AppBarRef = useRef(null);
  const currentTime = useRef(0);
  const songDuration = useRef(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [failAttempts, setFailAttempts] = useState(0);
  const [playbackState, setPlaybackState] = useState(
    AVAILABLE_PLAYBACK_STATES.PLAY_ALL
  );

  const shouldResetOnPrev = (current: number) =>
    current > PREV_BUTTON_RESET_TIME;

  const {
    currentPlaylist,
    setIsPlaying,
    isPlaying,
    currentToken,
    setCurrentToken,
    setCurrentPlaylist,
    nextToken,
  } = usePlayerProvider() as any;
  // console.log({ currentToken });

  const seekTo = (time: number) => {
    currentTime.current = time;
    playerRef?.current?.seekTo?.(time);
  };

  const seekForward = () => {
    playerRef?.current?.seekTo?.(
      playerRef.current.getCurrentTime() + SEEK_STEP
    );
  };

  const seekBackward = () => {
    playerRef?.current?.seekTo(
      playerRef?.current?.getCurrentTime() - SEEK_STEP
    );
  };

  // const nextToken = () => {
  //   // if (!currentToken) return;

  //   // const nextTokenIndex =
  //   //   currentPlaylist?.tracks?.findIndex(
  //   //     (track: any) => track.id === currentToken.id
  //   //   ) + 1;

  //   // if (nextTokenIndex === currentPlaylist?.tracks?.length - 1) {
  //   //   const next = currentPlaylist?.tracks?.[0];
  //   //   setCurrentToken(next || null);
  //   // } else {
  //   //   const next = currentPlaylist?.tracks?.[nextTokenIndex];
  //   //   setCurrentToken(next || null);
  //   // }
  // };

  const prevToken = () => {
    if (shouldResetOnPrev(currentTime.current)) {
      seekTo(0);
      return;
    }
    const prevTokenIndex = currentPlaylist?.tracks?.findIndex(
      (token: any) => token?.title === currentToken?.title
    );
    if (prevTokenIndex === 0) {
      setCurrentToken(
        currentPlaylist?.tracks?.[currentPlaylist?.tracks?.length - 1] || null
      );
    } else {
      setCurrentToken(currentPlaylist?.tracks?.[prevTokenIndex - 1] || null);
    }
  };

  const playToken = () => setIsPlaying(true);

  const STATE_MAPPING = {
    [AVAILABLE_PLAYBACK_STATES.REPEAT_ONE]: {
      icon: <Shuffle />,
      label: "Repeat One",
      endedFunction: () => {
        currentTime.current = 0;
        playerRef?.current?.seekTo?.(0);
      },
      nextStateFunction: () => {
        setPlaybackState(AVAILABLE_PLAYBACK_STATES.REPEAT_ALL);
      },
    },
    [AVAILABLE_PLAYBACK_STATES.REPEAT_ALL]: {
      icon: <Shuffle />,
      label: "Repeat All",
      endedFunction: () => {
        nextToken();
      },
      nextStateFunction: () => {
        setPlaybackState(AVAILABLE_PLAYBACK_STATES.PLAY_ALL);
      },
    },
    // [AVAILABLE_PLAYBACK_STATES.PLAY_ONCE]: {
    //   icon: <Shuffle />,
    //   label: 'Play Once',
    //   endedFunction: () => {
    //     setIsPlaying(false);
    //   },
    //   nextStateFunction: () => {
    //     setPlaybackState(AVAILABLE_PLAYBACK_STATES.PLAY_ALL);
    //   },
    // },
    [AVAILABLE_PLAYBACK_STATES.PLAY_ALL]: {
      icon: <Shuffle />,
      label: "Play All",
      endedFunction: () => {
        nextToken();
      },
      nextStateFunction: () => {
        setPlaybackState(AVAILABLE_PLAYBACK_STATES.REPEAT_ONE);
      },
    },
  };
  const handleOnEnded = () => {
    STATE_MAPPING[playbackState]?.endedFunction?.();
  };

  const resumeToken = () => setIsPlaying(true);

  const pauseToken = () => setIsPlaying(false);
  useEffect(() => {
    // console.log(
    //   'currentToken isPlaying',
    //   ipfsUrl(currentToken?.lossyAudioIPFSHash),
    //   isPlaying
    // );
  }, [currentToken, isPlaying]);
  // if (!Object.keys(currentPlaylist || {})?.length || !currentToken) return null;
  return (
    <div
      className={`fixed bottom-0 z-20 h-20 w-full bg-white ${
        !currentPlaylist?.tracks?.length && "!hidden"
      }`}
    >
      <MediaSession
        title={currentToken?.title || ""}
        artistName={currentToken?.artist?.name || ""}
        playToken={playToken}
        pauseToken={pauseToken}
        seekForward={seekForward}
        seekBackward={seekBackward}
        nextTrack={nextToken}
        previousTrack={prevToken}
        duration={songDuration.current}
        currentTime={currentTime.current}
        isPlaying={isPlaying}
        image={
          ipfsUrl(currentToken?.lossyArtworkIPFSHash) ||
          currentToken?.lossyArtworkURL ||
          ""
        }
      />
      <div className="invisible absolute h-0 w-0">
        <ReactPlayer
          // url="https://reamp.mypinata.cloud/ipfs/QmZfbQ5ZtkAMnZ2Zyc9WNgVxobKqLUZ1GYLEhMcHN8Y3wF"
          url={
            // mainipfsUrl(currentToken?.lossyAudioIPFSHash) ||
            currentToken?.lossyAudioIPFSHash
              ? audioIpfsUrl({ hash: currentToken?.lossyAudioIPFSHash })
              : currentToken?.lossyAudioURL || hackUrl
          }
          onPlay={() => {
            // console.log('play', { currentToken, isPlaying, isBuffering });
            playToken();
          }}
          playing={isPlaying}
          onReady={(r) => {
            // console.log('ready', r);
            setIsBuffering(false);
          }}
          volume={volume}
          onError={(e) => {
            if (currentToken) {
              // toast.error('Error playing song');
              nextToken();
            }
            // toast.error('Error playing song');
            // setFailAttempts(failAttempts + 1);
            // if (failAttempts > FAIL_ATTEMPTS) {
            //   console.log({ failAttempts, FAIL_ATTEMPTS });
            //   toast.error('Error playing song');
            //   setFailAttempts(0);
            //   nextToken();
            // }
            // nextToken();
            console.error("player bar error", e);
          }}
          onBuffer={() => {
            setIsBuffering(true);
          }}
          onDuration={(duration) => {
            songDuration.current = duration;
          }}
          onProgress={(progress) => {
            currentTime.current = progress.playedSeconds;
          }}
          ref={playerRef}
          onEnded={handleOnEnded}
          config={{
            file: {
              forceAudio: true,
            },
          }}
        />
      </div>

      <div className="mx-0 flex h-[80px] w-full  items-center border-t border-base-300 bg-base-100 align-middle sm:px-4">
        {currentPlaylist && (
          <div className="mx-4  flex w-full max-w-[1236px] items-center justify-between text-center sm:mx-auto">
            <div className="flex items-center lg:min-w-[10rem] ">
              <div className="relative h-[48px]  w-[48px] rounded bg-neutral-800 p-0">
                <ImageDisplay
                  url={currentToken?.lossyArtworkURL}
                  hash={currentToken?.lossyArtworkIPFSHash}
                  width={40}
                  quality={50}
                  alt={currentToken?.title || "Track"}
                  className="m-0 h-[48px] w-[48px] rounded p-0 opacity-90"
                  imgTagClassName="w-[48px] rounded opacity-90 p-0 m-0"
                  layout="fill"
                />
                {/* <Image
                 
                  alt={currentToken?.title}
                  height={48}
                  width={48}
                  src={
                    ipfsUrl(currentToken?.lossyArtworkIPFSHash) ||
                    currentToken?.lossyArtworkURL ||
                    '/placeholder/music-placeholder.png'
                  }
                /> */}
              </div>

              <div className="ml-2 hidden px-1 text-left sm:block">
                {currentToken?.candyMachines?.length > 0 ||
                currentToken?.tokens?.length > 0 ? (
                  <Link
                    href={
                      currentToken?.candyMachines?.length > 0
                        ? routes.dropDetails(
                            currentToken?.candyMachines[0].slug
                          )
                        : routes.tokenItemDetails(
                            currentToken?.tokens[0]?.mintAddress
                          )
                    }
                  >
                    <Typography
                      // ref={ref}
                      variant="caption"
                      className="cursor-pointer font-semibold leading-relaxed hover:text-primary"
                    >
                      {currentToken?.title?.substring(0, 10)}
                    </Typography>
                  </Link>
                ) : (
                  currentToken?.title?.substring(0, 10)
                )}
                <div className="flex space-x-2">
                  {getCreatorNames(currentToken).map((creator) => (
                    <>
                      <Link
                        href={routes.userProfile(creator.walletAddress)}
                        key={creator.walletAddress}
                      >
                        <Typography
                          // ref={ref}
                          variant="caption"
                          className="cursor-pointer opacity-70 hover:text-primary"
                        >
                          {creator.name}
                        </Typography>
                      </Link>
                    </>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="ml-2 block px-1 text-left sm:hidden">
                {currentToken?.candyMachines?.length > 0 ||
                currentToken?.tokens?.length > 0 ? (
                  <Link
                    href={
                      currentToken?.candyMachines?.length > 0
                        ? routes.dropDetails(
                            currentToken?.candyMachines[0].slug
                          )
                        : routes.tokenItemDetails(
                            currentToken?.tokens[0]?.mintAddress
                          )
                    }
                  >
                    <Typography
                      // ref={ref}
                      variant="caption"
                      className="cursor-pointer font-semibold leading-relaxed hover:text-primary"
                    >
                      {currentToken?.title?.substring(0, 10)}
                    </Typography>
                  </Link>
                ) : (
                  currentToken?.title?.substring(0, 10)
                )}

                {/* <div className="flex space-x-2 justify-center">
                  {getCreatorNames(currentToken).map((creator) => (
                    <Link
                      href={routes.userProfile(creator.walletAddress)}
                      key={creator.walletAddress}
                    >
                      <a>
                        <Typography
                          // ref={ref}
                          variant="caption"
                          className="cursor-pointer hover:text-primary opacity-70"
                        >
                          {creator.name}
                        </Typography>
                      </a>
                    </Link>
                  ))}
                </div> */}
              </div>
              <ControlSection
                handleShuffle={() => {
                  STATE_MAPPING[playbackState]?.nextStateFunction?.();
                }}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                handleNext={nextToken}
                handleBack={prevToken}
                playbackState={playbackState}
              />
            </div>

            <div className="hidden sm:flex">
              <PlayerRange
                className="lg:flex"
                step={1}
                value={currentTime.current}
                playerRef={playerRef}
                currentToken={currentToken}
                onMouseDown={() => null}
                onMouseUp={() => null}
                onChange={(e) => {
                  seekTo(parseFloat(e.target.value) || 0);
                }}
              />
            </div>
            <div className="hidden sm:flex">
              <VolumeRange
                className="hidden lg:flex "
                label={"Volume"}
                min="0"
                name="volume"
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>
            <div>
              <PlaylistButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bar;
