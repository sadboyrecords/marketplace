/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import Typography from "@/components/typography";
// import GenericImageCard from "@/components/GenericImageCard";
import Button from "@/components/buttons/Button";
// import { Notification } from "@/components/AlertsNotifications";
import Avatar from "@/components/avatar/Avatar";
import dynamic from "next/dynamic";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { getCreatorname } from "@/utils/helpers";
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import type { NextPage } from "next";
import type { ArtistType } from "@/utils/types";

// import { appRouter } from "server/router/_app";
// import { createProxySSGHelpers } from "@api/react-query/ssg";
// import superjson from "superjson";

const Notification = dynamic(
  () => import("@/components/alertsNotifications/Notification"),
  {
    ssr: false,
  }
);

const Artists: NextPage = () => {
  const artists = api.artist.getAllArtistsPaginated.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = artists;

  const [allArtists, setAllArtists] = useState<ArtistType[]>([]);

  useEffect(() => {
    const artistUpdates: ArtistType[] = [];
    data &&
      data.pages.forEach((page) => {
        // console.log({ page });
        page.creators.forEach((artist) => {
          artistUpdates.push(artist);
        });
      });
    setAllArtists(artistUpdates);
  }, [data]);
  // console.log({ allArtists, isLoading, hasNextPage, isError });

  return (
    <>
      <div className="">
        <Typography type="h1" size="display-lg" className="font-bold">
          Creators
        </Typography>
      </div>
      {isError && (
        <>
          <Notification type="error" />
        </>
      )}
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-14 sm:grid-cols-3  md:grid-cols-4 xl:grid-cols-6">
        {isLoading && (
          <>
            <div className="mask mask-squircle h-full w-full animate-pulse bg-neutral-content/40" />
            <div className="mask mask-squircle h-full w-full animate-pulse bg-neutral-content/40" />
            <div className="mask mask-squircle h-full w-full animate-pulse bg-neutral-content/40" />
            <div className="mask mask-squircle h-full w-full animate-pulse bg-neutral-content/40" />
            <div className="mask mask-squircle h-full w-full animate-pulse bg-neutral-content/40" />
          </>
        )}
        {allArtists &&
          allArtists.map((artist) => (
            <Link
              href={routes.userProfile(artist?.walletAddress || "")}
              key={artist.id}
            >
              <div className=" cursor-pointer text-center" key={artist.id}>
                <Avatar
                  username={artist?.walletAddress || ""}
                  alt={artist?.walletAddress || "artist picture "}
                  widthNumber={150}
                  heightNumber={150}
                  path={artist?.pinnedProfilePicture?.path}
                  pinnedStatus={artist?.pinnedProfilePicture?.status}
                  imageHash={artist?.profilePictureHash || undefined}
                />
                <div className="">
                  <Typography className="mt-4 truncate hover:text-primary">
                    @{" "}
                    {getCreatorname({
                      name: artist?.name || artist?.firstName || "",
                      walletAddress: artist?.walletAddress || "",
                    })}
                  </Typography>
                </div>
              </div>
            </Link>
          ))}
        {/* {(isLoading || isError) && (
          <>
            {GenericImageCard.loader}
            {GenericImageCard.loader}
            {GenericImageCard.loader}
            {GenericImageCard.loader}
          </>
        )} */}
      </div>
      {hasNextPage && (
        <div className="mt-4">
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
            {" "}
            Load More
          </Button>
        </div>
      )}
    </>
  );
};

export async function getStaticProps() {
  //
  const helpers = createServerSideHelpers({
    router: appRouter,
    // ctx: await createContext(),
    ctx: {
      session: null,
      ip: "",
      prisma,
    },
    transformer: superjson,
  });

  void Promise.allSettled([
    await helpers.artist.getAllArtistsPaginated.prefetchInfinite({
      limit: 20,
    }),
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 30, // In seconds
  };
}
export default Artists;

// export async function getStaticProps() {
//   const ssg = await createProxySSGHelpers({
//     router: appRouter,
//     ctx: {
//       session: {
//         user: {
//           walletAddress: '',
//         },
//         isAdmin: false,
//         isSuperAdmin: false,
//       },
//     },
//     transformer: superjson, // optional - adds superjson serialization
//   });
//   Promise.allSettled([
//     await ssg.artist.getAllArtistsPaginated.prefetchInfinite({
//       limit: 20,
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
