import Typography from "@/components/typography";
import type { BattleType, BattleTypeSummary } from "@/utils/types";
import BattleCard from "@/components/battleDrops/BattleCard";
import SolIcon from "@/components/iconComponents/SolIcon";
import Countdown from "@/components/countdown/Countdown";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { useState, useMemo } from "react";
// import { useConnection } from "@solana/wallet-adapter-react";
// import { PublicKey } from "@metaplex-foundation/js";

function LineUp({ data }: { data: BattleType | BattleTypeSummary }) {
  // const { connection } = useConnection();

  // void (() => {
  //   connection.onLogs(
  //     new PublicKey("6yUPiLfYuzyA35oqy1prJ8SJWbkdDNXrhecoEf1TSfXH"),
  //     (logs, context) => console.log("Updated account info: ", logs),
  //     "confirmed"
  //   );

  // })();

  // useEffect(() => {}, []);

  const { candyMachines, solUsdPrice } = useMetaplex();
  const id1 = data?.battleContestants[0]?.candyMachineDraft.candyMachineId;
  const id2 = data?.battleContestants[1]?.candyMachineDraft.candyMachineId;
  const [totalPot, setTotalPot] = useState<{
    usd: number;
    sol: number;
    items: number;
  }>();

  useMemo(() => {
    if (candyMachines && id1 && id2) {
      const candyMachine1 = candyMachines[id1];
      const candyMachine2 = candyMachines[id2];

      if (
        candyMachine1?.items &&
        candyMachine2?.items &&
        solUsdPrice &&
        data?.battlePrice
      ) {
        const solTotal =
          (candyMachine1.items?.redeemed + candyMachine2.items?.redeemed) *
          data.battlePrice;

        setTotalPot({
          usd: solTotal * solUsdPrice,
          sol: solTotal,
          items: candyMachine1.items?.redeemed + candyMachine2.items?.redeemed,
        });
      }
    }
  }, [candyMachines, id1, id2, solUsdPrice, data?.battlePrice]);

  return (
    <div className="flex h-full w-full flex-col  space-y-12 lg:flex-row lg:space-x-7  lg:space-y-0">
      {/* grid auto-cols-max grid-flow-col-dense  gap-4 md:grid-cols-3 */}
      {/* grid-cols-1 md:grid-cols-3 */}
      <div className=" w-full  lg:w-5/12 ">
        <BattleCard
          index={0}
          competitorIndex={1}
          battle={data}
          totalPot={totalPot}
        />
      </div>

      <div className="flex flex-col items-center justify-between">
        {data?.isActive && (
          <div className="flex w-full flex-col items-center text-center">
            <Typography size="body-xs">Total Pot</Typography>
            <div className="flex items-center space-x-2">
              {/* <SolIcon className="h-4 w-4" /> */}
              <Typography size="display-xs" className=" font-semibold">
                $ {totalPot?.sol.toFixed(2)} USD
              </Typography>
            </div>

            {/* <Typography size="body-xs">
              (${totalPot?.usd.toFixed(2)} USD)
            </Typography> */}
          </div>
        )}
        <div className="flex flex-1 items-center">
          <div className="w-40 text-center">
            <Typography className="font-bold" size="display-xs" color="primary">
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
      </div>
      <div className="h-full w-full  lg:w-5/12 ">
        <BattleCard
          index={1}
          competitorIndex={0}
          battle={data}
          totalPot={totalPot}
        />
      </div>
    </div>
  );
}

export default LineUp;
