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
import { getSolUsdPrice } from "@/utils/rpcCalls";
import Link from "next/link";
import { routes } from "@/utils/constants";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Battle = RouterOutput["battle"]["getBattleById"];

type BattleCardProps = {
  index: number;
  battle?: Battle;
};

function BattleCard({ index, battle }: BattleCardProps) {
  const { publicKey } = useWallet();
  const { data: session } = useSession();
  const draft = battle?.battleContestants[index]?.candyMachineDraft;
  const imageHash = battle?.battleContestants[index]?.candyMachineDraft
    ?.imageIpfsHash as string;

  const audioHash =
    battle?.battleContestants[index]?.candyMachineDraft?.audioIpfsHash;

  const artistName =
    battle?.battleContestants[index]?.user.name ||
    (battle?.battleContestants[index]?.primaryArtistName as string);

  const [solInUsd, setSolInUsd] = React.useState<number>(20);
  const [mintAmount, setMintAmount] = React.useState<number>(1);

  const handleIncrease = () => {
    setMintAmount(mintAmount + 1);
  };

  const handleDecrease = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };

  React.useMemo(() => {
    const getSolPrice = async () => {
      const solPrice = await getSolUsdPrice();
      setSolInUsd(solPrice);
    };
    void getSolPrice();
  }, []);

  return (
    <div className="mx-auto flex h-full  max-w-xl  flex-col space-y-4">
      {/* flex flex-col items-center */}
      <Typography
        size="body-xl"
        className="text-center font-normal tracking-widest"
      >
        {battle?.battleContestants[index]?.candyMachineDraft?.dropName}
      </Typography>
      <div className="relative aspect-1 max-h-[36rem] w-full lg:h-full lg:max-h-max">
        {/*  h-[30rem] */}
        {/* [30rem]/ */}
        <ImageDisplay
          className=" h-full w-full rounded-xl object-cover"
          // object-cover
          alt="battle card"
          hash={imageHash || null}
          quality={100}
          // fill
          width={500}
          height={500}
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
          <PlayButton />
          {battle?.isActive && <GeneralLikes />}
        </div>
      </div>
      {battle?.isActive &&
        battle?.battleContestants[index]?.candyMachineDraft?.candyMachineId && (
          <div>
            <div>
              <div className="flex justify-between">
                <div>
                  <Typography size="body-xs" className="text-neutral-content">
                    Supporters
                  </Typography>
                </div>
                <div>
                  <Typography size="body-xs" className="text-neutral-content">
                    40% of pot
                  </Typography>
                </div>
              </div>
              <progress
                className="progress progress-primary h-1 w-full bg-base-300"
                value={50}
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
                    {solInUsd && (
                      <span className="ml-2 text-sm text-neutral-content">
                        ({(solInUsd * (battle?.battlePrice || 0)).toFixed(2)}{" "}
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
                        <div className="flex w-16">
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
                      // disabled={startedStates[0].disableMint ? true : false}
                      // onClick={handleMinting}
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
            </div>
          </div>
        )}
      {!battle?.isActive && (
        <div className="flex items-center justify-between space-x-2">
          {draft?.status === "DRAFT" && (
            <div className="badge-info badge">Draft</div>
          )}
          {draft?.status === "PENDING" && (
            <div className="badge-info badge">In Progress</div>
          )}
          {draft?.status === "LAUNCHED" && (
            <div className="badge-success badge">Launched</div>
          )}

          <Link href={routes.battleDropDrafts(draft?.id as string) || "#"}>
            <Button variant="ghost">
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
