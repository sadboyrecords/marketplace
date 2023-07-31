import React from "react";
import Typography from "@/components/typography";
import { api } from "@/utils/api";
import Link from "next/link";
import { routes } from "@/utils/constants";

function AllBattles() {
  const { data, isLoading, isError } = api.battle.getAllBattles.useQuery();

  console.log({ data });

  if (isLoading && !data) {
    return (
      <div>
        <div className="h-4 w-1/4 animate-pulse bg-border-gray" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col space-y-4">
        <Typography> Error fetching battles</Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography size="display-lg">View All Battles</Typography>
      {/* <MintingContainer /> */}
      <div className="mt-8 flex flex-col space-y-4 border-b border-border-gray pb-6">
        {data?.map((battle) => (
          <div key={battle.id}>
            <Link
              href={routes.battleDetails(battle.id)}
              className="indicator flex items-center space-x-2"
            >
              {/* <span className="badge-primary badge indicator-item"></span> */}

              <Typography>{battle.battleName}</Typography>
              <Typography size="body-xs" color="neutral-gray">
                {battle.displayOnHomePage ? "(Displayed on home)" : ""}
                <span> </span>
              </Typography>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps = async ({ res }) => {
//   return {
//     // returns the default 404 page with a status code of 404 in production
//     // notFound: process.env.NEXT_ENV === 'prod',
//     props: {},
//   };
// };

export default AllBattles;
