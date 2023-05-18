/* eslint-disable @typescript-eslint/no-misused-promises */
import Typography from "@/components/typography";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import AvatarImage from "@/components/avatar/Avatar";
import GeneralLikes from "@/components/likes-plays/GeneralLikes";
import PlayButton from "@/components/likes-plays/PlayButton";
import React from "react";
import SolIcon from "@/components/iconComponents/SolIcon";
import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "@/components/buttons/Button";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import Input from "@/components/formFields/Input";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import type {
  BattleType,
  BattleTypeSummary,
  SongType,
  IMint,
} from "@/utils/types";

type RouterOutput = inferRouterOutputs<AppRouter>;

type BattleCardProps = {
  index: number;
  battle?: BattleType | BattleTypeSummary;
  totalPot?: { usd: number; sol: number; items: number };
};

function BattleCard({ index, battle, totalPot }: BattleCardProps) {
  const { publicKey } = useWallet();
  const { data: session } = useSession();
  const {
    fetchCandyMachineById,
    candyMachines,
    mint,
    solUsdPrice,
    walletBalance,
  } = useMetaplex();
  const draft = battle?.battleContestants[index]?.candyMachineDraft;
  const imageHash = battle?.battleContestants[index]?.candyMachineDraft
    ?.imageIpfsHash as string;

  const audioHash =
    battle?.battleContestants[index]?.candyMachineDraft?.audioIpfsHash;

  const artistName =
    battle?.battleContestants[index]?.user.name ||
    (battle?.battleContestants[index]?.primaryArtistName as string);

  // const [solInUsd, setSolInUsd] = React.useState<number>(20);
  const [mintAmount, setMintAmount] = React.useState<number>(1);
  const candyMachineId =
    battle?.battleContestants[index]?.candyMachineDraft?.candyMachineId;

  const candyMachine = candyMachines?.[candyMachineId || ""];
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
  // console.log({ tracks });
  const drop = battle?.battleContestants[index]?.candyMachineDraft?.drop;

  const handleIncrease = () => {
    setMintAmount(mintAmount + 1);
  };

  const handleDecrease = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };
  const [isMinting, setIsMinting] = React.useState<boolean>(false);

  async function handleMint() {
    if (!mintAmount || !candyMachineId) {
      return;
    }
    setIsMinting(true);
    const toastId = toast.loading("Purchase in progress");
    try {
      await mint({
        candyMachineId,
        quantityString: mintAmount,
        label: candyMachine?.guardsAndEligibility?.[0]?.label || "",
      });
      setIsMinting(false);
      toast.done(toastId);
      toast.success("Amazing thanks for supporting!");

      void confetti({
        particleCount: 100,
        angle: 60,
        spread: 70,
        origin: { x: 0.2 },
      });

      void confetti({
        particleCount: 100,
        angle: 120,
        spread: 70,
        origin: { x: 0.8 },
      });
    } catch (error) {
      console.log(error);
      toast.done(toastId);

      setIsMinting(false);
      toast.error("Error minting");
    }
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AvatarImage
            alt="artist profile picture"
            username={artistName}
            type="squircle"
          />
          <Typography> {artistName} </Typography>
        </div>
        {/* <div className="flex flex-col items-center">
          <Typography size="body-xs"> Win - Loss </Typography>
          <Typography size="body-xs"> 4 - 1 </Typography>
        </div> */}
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
      {candyMachine &&
        candyMachine.guardsAndEligibility?.[0]?.hasStarted &&
        !candyMachine.guardsAndEligibility?.[0]?.hasEnded && (
          <div>
            <div>
              <div className="flex justify-between">
                <div>
                  <Typography size="body-xs" className="text-neutral-content">
                    Supporters
                  </Typography>
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
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
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
                          // rounded="full"
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
                            // onChange={(e) =>
                            //   setMintAmount(Number(e.target.value))
                            // }
                            inputProps={{
                              onChange: (e) =>
                                setMintAmount(Number(e.target.value)),
                            }}
                            className="w-10"
                            value={mintAmount.toString()}
                          />
                          {/* <Input /> */}
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
                        // disabled={
                        //   !candyMachine?.guardsAndEligibility?.[0]?.isEligible
                        // }
                        onClick={handleMint}
                        // loading={isMinting}
                        // rounded="lg"
                      >
                        Buy
                        {/* {isMinting ? 'Minting...' : 'Mint'} */}
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
            </div>
            {!candyMachine?.guardsAndEligibility?.[0]?.isEligible && (
              <Typography size="body-xs" color="neutral-gray">
                {
                  candyMachine?.guardsAndEligibility?.[0]
                    ?.inEligibleReasons?.[0]
                }
              </Typography>
            )}
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
