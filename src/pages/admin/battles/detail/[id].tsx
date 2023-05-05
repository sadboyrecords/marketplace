/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
// import MintingContainer from '@/components/MintingContainer';
// import { addresses } from "@/utils/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Typography from "@/components/typography";
import BattleCard from "@/components/battleDrops/BattleCard";
import SolIcon from "@/components/iconComponents/SolIcon";
import Countdown from "@/components/countdown/Countdown";
import Button from "@/components/buttons/Button";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { toast } from "react-toastify";
import { Toggle, ToggleItem } from "@tremor/react";

function BattleDetails() {
  const today = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(today.getDate() - 14);

  const { publicKey } = useWallet();
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, refetch } = api.battle.getBattleById.useQuery(
    { battleId: id as string },
    {
      enabled: !!id,
    }
  );

  const activateBattle = api.battle.activateBattle.useMutation();
  const mintingInprogress = !!(
    data?.battleContestants[0]?.candyMachineDraft?.status !== "DRAFT" ||
    data?.battleContestants[1]?.candyMachineDraft?.status !== "DRAFT"
  );
  const [isReady, setIsReady] = React.useState<boolean>(false);

  const handleActivate = async () => {
    try {
      if (!data?.id) return;
      await activateBattle.mutateAsync({ battleId: data?.id });
      toast.success("Battle activated successfully");
      await refetch();
    } catch (error) {
      toast.error("Error activating battle");
    }
  };

  const handleDisplayOnHomePage = async () => {
    console.log("firing");
    try {
      if (!data?.id) return;
      await api.battle.displayOnHome.useMutation().mutateAsync({
        battleId: data?.id,
        displayOnHome: !data?.displayOnHomePage,
      });
      toast.success("Battle displayed on homepage successfully");
      await refetch();
    } catch (error) {
      toast.error("Error displaying battle on homepage");
    }
  };

  React.useMemo(() => {
    const checkIfReady = () => {
      if (
        data?.battleContestants[0]?.candyMachineDraft?.status === "LAUNCHED" &&
        data?.battleContestants[1]?.candyMachineDraft?.status === "LAUNCHED"
      ) {
        setIsReady(true);
      }
    };
    void checkIfReady();
  }, [data]);
  if (isLoading && !data) {
    return (
      <div>
        <div className="h-4 w-1/4 animate-pulse bg-border-gray" />
      </div>
    );
  }

  if (
    (data?.createdByWallet !== publicKey?.toBase58() || !publicKey) &&
    !data?.isActive
  ) {
    return (
      <div className="flex flex-col space-y-4">
        <Typography> You do not have access to view this battle</Typography>
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography className="font-bold" size="display-lg">
            {data?.battleName}
          </Typography>
          <div className="badge">{data?.isActive ? "Active" : "Inactive"}</div>
          {data?.isActive && (
            <div className="form-control w-56">
              <label className="label cursor-pointer">
                <span className="label-text">Display on home page</span>
                <input
                  type="checkbox"
                  className="toggle-primary toggle toggle-sm"
                  onChange={handleDisplayOnHomePage}
                  // checked={false}
                />
              </label>
            </div>
          )}
        </div>
        {!mintingInprogress && (
          <Link href={routes.editBattle(data?.id)}>
            <Button> Edit</Button>
          </Link>
        )}
        {isReady && !data?.isActive && (
          <Button onClick={handleActivate} loading={activateBattle.isLoading}>
            Activate
          </Button>
        )}
      </div>

      <div className="flex h-full w-full flex-col  lg:flex-row lg:space-x-7">
        {/* grid auto-cols-max grid-flow-col-dense  gap-4 md:grid-cols-3 */}
        {/* grid-cols-1 md:grid-cols-3 */}
        <div className=" w-full lg:h-auto lg:w-5/12 ">
          <BattleCard index={0} battle={data} />
        </div>

        <div className="flex flex-col items-center justify-between">
          <div className="flex flex-1 items-center">
            <div className="w-40 text-center">
              <Typography
                className="font-bold"
                size="display-xs"
                color="primary"
              >
                VS
              </Typography>
              <Countdown
                displayTimeBadge
                fullWidth
                fullSpread
                // inProgress
                startDate={data?.battleStartDate}
                endDate={data?.battleEndDate}
                startDateText="Starts In"
                endDateText="Ends In"
                textBefore
              />
            </div>
          </div>
          {data?.isActive && (
            <div className="flex w-full flex-col items-center text-center">
              <div className="flex items-center space-x-2">
                <SolIcon className="h-4 w-4" />
                <Typography size="display-xs" className=" font-semibold">
                  200
                </Typography>
              </div>
              <Typography size="body-xs">($4,000 USD)</Typography>
            </div>
          )}
        </div>
        <div className="w-full lg:h-auto lg:w-5/12 ">
          {/* flex-auto */}
          <BattleCard index={1} battle={data} />
        </div>
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

export default BattleDetails;
