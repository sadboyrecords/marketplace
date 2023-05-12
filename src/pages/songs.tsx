import Typography from "@/components/typography";
import TrackItem from "@/components/track/TrackItem";
import { api } from "@/utils/api";
import { useState, useEffect } from "react";
import Button from "@/components/buttons/Button";
import Notification from "@/components/alertsNotifications/Notification";
import { type SongType } from "@/utils/types";

function Songs() {
  const [limit] = useState(15);
  const [allSongs, setAllSongs] = useState<SongType[]>([]);

  const songsQuery = api.songs.getAllSongsPaginated.useInfiniteQuery(
    { limit },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const {
    // data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = songsQuery;

  useEffect(() => {
    const songUpdates: SongType[] = [];
    songsQuery &&
      songsQuery?.data?.pages.forEach((page) => {
        // console.log({ page });
        page.songs.forEach((song) => {
          songUpdates.push(song);
        });
      });
    setAllSongs(songUpdates);
  }, [songsQuery.data]);

  console.log({ songsQuery });

  return (
    <>
      <Typography size="display-lg" type="h1" className="mb-10 font-bold">
        Songs
      </Typography>
      {isError && (
        <Notification
          type="error"
          secondaryMessage="There seems to be an error loading this page, please try again later"
        />
      )}
      <div>
        {isLoading && (
          <div>
            {TrackItem.loader}
            {TrackItem.loader}
            {TrackItem.loader}
            {TrackItem.loader}
          </div>
        )}
        {allSongs &&
          allSongs.map((song) => (
            <TrackItem
              playlistName=""
              key={song?.id}
              track={song}
              playlistTracks={allSongs}
              showPopover
            />
          ))}
      </div>
      {hasNextPage && (
        <div>
          <Button
            loading={isFetchingNextPage}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => fetchNextPage()}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  );
}

export default Songs;

// export async function getStaticProps() {
//   const ssg = await createProxySSGHelpers({
//     router: appRouter,
//     ctx: {
//       session: {
//         isAdmin: false,
//         isSuperAdmin: false,
//         user: {
//           walletAddress: '',
//         },
//       },
//     },
//     transformer: superjson, // optional - adds superjson serialization
//   });
//   Promise.allSettled([
//     await ssg.songs.getAllSongsPaginated.prefetchInfinite({
//       limit: 15,
//     }),
//   ]);

//   return {
//     props: {
//       apiState: ssg.dehydrate(),
//     },
//     // Next.js will attempt to re-generate the page:
//     // - When a request comes in
//     // - At most once every 10 seconds
//     revalidate: 60, // In seconds
//   };
// }
