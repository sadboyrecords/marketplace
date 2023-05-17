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
import LineUp from "@/components/battleDrops/LineUp";
import { useSession } from "next-auth/react";

function BattleDetails() {
  const today = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(today.getDate() - 14);

  const { publicKey } = useWallet();
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, refetch } = api.battle.getBattleById.useQuery(
    { battleId: id as string },
    {
      enabled: !!id,
    }
  );

  const activateBattle = api.battle.activateBattle.useMutation();

  const display = api.battle.displayOnHome.useMutation();
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
      await display.mutateAsync({
        battleId: data?.id,
        displayOnHome: !data?.displayOnHomePage,
      });
      toast.success("Battle displayed on homepage successfully");
      await refetch();
    } catch (error) {
      console.log(error);
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
  console.log({ data });

  if ((!session?.user.isAdmin || !publicKey) && !data?.isActive) {
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
                  checked={data?.displayOnHomePage}
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
      {data && <LineUp data={data} />}
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
