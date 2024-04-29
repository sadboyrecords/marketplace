/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Typography from "@/components/typography";
import Button from "@/components/buttons/Button";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { toast } from "react-toastify";
import LineUp from "@/components/battleDrops/LineUp";
import { useSession } from "next-auth/react";
import { Switch } from "@headlessui/react";
import dayjs from "dayjs";
import LeakDetailsComponent from "@/components/leaks/LeakDetails";

function LeakDetails() {
  const today = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(today.getDate() - 14);

  const { data: session, status } = useSession();
  const router = useRouter();
  const { slug } = router.query;
  const { data, isLoading, refetch } = api.leaks.getLeak.useQuery(
    { slug: slug as string },
    {
      enabled: !!slug && !!session?.user?.isAdmin,
    }
  );

  const activateBattle = api.battle.activateBattle.useMutation();

  const display = api.leaks.displayOnHomePage.useMutation();
  const activate = api.leaks.activateLeak.useMutation();

  const [isReady, setIsReady] = React.useState<boolean>(false);

  const [toggleLoading, setToggleLoading] = React.useState<boolean>(false);
  const handleDisplayOnHomePage = async () => {
    console.log("firing");
    try {
      if (!data?.id) return;
      setToggleLoading(true);
      await display.mutateAsync({
        leakId: data?.id,
        featureOnHome: !data?.isFeatured,
      });
      toast.success("Success");
      await refetch();
      setToggleLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error");
      setToggleLoading(false);
    }
  };
  const handleActivate = async () => {
    console.log("firing");
    try {
      if (!data?.id) return;
      setToggleLoading(true);
      await activate.mutateAsync({
        leakId: data?.id,
        activate: !data?.isPublic,
      });
      toast.success("Success");
      await refetch();
      setToggleLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Sorry there was an error");
      setToggleLoading(false);
    }
  };

  if (!session?.user?.isAdmin && status !== "loading") {
    return (
      <Typography size="body" color="neutral-content">
        You are not authorized to view this page.
      </Typography>
    );
  }

  if (isLoading && !data) {
    return (
      <div>
        <div className="h-4 w-1/4 animate-pulse bg-border-gray" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography className="font-bold" size="display-lg">
            {data?.leakName}
          </Typography>
          <div className="form-control w-56">
            <label className="label cursor-pointer">
              <span className="label-text">Make Public</span>
              <Switch
                checked={data?.isPublic}
                onChange={handleActivate}
                className={`${
                  data?.isPublic ? "bg-primary-600" : "bg-gray-neutral"
                } relative inline-flex h-5 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`${
                    data?.isPublic ? "translate-x-6" : "translate-x-1"
                  } inline-block h-3 w-3 transform ${
                    toggleLoading ? "animate-ping" : ""
                  } rounded-full bg-white transition`}
                />
              </Switch>
            </label>
          </div>
          <div className="form-control w-56">
            <label className="label cursor-pointer">
              <span className="label-text">Display on home page</span>
              <Switch
                checked={data?.isFeatured}
                onChange={handleDisplayOnHomePage}
                className={`${
                  data?.isFeatured ? "bg-primary-600" : "bg-gray-neutral"
                } relative inline-flex h-5 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`${
                    data?.isFeatured ? "translate-x-6" : "translate-x-1"
                  } inline-block h-3 w-3 transform ${
                    toggleLoading ? "animate-ping" : ""
                  } rounded-full bg-white transition`}
                />
              </Switch>
            </label>
          </div>
        </div>
        <Link href={routes.editLeak(data?.slug || "")}>
          <Button> Edit</Button>
        </Link>
      </div>
      <Typography className="font-bold">Details</Typography>

      <LeakDetailsComponent />

      {/* {data && <LineUp data={data} />} */}
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

export default LeakDetails;
