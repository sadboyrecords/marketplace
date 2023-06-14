import { useRef } from "react";
import ReactPlayer from "react-player/lazy";
import { useSelector, useDispatch } from "react-redux";
import {
  setDuration,
  setProgress,
  selectAudio,
  onEnd,
} from "@/lib/slices/audioSlice";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import Link from "next/link";
import { routes } from "@/utils/constants";
import Typography from "@/components/typography";
import { getCreatorNames } from "@/utils/helpers";
import { audioIpfsUrl } from "@/utils/helpers";
import PlayerRange from "./Range";
import ControlSection from "./ControlSection";
import PlaylistButton from "./PlaylistButton";
import VolumeButton from "./VolumeButton";

function PlayerBar() {
  const playerRef = useRef(null) as React.MutableRefObject<ReactPlayer | null>;
  const { currentSong, isPlaying, volume } = useSelector(selectAudio);
  // const currentSong = useSelector(selectCurrentSong);
  // const isPlaying = useSelector(selectIsPlaying);
  // const audioUrl = audioIpfsUrl({ hash: currentSong?.lossyAudioIPFSHash });
  const dispatch = useDispatch();

  // console.log({
  //   currentSong,
  //   isPlaying,
  //   hash: currentSong?.lossyAudioIPFSHash,
  //   audioUrl,
  // });

  return (
    <>
      {currentSong && (
        <div className="fixed bottom-0 z-30 h-24 w-full border-t border-border-gray bg-base-100 ">
          {currentSong && (
            <div className="hidden">
              <ReactPlayer
                ref={playerRef}
                url={
                  currentSong?.lossyAudioIPFSHash
                    ? audioIpfsUrl({ hash: currentSong?.lossyAudioIPFSHash })
                    : currentSong?.lossyAudioURL
                }
                volume={volume}
                onPlay={() => {
                  console.log("onPlay");
                }}
                onProgress={(p) => {
                  dispatch(setProgress(p));
                }}
                onDuration={(d) => {
                  dispatch(setDuration(d));
                }}
                onEnded={() => {
                  playerRef.current?.seekTo(parseFloat("0"));
                  dispatch(onEnd());
                }}
                playing={isPlaying}
                config={{
                  file: {
                    forceAudio: true,
                  },
                }}
                // onError={(e) => {
                //   console.log({ e });
                // }}
              />
            </div>
          )}
          <div className=" relative flex h-full w-full  items-center border-t border-base-300 bg-base-100 align-middle">
            {currentSong && (
              <div className=" w-full">
                <div className="absolute top-0 w-full sm:hidden">
                  <PlayerRange hideNumber className="" playerRef={playerRef} />
                </div>
                <div className="mx-4 flex w-full max-w-7xl  items-center gap-4 px-4 text-center sm:mx-auto ">
                  {/* IMAGE + TITLE + NAMES LG */}
                  <div className="flex max-w-sm items-center lg:min-w-[20rem] ">
                    {/* IMAGE */}
                    <div className="relative  h-16  w-16 rounded bg-neutral-800 p-0">
                      <ImageDisplay
                        url={currentSong?.lossyArtworkURL || undefined}
                        hash={currentSong?.lossyArtworkIPFSHash || null}
                        width={40}
                        quality={50}
                        alt={currentSong?.title || "Track"}
                        className="m-0  rounded p-0 opacity-90"
                        imgTagClassName="w-16 rounded opacity-90 p-0 m-0"
                        // layout="fill"
                        fill
                      />
                    </div>
                    {/* TITLE + Creator names  */}
                    <div className="ml-2 hidden px-1 text-left md:block">
                      {(currentSong?.candyMachines &&
                        currentSong?.candyMachines?.length > 0) ||
                      (currentSong?.tokens &&
                        currentSong?.tokens?.length > 0) ? (
                        <Link
                          href={
                            currentSong?.candyMachines &&
                            currentSong?.candyMachines?.length > 0
                              ? routes.dropDetails(
                                  currentSong?.candyMachines[0]?.slug as string
                                )
                              : routes.tokenItemDetails(
                                  (currentSong?.tokens &&
                                    (currentSong?.tokens[0]
                                      ?.mintAddress as string)) ||
                                    ""
                                )
                          }
                        >
                          <Typography
                            size="body"
                            className="cursor-pointer font-semibold leading-relaxed hover:text-primary"
                          >
                            {currentSong?.title}
                          </Typography>
                        </Link>
                      ) : (
                        currentSong?.title
                      )}
                      <div className="flex space-x-2">
                        {getCreatorNames(currentSong).map((creator) => (
                          <Link
                            href={routes.userProfile(creator.walletAddress)}
                            key={creator.walletAddress}
                          >
                            <Typography
                              size="body-xs"
                              className="cursor-pointer opacity-70 hover:text-primary"
                            >
                              {creator.name}
                            </Typography>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-1 flex-col items-center gap-3">
                    {/* IMAGE + TITLE + NAMES SM */}
                    <div className="ml-2 block px-1 text-left md:hidden">
                      {(currentSong?.candyMachines &&
                        currentSong?.candyMachines?.length > 0) ||
                      (currentSong?.tokens &&
                        currentSong?.tokens?.length > 0) ? (
                        <Link
                          href={
                            currentSong?.candyMachines &&
                            currentSong?.candyMachines?.length > 0
                              ? routes.dropDetails(
                                  currentSong?.candyMachines[0]?.slug as string
                                )
                              : routes.tokenItemDetails(
                                  (currentSong?.tokens &&
                                    (currentSong?.tokens[0]
                                      ?.mintAddress as string)) ||
                                    ""
                                )
                          }
                        >
                          <Typography
                            size="body-xs"
                            className="cursor-pointer font-semibold leading-relaxed hover:text-primary"
                          >
                            {currentSong?.title?.substring(0, 10)}
                          </Typography>
                        </Link>
                      ) : (
                        currentSong?.title?.substring(0, 10)
                      )}
                    </div>
                    <ControlSection playerRef={playerRef} />
                    <PlayerRange
                      className="hidden w-full sm:flex"
                      playerRef={playerRef}
                    />
                  </div>
                  <div className="flex items-center lg:ml-10">
                    <VolumeButton />
                    <PlaylistButton />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PlayerBar;
