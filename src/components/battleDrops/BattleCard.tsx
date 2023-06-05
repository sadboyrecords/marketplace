/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Typography from "@/components/typography";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import AvatarImage from "@/components/avatar/Avatar";
import GeneralLikes from "@/components/likes-plays/GeneralLikes";
import PlayButton from "@/components/likes-plays/PlayButton";
import React, { useCallback, useEffect } from "react";
import Button from "@/components/buttons/Button";
import Link from "next/link";
import { routes } from "@/utils/constants";
import Buy from "@/components/battleDrops/Buy";
import { useMetaplex } from "@/components/providers/MetaplexProvider";

import type {
  BattleType,
  BattleTypeSummary,
  SongType,
  IMint,
} from "@/utils/types";
import { api } from "@/utils/api";
import { getSupporters } from "@/utils/audioHelpers";
import { useDispatch } from "react-redux";
import { openJoinBattleFansModal } from "@/lib/slices/appSlice";

type BattleCardProps = {
  index: number;
  competitorIndex: number;
  battle?: BattleType | BattleTypeSummary;
  totalPot?: { usd: number; sol: number; items: number };
};

function BattleCard({
  index,
  battle,
  totalPot,
  competitorIndex,
}: BattleCardProps) {
  const { fetchCandyMachineById, candyMachines } = useMetaplex();
  const draft = battle?.battleContestants[index]?.candyMachineDraft;
  const imageHash = battle?.battleContestants[index]?.candyMachineDraft
    ?.imageIpfsHash as string;

  const artistName =
    battle?.battleContestants[index]?.user.name ||
    (battle?.battleContestants[index]?.primaryArtistName as string);

  const candyMachineId =
    battle?.battleContestants[index]?.candyMachineDraft?.candyMachineId;

  const [competitorCandyId, setCompetitorCandyId] = React.useState<string>();

  useEffect(() => {
    const competitorCandyId =
      battle?.battleContestants[competitorIndex]?.candyMachineDraft
        ?.candyMachineId;

    setCompetitorCandyId(competitorCandyId as string | undefined);
  }, [battle?.battleContestants, competitorIndex]);

  const transactions = api.transaction.getCandyTransactions.useQuery(
    {
      candymachineId: candyMachineId || "",
    },
    {
      enabled: !!candyMachineId,
    }
  );

  const dispatch = useDispatch();

  // @ts-ignore
  // const supporters: ISupporters = transactions?.data?.reduce((acc, curr) => {
  //   const { receiverWalletAddress } = curr;
  //   // @ts-ignore
  //   if (!acc[receiverWalletAddress as string]) {
  //     // @ts-ignore
  //     acc[receiverWalletAddress] = [];
  //   }

  //   // @ts-ignore
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  //   acc[receiverWalletAddress].push({
  //     walletAddress: curr?.receiverWalletAddress,
  //     tokenAddress: curr?.tokenAddressReferenceOnly,
  //     user: curr?.receiver,
  //   });
  //   return acc;
  // }, {});
  const supporters = getSupporters(transactions?.data);
  // console.log({ supporters });

  const handleOpenSupporters = () => {
    if (supporters) {
      dispatch(
        openJoinBattleFansModal({
          supporters,
          competitorCandyId,
          candymachineId: candyMachineId || "",
          artistName,
        })
      );
    }
  };

  const updateTransactions = api.transaction.updateCandy.useMutation();

  const candyMachine = candyMachines?.[candyMachineId || ""];
  // console.log({ transactions, candyMachine });

  const handleUpdateTransaction = useCallback(async () => {
    if (!candyMachineId || !candyMachine?.items?.redeemed) return null;
    try {
      const update = await updateTransactions.mutateAsync({
        candymachineId: candyMachineId,
        redeemed: candyMachine?.items?.redeemed,
      });
      if (update) {
        await transactions.refetch();
      }
    } catch (error) {
      console.log({ error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candyMachine?.items?.redeemed, candyMachineId]);

  useEffect(() => {
    if (
      candyMachineId &&
      candyMachine?.items?.redeemed &&
      transactions.data &&
      candyMachine?.items?.redeemed > transactions.data.length
    ) {
      console.log("-----update transaction------");
      void handleUpdateTransaction();
    }
  }, [
    candyMachine?.items?.redeemed,
    transactions.data,
    candyMachineId,
    handleUpdateTransaction,
  ]);

  const formSubmission = battle?.battleContestants[index]?.candyMachineDraft
    .formSubmission as IMint | undefined;
  const song =
    battle?.battleContestants[index]?.candyMachineDraft?.drop?.song ||
    ({
      id: formSubmission?.audioHash,
      lossyArtworkIPFSHash: formSubmission?.imageHash,
      lossyAudioIPFSHash: formSubmission?.audioHash,
      lossyAudioURL: formSubmission?.audioUri,
      lossyArtworkURL: formSubmission?.imageUri,
      title: formSubmission?.trackTitle,
      creators: formSubmission?.walletSplits,
    } as SongType);
  const tracks = battle?.battleContestants
    .filter((b) => b.candyMachineDraft?.drop && b.candyMachineDraft?.drop?.song)
    .map((b) => b.candyMachineDraft.drop?.song);

  const drop = battle?.battleContestants[index]?.candyMachineDraft?.drop;

  const [percentagePot, setPercentagePot] = React.useState<number>();

  React.useMemo(() => {
    if (candyMachine?.items?.redeemed && totalPot?.items) {
      const percent = (candyMachine?.items?.redeemed / totalPot?.items) * 100;

      setPercentagePot(percent);
    }
  }, [candyMachine?.items?.redeemed, totalPot?.items]);

  React.useMemo(() => {
    if (candyMachineId) {
      void fetchCandyMachineById(candyMachineId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candyMachineId, index]);

  // React.useMemo(() => {
  //   const getSolPrice = async () => {
  //     const solPrice = await getSolUsdPrice();
  //     setSolInUsd(solPrice);
  //   };
  //   void getSolPrice();
  // }, []);

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col  space-y-4 lg:mx-0">
      {/* flex flex-col items-center */}
      <Typography
        size="body-xl"
        className="text-center font-normal tracking-widest"
      >
        {battle?.battleContestants[index]?.candyMachineDraft?.dropName}
      </Typography>
      <div className="relative aspect-1 w-full flex-1 lg:h-full ">
        {/*  h-[30rem] */}
        {/* max-h-[36rem]  */}
        {/* [30rem]/ */}
        <ImageDisplay
          className="aspect-1 h-full w-full rounded-xl object-cover"
          // object-cover
          alt="battle card"
          path={
            battle?.battleContestants[index]?.candyMachineDraft?.drop
              ?.pinnedImage?.path || undefined
          }
          hash={imageHash || null}
          quality={100}
          // fill
          width={
            battle?.battleContestants[index]?.candyMachineDraft?.drop
              ?.pinnedImage?.width || 500
          }
          height={
            battle?.battleContestants[index]?.candyMachineDraft?.drop
              ?.pinnedImage?.height || 500
          }
        />
      </div>
      <div className="flex flex-shrink items-center justify-between">
        <div className="flex items-center space-x-2">
          <AvatarImage
            alt="artist profile picture"
            username={artistName}
            type="squircle"
          />
          <Typography> {artistName} </Typography>
        </div>
        <div className=" hidden flex-col items-center sm:flex">
          <Typography size="body-xs">Total </Typography>
          <Typography size="display-xs" className="font-bold">
            {candyMachine?.items?.redeemed}
          </Typography>
        </div>
        <div className="">
          <PlayButton
            song={song || null}
            playlistName={battle?.battleName}
            tracks={
              tracks && tracks?.length > 0 ? (tracks as SongType[]) : undefined
            }
          />
          {battle?.isActive && (
            <GeneralLikes
              candyMachineId={drop?.candyMachineId}
              songId={song?.id}
              isPrimary={true}
            />
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:hidden">
        <Typography size="display-xs" className="font-bold">
          {candyMachine?.items?.redeemed}
        </Typography>
        <Typography size="body-xs">(Collectables Redeemed by fans) </Typography>
      </div>
      {candyMachine &&
        candyMachine.guardsAndEligibility?.[0]?.hasStarted &&
        !candyMachine.guardsAndEligibility?.[0]?.hasEnded && (
          <div>
            <div className="">
              <div
                onClick={handleOpenSupporters}
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
                              supporters[key]?.[0]?.user?.pinnedProfilePicture
                                ?.path
                            }
                            pinnedStatus={
                              supporters[key]?.[0]?.user?.pinnedProfilePicture
                                ?.status
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
              </div>

              <progress
                className="progress progress-primary h-1 w-full bg-base-300"
                value={percentagePot || 0}
                max={100}
              ></progress>
              {/* <div className="w-full"></div> */}
            </div>

            {/* BUY SECTION  */}
            {candyMachineId && competitorCandyId && (
              <Buy
                candyMachineId={candyMachineId}
                competitorCandyId={competitorCandyId}
              />
            )}

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
        )}
      {!battle?.isActive && (
        <div className="flex items-center justify-between space-x-2">
          {draft?.status === "DRAFT" && (
            <div className="badge-info badge">
              Draft
              {!formSubmission?.walletSplits[0]?.walletAddress &&
                " - Incomplete"}
            </div>
          )}
          {draft?.status === "PENDING" && (
            <div className="badge-info badge">In Progress</div>
          )}
          {draft?.status === "LAUNCHED" && (
            <div className="badge-success badge">Launched</div>
          )}

          <Link href={routes.battleDropDrafts(draft?.id as string) || "#"}>
            <Button
              variant="ghost"
              disabled={!formSubmission?.walletSplits[0]?.walletAddress}
            >
              {" "}
              Review {draft?.status !== "LAUNCHED" && "& Mint"}{" "}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default BattleCard;
