import type { SongType, PlaylistType } from "@/utils/types";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import Typography from "../typography";
import PlayButton from "@/components/likes-plays/PlayButton";
import { getCreatorname } from "@/utils/helpers";

type Props = {
  songs: SongType[];
  playlist: PlaylistType;
  hideBottom?: boolean;
  fullWidth?: boolean;
};

function PlaylistCard({ songs, playlist, hideBottom, fullWidth }: Props) {
  const imageList: {
    url?: string | null;
    alt?: string | null;
    hash?: string | null;
    width?: number | null;
    height?: number | null;
    path?: string | null;
    pinnedStatus?: string;
    id: string;
    isPublic?: boolean;
  }[] = songs?.slice(0, 4).map((track, i) => {
    return {
      url: track?.lossyArtworkURL,
      hash: track?.lossyArtworkIPFSHash,
      width: track?.pinnedImage?.width,
      height: track?.pinnedImage?.height,
      path: track?.pinnedImage?.path,
      pinnedStatus: track?.pinnedImage?.status,
      alt: "Song Artwork",
      id: track?.id || i.toString(),
    };
  });

  while (imageList?.length < 4) {
    // is light mode
    imageList.push({
      //   url: "/placeholder/triangle.svg",
      url: "/placeholder/banners/music-note.jpg",
      alt: "placeholder",
      id: "placeholder",
      isPublic: true,
      width: 400,
      height: 400,
    });
  }

  if (!playlist) return null;
  return (
    <div className="relative ">
      <div
        className={`relative grid  grid-cols-2  !overflow-hidden !text-base-content ${
          fullWidth ? "w-full" : "w-[18rem] "
        } ${hideBottom ? "rounded-lg" : "rounded-t-lg "}`}
      >
        {imageList?.map((track, index) => (
          <div key={`${track.id}${index}`} className={`h-[8rem]" relative`}>
            <ImageDisplay
              className="aspect-1 h-full object-cover text-base-content"
              url={track?.url || "/placeholder/triangle.svg"}
              hash={track?.hash || null} //track?.lossyArtworkIPFSHash
              width={track?.width || 200}
              height={track?.height || 200}
              path={track?.path || undefined}
              pinnedStatus={track?.pinnedStatus}
              publicImage={track?.isPublic}
              //   fill
              // layout="responsive"
              // blurDataURL={track.src}
              alt={track.alt || "Song Artwork"}
              quality={20}
            />
          </div>
        ))}
      </div>
      {!hideBottom && (
        <div className="flex min-h-[5rem]  w-full flex-wrap items-center justify-between space-x-2 rounded-b-lg bg-black p-4 text-white">
          {/* name, ispublic, created by, how many songs */}
          <div className="">
            <Typography color="neutral-gray" size="body-xs" className="mb-1">
              By:{" "}
              {getCreatorname({
                name:
                  playlist?.creator?.name || playlist?.creator?.firstName || "",
                walletAddress: playlist?.creator?.walletAddress || "",
              })}
            </Typography>
            <Typography className="font-bold" color="neutral-gray">
              {playlist?.name || "Playlist"}
            </Typography>
            <Typography color="neutral-gray" size="body-xs" className="">
              {songs?.length} Song{songs?.length > 1 && "s"}
            </Typography>
          </div>
          {!playlist?.isPublic && (
            <div>
              <span
                className={
                  "inline-flex items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700"
                }
              >
                Private
              </span>
            </div>
          )}

          <div onClick={(e) => e.preventDefault()} className="z-20">
            {songs?.length > 0 && (
              <PlayButton
                playlistName={playlist?.name || "Playlist"}
                tracks={songs}
                song={songs[0] as SongType}
                // disabled={songs?.length > 0}
              />
            )}
          </div>

          {/* • {songs?.length} Song */}
        </div>
      )}
    </div>
  );
}

export default PlaylistCard;
