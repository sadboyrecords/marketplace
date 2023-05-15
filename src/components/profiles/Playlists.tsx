import MarginLayout from "@/components/layouts/MarginLayout";
import Typography from "@/components/typography";
import { api } from "@/utils/api";
import TrackItem from "@/components/track/TrackItem";
import PlaylistCard from "@/components/playlist/PlaylistCard";
import { routes } from "@/utils/constants";
import Link from "next/link";

type Props = {
  walletAddress: string | undefined;
};

function UserSongs({ walletAddress }: Props) {
  const { data: playlists, isLoading } =
    api.playlist.getPlaylistByUser.useQuery(
      {
        walletAddress: walletAddress || "",
      },
      {
        enabled: !!walletAddress,
      }
    );

  if (isLoading)
    return (
      <MarginLayout>
        <div className=" h-4 w-32 animate-pulse bg-slate-500/30" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2">
          {TrackItem.loader}
          {TrackItem.loader}
          {TrackItem.loader}
          {TrackItem.loader}
        </div>
      </MarginLayout>
    );

  return (
    <MarginLayout>
      <Typography className="font-bold tracking-wider" size="display-xs">
        Playlists
      </Typography>
      <Typography className="" size="body-sm" color="neutral-gray">
        {playlists?.length} Playlists Created
      </Typography>
      <div className="mt-8 flex space-x-10 overflow-scroll ">
        {/* grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 */}
        {playlists?.map((p) => (
          <Link key={p?.id} href={routes.playlistDetail(p?.id)}>
            <PlaylistCard playlist={p} songs={p.songs} />
          </Link>
        ))}
      </div>
    </MarginLayout>
  );
}

export default UserSongs;
