import type { NextPage } from "next";
// import { createServerSideHelpers } from "@trpc/react-query/server";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import superjson from "superjson";
// import Head from "next/head";
import DropHead from "@/components/battleDrops/DropHead";
import RecentlyAdded from "@/components/homePage/RecentSongs";
import RecentCreators from "@/components/homePage/RecentCreators";

const Home: NextPage = () => {
  return (
    <>
      {/* <Head>
        <title>NiftyTunes</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head> */}
      <DropHead />
      <div className="mt-20 flex flex-col space-y-14">
        <RecentlyAdded />
        <RecentCreators />
      </div>
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
    await helpers.battle.getHomePageBattle.prefetch(),
    await helpers.songs.getRecentTracks.prefetch(),
    await helpers.artist.getTopArtists.prefetch(),
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
}

export default Home;
