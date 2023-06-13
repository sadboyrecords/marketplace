import Typography from "@/components/typography";
import { api } from "@/utils/api";
import TrackItem from "@/components/track/TrackItem";

function RecentlyAdded() {
  const songsQuery = api.songs.getRecentTracks.useQuery();

  const { data, isLoading } = songsQuery;
  console.log({ data });

  return (
    <div className="">
      <Typography className="font-bold tracking-wider" size="display-xs">
        Recently Added Songs
      </Typography>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {isLoading && (
          <>
            {TrackItem.loader}
            {TrackItem.loader}
            {TrackItem.loader}
            {TrackItem.loader}
          </>
        )}
        {data?.map((song) => (
          <TrackItem
            key={song?.id}
            track={song}
            playlistTracks={data}
            playlistName="Recently Added"
            showPopover
          />
        ))}
      </div>
    </div>
  );
}

export default RecentlyAdded;
