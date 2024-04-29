import React from "react";
import { api } from "@/utils/api";
import { getSupporters } from "@/utils/audioHelpers";
import { useDispatch } from "react-redux";
import {
  openTopFansModal,
  openJoinBattleFansModal,
  setBattleWinner,
} from "@/lib/slices/appSlice";

interface Props {
  candyMachineId: string;
  hasEnded: boolean;
}

function Supporters({ candyMachineId, hasEnded }: Props) {
  const transactions = api.transaction.getCandyTransactions.useQuery(
    {
      candymachineId: candyMachineId || "",
    },
    {
      enabled: !!candyMachineId,
    }
  );

  // const supporters = getSupporters(transactions?.data);
  const dispatch = useDispatch();
  // const handleOpenSupporters = () => {
  //   if (supporters) {
  //     dispatch(
  //       openJoinBattleFansModal({
  //         supporters,
  //         competitorCandyId,
  //         candymachineId: candyMachineId || "",
  //         artistName,
  //       })
  //     );
  //   }
  // };
  // const handleOpenTopFans = () => {
  //   if (supporters) {
  //     dispatch(
  //       openTopFansModal({
  //         supporters,
  //         competitorCandyId,
  //         candymachineId: candyMachineId || "",
  //         artistName,
  //         isEnded: candyMachine?.guardsAndEligibility?.[0]?.hasEnded,
  //       })
  //     );
  //   }
  // };
  return (
    <div>
      <div className="">
        {/* <div
          onClick={
            candyMachine.guardsAndEligibility?.[0]?.hasEnded
              ? handleOpenTopFans
              : handleOpenSupporters
          }
          className="flex h-8 cursor-pointer  items-center justify-between space-x-1"
        >
          <Typography size="body-xs" className="text-neutral-content">
            Supporters
          </Typography>
          <div className="flex flex-1 items-center overflow-scroll">
            <div className="isolate flex flex-shrink cursor-pointer -space-x-3 overflow-scroll">
              {supporters &&
                Object?.keys(supporters).map((key) => (
                  <div
                    key={key}
                    // href={routes.userProfile(key)}
                    // target="_blank"
                  >
                    <AvatarImage
                      alt="artist profile picture"
                      username={key}
                      height={supporters[
                        key
                      ]?.[0]?.user?.pinnedProfilePicture?.height?.toString()}
                      width={supporters[
                        key
                      ]?.[0]?.user?.pinnedProfilePicture?.width?.toString()}
                      path={
                        supporters[key]?.[0]?.user?.pinnedProfilePicture?.path
                      }
                      pinnedStatus={
                        supporters[key]?.[0]?.user?.pinnedProfilePicture?.status
                      }
                      imageHash={
                        supporters[key]?.[0]?.user?.pinnedProfilePicture
                          ?.ipfsHash
                      }
                      type="circle"
                      // className="h-6"
                      widthNumber={30}
                      heightNumber={30}
                    />
                  </div>
                ))}
            </div>
          </div>
          {percentagePot && (
            <Typography size="body-xs" className="text-neutral-content">
              {percentagePot.toFixed(2)}% of pot
            </Typography>
          )}
        </div> */}

        {/* <progress
          className="progress progress-primary h-1 w-full bg-base-300"
          value={percentagePot || 0}
          max={100}
        ></progress> */}
        {/* <div className="w-full"></div> */}
      </div>

      {/* BUY SECTION  */}
      {/* {candyMachineId &&
        competitorCandyId &&
        !candyMachine.guardsAndEligibility?.[0]?.hasEnded && (
          <Buy
            candyMachineId={candyMachineId}
            competitorCandyId={competitorCandyId}
          />
        )} */}

      {/* <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 ">
                  <SolIcon height={20} />
                  <Typography size="body-xl" className="">
                    {battle?.battlePrice}
                    {solUsdPrice && (
                      <span className="ml-2 text-sm text-neutral-content">
                        ({(solUsdPrice * (battle?.battlePrice || 0)).toFixed(2)}{" "}
                        usd)
                      </span>
                    )}
                  </Typography>
                </div>
              </div>

              <div className="text-center ">
                {publicKey || session ? (
                  <>
                    <div className="flex flex-wrap items-center justify-center space-x-3">
                      <div className="flex items-center justify-between space-x-3">
                        <Button
                          className="!p-1"
                          color="neutral"
                          size="sm"
                          onClick={handleIncrease}
                          variant="outlined"
                        >
                          <PlusIcon
                            className="h-4 w-4 text-neutral-content"
                            aria-hidden="true"
                          />
                        </Button>
                        <div id="custom-canvas" className="flex w-16">
                          <Input
                            type="number"
                            inputProps={{
                              onChange: (e) =>
                                setMintAmount(Number(e.target.value)),
                            }}
                            className="w-10"
                            value={mintAmount.toString()}
                          />
                        </div>
                        <Button
                          className="!p-1"
                          color="neutral"
                          disabled={mintAmount === 1}
                          size="sm"
                          variant="outlined"
                          onClick={handleDecrease}
                        >
                          <MinusIcon
                            className="h-4 w-4 text-neutral-content"
                            aria-hidden="true"
                          />
                        </Button>
                      </div>

                      <Button
                        disabled={
                          !candyMachine?.guardsAndEligibility?.[0]?.isEligible
                        }
                        onClick={handleMint}
                        loading={isMinting}
                        // rounded="lg"
                      >
                        Buy
                      </Button>
                    </div>
                  </>
                ) : (
                  <>Connect your wallet</>
                )}
              </div>
              {candyMachine?.guardsAndEligibility?.[0]?.maxPurchaseQuantity && (
                <Typography color="neutral-gray">
                  You can buy up to{" "}
                  {candyMachine?.guardsAndEligibility?.[0]?.maxPurchaseQuantity}
                  . Buy more sol to purchase more
                </Typography>
              )}
            </div> */}
      {/* {(publicKey || session) &&
              !candyMachine?.guardsAndEligibility?.[0]?.isEligible && (
                <div className="mt-3 flex items-center justify-between space-x-2">
                  <Typography size="body-xs" color="neutral-gray">
                    {
                      candyMachine?.guardsAndEligibility?.[0]
                        ?.inEligibleReasons?.[0]
                    }
                  </Typography>
                  <AddFunds />
                </div>
              )} */}
    </div>
  );
}

export default Supporters;
