import NewBattle from "@/components/forms/NewBattle";
import Typography from "@/components/typography";
import { useSession } from "next-auth/react";

function BattleDetails() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex max-w-lg flex-col space-y-8">
        <div className="h-4 w-1/4 animate-pulse bg-border-gray" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
      </div>
    );
  }

  if (!session || !session?.user?.walletAddress) {
    return (
      <div>
        <Typography size="body" color="neutral-content">
          You must be logged in to view this page.
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography type="h1" size="display-md" className="font-bold">
        Edit Battle
      </Typography>
      <NewBattle isEditing />
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

export default BattleDetails;
