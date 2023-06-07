import type { SongType, PlaylistType } from "@/utils/types";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import Typography from "../typography";
import PlayButton from "@/components/likes-plays/PlayButton";
import { routes } from "@/utils/constants";

import type { FindNftsByOwnerOutput, Nft } from "@metaplex-foundation/js";
import { useDispatch, useSelector } from "react-redux";
import { selectAudio, setCurrentSong } from "@/lib/slices/audioSlice";
import { useEffect, useState } from "react";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { toast } from "react-toastify";

type Props = {
  hideBottom?: boolean;
  fullWidth?: boolean;
  nft: Nft;
};

function TokenCard({ hideBottom, fullWidth, nft }: Props) {
  const { currentSong, isPlaying } = useSelector(selectAudio);
  const [track, setTrack] = useState<SongType>();
  //   const track: SongType = {
  //     id: nft?.address.toBase58() || "",
  //     lossyAudioURL: nft?.json?.,
  //   };
  const dispatch = useDispatch();
  const handlePlay = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    if (!track || !track.lossyAudioURL) {
      toast.warn("No audio file found");
      return;
    }
    dispatch(setCurrentSong(track));
  };

  useEffect(() => {
    if (nft) {
      const filtered = nft?.json?.properties?.files?.filter((f) =>
        f?.type?.includes("audio")
      );
      console.log({ filtered });
      const audioUri = filtered?.[0]?.uri;
      setTrack({
        id: audioUri || "",
        lossyAudioURL: audioUri || "",
        lossyArtworkURL: nft?.json?.image || "",
        title: nft?.json?.name || "",
        creators:
          nft?.creators
            .filter((f) => f.verified)
            .map((c) => ({
              walletAddress: c.address.toBase58(),
            })) || [],
      });
    }
  }, [nft]);

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      href={routes.tokenItemDetails(nft?.mintAddress?.toBase58() as string)}
      className="relative rounded-lg bg-base-300 p-4"
    >
      <div
        className={`relative  aspect-1 !overflow-hidden  !text-base-content ${
          fullWidth ? "w-full" : " w-[15rem]"
        } ${hideBottom ? "rounded-lg" : "rounded-t-lg "}`}
      >
        <div className="rounded-full border border-gray-neutral/60 p-1">
          <div className="rounded-full border border-gray-neutral/30 p-1">
            <div className="rounded-full border border-gray-neutral/30 p-1">
              <div className="rounded-full border border-gray-neutral/30 p-1">
                <div className="rounded-full border border-gray-neutral/30 p-1">
                  <div className="rounded-full border border-gray-neutral/30 p-1">
                    <div className="rounded-full border border-gray-neutral/30 p-1">
                      <div
                        className={`group relative z-10 h-full cursor-pointer rounded-full border border-gray-neutral/30 p-1`}
                        onClick={handlePlay}
                      >
                        <ImageDisplay
                          className={`brightness-85 aspect-1  h-full rounded-full object-cover text-base-content group-hover:brightness-50 ${
                            currentSong?.id === track?.id ? "brightness-50" : ""
                          }`}
                          url={nft?.json?.image || "/placeholder/triangle.svg"}
                          hash={null} //track?.lossyArtworkIPFSHash
                          width={200}
                          height={200}
                          imgTagClassName="rounded-full aspect-1 object-cover hover:brightness-50 brightness-80 group-hover:brightness-50"
                          //   path={track?.path || undefined}
                          //   pinnedStatus={track?.pinnedStatus}
                          //   publicImage={track?.isPublic}
                          //   fill
                          // layout="responsive"
                          // blurDataURL={track.src}
                          alt={"Nft Artwork"}
                          quality={20}
                        />
                        <div className="">
                          {currentSong?.id === track?.id && (
                            <div className="absolute bottom-0 left-0 right-0 top-0 m-auto flex items-center justify-center text-center">
                              {isPlaying ? (
                                <PauseIcon className="h-10 w-10 text-gray-200" />
                              ) : (
                                <PlayIcon className="h-10 w-10 text-gray-200" />
                              )}
                            </div>
                          )}

                          {currentSong?.id !== track?.id && (
                            <div className="invisible absolute bottom-0 left-0 right-0 top-0 m-auto flex items-center justify-center text-center group-hover:visible">
                              <PlayIcon className="h-10 w-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!hideBottom && (
        <div className="mt-2  flex w-full flex-wrap items-center justify-between space-x-2 rounded-b-lg text-white">
          {/* name, ispublic, created by, how many songs */}
          <div className="">
            <Typography className="font-bold">{nft?.name}</Typography>
          </div>
        </div>
      )}
    </Link>
  );
}

export default TokenCard;
