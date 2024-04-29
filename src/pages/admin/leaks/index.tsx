import React from "react";
import Typography from "@/components/typography";
import { api } from "@/utils/api";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { useSession } from "next-auth/react";

function AllLeaks() {
  const { data: session, status } = useSession();
  const { data, isLoading, isError } = api.leaks.getAllLeaks.useQuery(
    undefined,
    {
      enabled: !!session?.user?.isAdmin,
    }
  );

  console.log({ data });

  if (!session?.user?.isAdmin && status !== "loading") {
    return (
      <Typography size="body" color="neutral-content">
        You are not authorized to view this page.
      </Typography>
    );
  }

  if ((isLoading && !data) || status === "loading") {
    return (
      <div>
        <div className="h-4 w-1/4 animate-pulse bg-border-gray" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col space-y-4">
        <Typography> Error fetching leakInfos</Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography size="display-lg">View All Leaks</Typography>
      {/* <MintingContainer /> */}
      <div className="mt-8 flex flex-col space-y-4 border-b border-border-gray pb-6">
        {data?.map((leakInfo) => (
          <div key={leakInfo.id}>
            <Link
              href={routes.leakDetails(leakInfo.slug)}
              className="indicator flex items-center space-x-2"
            >
              {/* <span className="badge-primary badge indicator-item"></span> */}

              <Typography>{leakInfo.leakName}</Typography>
              <Typography size="body-xs" color="neutral-gray">
                {leakInfo.isFeatured ? "(Displayed on home)" : ""}
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

export default AllLeaks;
