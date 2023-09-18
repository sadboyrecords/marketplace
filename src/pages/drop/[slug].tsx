/* eslint-disable @typescript-eslint/no-misused-promises */
import Typography from "@/components/typography";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/utils/api";
import { useEffect, useState, useRef, useMemo } from "react";
// import Icon from "@/components/icons";
import Button from "@/components/buttons/Button";
import CountdownLabel from "@/components/countdown/CountdownLabel";
import TextLoader from "@/components/loaders/TextLoader";
import { routes } from "@/utils/constants";
import { Share, SolIcon } from "@/components/iconComponents";
import ModalContainer from "@/components/modalContainer";
import ShareLink from "@/components/shareLink";
import AvatarGroup from "@/components/avatarGroup";
import linkifyStr from "linkify-string";
import { liveIpfsGateway } from "@/utils/constants";
import DropLikes from "@/components/likes-plays/DropLikes";
// import DropMintButton from "@/components/dropMintButton";
import type { IFullCredits } from "@/utils/types";
import SongCredits from "@/components/songCredits";
// import dynamic from "next/dynamic";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import type { IMetadata } from "@/utils/types";
import Input from "@/components/formFields/Input";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import PlayButton from "@/components/likes-plays/PlayButton";
import Buy from "@/components/battleDrops/Buy";

type RouterOutput = inferRouterOutputs<AppRouter>;

// const UpdateSettings = dynamic(
//   () => import("@/components/candyMachineUpdate/UpdateSettings"),
//   {
//     ssr: false,
//   }
// );

export type DropDetailsProps = RouterOutput["candyMachine"]["getBySlug"];

export type AvatarGroupProps = {
  img?: string;
  name: string;
  altText?: string;
  children?: React.ReactNode;
  hash?: string;
  route?: string;
  pinnedStatus?: string;
  path?: string;
};

function DropDetails() {
  const currentLocation = global.window && window?.location;
  const overFlowRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { slug } = router.query;
  const { publicKey } = useWallet();
  const { data: session } = useSession();
  const { data: drop, isLoading } = api.candyMachine.getBySlug.useQuery(
    {
      slug: slug as unknown as string,
    },
    {
      enabled: !!slug,
    }
  );

  const {
    fetchCandyMachineById,
    candyMachines,
    mint,
    solUsdPrice,
    // walletBalance,
  } = useMetaplex();
  // const [imageUri, setImageUri] = useState<string | undefined>();
  const [parsedDescription, setParsedDescription] = useState<string | null>();
  const [metaData, setMetaData] = useState<IMetadata>();
  const [textOpen, setTextOpen] = useState(false);
  const [overflowActive, setOverflowActive] = useState(true);
  const [songCredits, setSongCredits] = useState<IFullCredits[]>();
  // const [isOwner, setIsOwner] = useState(false);

  const candy = candyMachines?.[drop?.candyMachineId || ""];
  useMemo(() => {
    if (drop?.candyMachineId) {
      void fetchCandyMachineById(drop?.candyMachineId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drop?.candyMachineId]);

  const candyMachineId = drop?.candyMachineId;

  const guardsAndEligibility = candy?.guardsAndEligibility;
  // const candyMachine = candy?.candyMachine;

  // const [percentagePot, setPercentagePot] = useState<number>();
  // const totalPot = drop?.
  // useMemo(() => {
  //   if (candy?.items?.redeemed && totalPot?.items) {
  //     const percent = (candy?.items?.redeemed / totalPot?.items) * 100;

  //     setPercentagePot(percent);
  //   }
  // }, [candyMachine?.items?.redeemed, totalPot?.items]);

  const [mintAmount, setMintAmount] = useState<number>(1);
  const handleIncrease = () => {
    setMintAmount(mintAmount + 1);
  };

  const handleDecrease = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };

  async function handleMint() {
    if (!mintAmount || !drop?.candyMachineId) {
      return;
    }
    // setIsMinting(true);
    const toastId = toast.loading("Purchase in progress");
    try {
      await mint({
        candyMachineId: drop?.candyMachineId,
        quantityString: mintAmount,
        label: candy?.guardsAndEligibility?.[0]?.label || "",
      });
      // setIsMinting(false);
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

      // setIsMinting(false);
      toast.error("Error minting");
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function isOverflowActive(event: HTMLDivElement | null) {
    if (!event) return;
    return (
      event.offsetHeight < event.scrollHeight ||
      event.offsetWidth < event.scrollWidth
    );
  }

  const [open, setOpen] = useState(false);
  const handleShare = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleMetaData = async (drop: DropDetailsProps) => {
    if (!drop?.jsonIpfsHash) return;
    const meta = await fetch(`${liveIpfsGateway}${drop?.jsonIpfsHash}`);
    const data = (await meta.json()) as IMetadata;
    setMetaData(data);

    const fullCredits: IFullCredits[] = []; // Object.keys(fullCredits).map((key) => ({ key, value: [] }));
    data?.credits?.reduce((creditNames, creditData) => {
      const { name, role, walletAddress } = creditData;
      role.forEach((roleType) => {
        const index = fullCredits.findIndex((item) => item.role === roleType);
        if (index === -1) {
          fullCredits.push({
            role: roleType,
            names: [{ name, walletAddress }],
          });
        } else {
          fullCredits[index]?.names.push({ name, walletAddress });
        }
      });
      // role?.reduce((_acc, roleType) => {
      //   const index = fullCredits.findIndex((item) => item.role === roleType);
      //   if (index === -1) {
      //     fullCredits.push({
      //       role: roleType,
      //       names: [{ name, walletAddress }],
      //     });
      //   } else {
      //     fullCredits[index]?.names.push({ name, walletAddress });
      //   }
      // }, {});
      return creditNames;
    }, {});
    setSongCredits(fullCredits);
  };

  // useEffect(() => {
  //   console.log("------Running effect-------", { drop });
  //   if (drop && drop.candyMachineId) {
  //     candyMachineV3.handleChangeCandyMachineId(drop.candyMachineId);
  //     setCurrentSlug(drop?.slug);
  //   }
  // }, [drop?.id || slug]);

  const handleOverflow = () => {
    if (overFlowRef.current) {
      setTextOpen(!textOpen);
    }
  };

  useEffect(() => {
    if (isOverflowActive(overFlowRef.current)) {
      setOverflowActive(true);
      return;
    }

    setOverflowActive(false);
  }, [isOverflowActive]);

  useMemo(() => {
    if (drop && drop.candyMachineId) {
      // setImageUri(drop.candyMachineImageUrl);
      if (drop?.description) {
        setParsedDescription(
          linkifyStr(drop.description, {
            target: "_blank",
            className: "text-primary",
          })
        );
      }
      void handleMetaData(drop);
    }
  }, [drop]);

  // useMemo(() => {
  //   if (candy?.candyMachine) {
  //     setIsOwner(
  //       wallet?.publicKey?.toBase58() ===
  //         candy?.candyMachine.candyMachine?.authorityAddress?.toBase58()
  //     );
  //   }
  // }, [candy?.candyMachine?.candyMachine?.authorityAddress?.toBase58()]);

  if (isLoading)
    return (
      <div className=" flex  w-full max-w-[80rem] flex-col gap-y-10 lg:max-w-[80rem]  lg:flex-row lg:space-x-6">
        <div className="md:self-center lg:flex-1 lg:self-start   ">
          <div className="h-full w-full space-y-6 overflow-hidden md:h-[80vw] md:max-h-[700px] md:w-[80vw] md:max-w-[700px]  lg:h-full lg:w-full">
            <TextLoader className="h-full w-full rounded-lg md:h-[80vw]  md:max-h-[500px] md:w-[80vw] md:max-w-[700px] lg:w-full" />
            <TextLoader className="h-20 rounded-md" />
          </div>
        </div>
        <div className="space-y-8 lg:flex-1">
          <TextLoader className="" />

          <TextLoader className="h-40 rounded-md" />
          <TextLoader className="h-40 rounded-md" />
        </div>
      </div>
    );

  if (!drop && !isLoading) {
    return <div>This drop doesn&apos;t exist</div>;
  }

  return (
    <>
      <ModalContainer
        open={open}
        title={"Share this Drop"}
        handleCancel={handleClose}
      >
        <ShareLink url={currentLocation?.href} title={drop?.dropName || ""} />
      </ModalContainer>
      <div className="z-0 flex  w-full max-w-[80rem] flex-col gap-y-10 lg:max-w-[80rem]  lg:flex-row lg:space-x-6">
        <div className=" md:self-center lg:flex-1 lg:self-start  ">
          <div className="relative h-full w-full overflow-hidden md:h-[80vw] md:max-h-[700px] md:w-[80vw] md:max-w-[700px] lg:aspect-1 lg:h-full  lg:w-full">
            {drop?.candyMachineImageUrl ? (
              <>
                <ImageDisplay
                  hash={drop?.imageIpfsHash || null}
                  url={drop?.candyMachineImageUrl}
                  // fill
                  width={700}
                  alt="Drop Image"
                  quality={100}
                  className="rounded-box h-full object-cover transition-shadow duration-300"
                />
              </>
            ) : (
              <>
                <div className="h-full w-full animate-pulse rounded-lg bg-slate-400 lg:h-[500px] lg:w-[500px]"></div>
              </>
            )}
          </div>
          {/* <DropMintButton /> */}
          <div className="mt-4">
            {/* {isOwner && (
              <>
                <div className="flex gap-4">
                  <UpdateSettings />
                </div>
              </>
            )} */}
          </div>
        </div>
        <div className="space-y-8 lg:flex-1">
          <div className="flex w-full flex-row justify-center gap-2 align-top lg:justify-start">
            <div className="flex w-full flex-col gap-8 md:max-w-[700px]">
              <div>
                <Typography className="" size="display-md">
                  {drop?.dropName}
                </Typography>
                <div className="flex flex-row flex-wrap justify-between lg:flex-col">
                  <div className="mt-1 flex space-x-4">
                    {drop.song && <PlayButton song={drop.song} />}
                    <div className="flex items-center">
                      <Typography
                        className="text-neutral-content"
                        size="body-xs"
                      >
                        Creators:
                      </Typography>
                      <AvatarGroup
                        avProp={
                          drop?.creators?.map((d) => ({
                            name: d.walletAddress,
                            img: d.profilePictureImage,
                            hash: d.profilePictureHash,
                            altText: "Creator's profile picture",
                            route: routes.artistProfile(d.walletAddress),
                            path: d.pinnedProfilePicture?.path,
                            pinnedStatus: d.pinnedProfilePicture?.status as
                              | string
                              | undefined,
                          })) as AvatarGroupProps[]
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-row items-center space-x-2 align-middle lg:mb-4">
                    <DropLikes
                      padding="none"
                      sideView
                      candyMachineId={drop?.candyMachineId}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleShare}
                      className="flex space-x-3"
                    >
                      <Share className="h-4 w-4" />
                      <Typography size="body-sm">Share</Typography>
                    </Button>
                  </div>
                </div>
              </div>
              {guardsAndEligibility?.map((state) => (
                <CountdownLabel
                  key={state.label}
                  countDownText={state.hasStarted ? "Ends in:" : "Starts in:"}
                  inProgress={state.hasStarted && !state.hasEnded}
                  isSoldOut={state.redeemLimitExceeded}
                  date={
                    state.hasStarted
                      ? state.hasEnded
                        ? undefined
                        : state.endDate
                      : state.startDate
                  }
                  label={state.label}
                  isEnded={state.hasEnded}
                  solPrice={state.payment?.sol?.amount}
                  redeemLimit={state.redeemLimit}
                  mintLimit={state.mintLimit}
                />
              ))}
              {/* {guardStates?.map((state, index) => (
                <CountdownLabel
                  key={state.label}
                  countDownText={state.isStarted ? 'Ends in:' : 'Starts in:'}
                  inProgress={state.isStarted && !state.isEnded}
                  //   date={new Date()}
                  date={
                    state.isStarted
                      ? state.isEnded
                        ? undefined
                        : (state.guards?.endTime as Date)
                      : (state.guards?.startTime as Date)
                  }
                  label={state.label}
                  isEnded={state.isEnded}
                  solPrice={state.guards?.payment?.sol?.parsedAmount}
                  redeemLimit={state.guards?.redeemLimit}
                  mintLimit={state.guards?.mintLimit?.settings.limit}
                />
              ))} */}
              <div>
                <Typography
                  type="div"
                  className={`text-neutral-content ${
                    textOpen ? "" : "line-clamp-4"
                  }`}
                >
                  <div
                    className="whitespace-pre-line text-neutral-content"
                    dangerouslySetInnerHTML={{
                      __html: parsedDescription as string,
                    }}
                    ref={overFlowRef}
                  />
                </Typography>
                <div className="flex">
                  {!textOpen && !overflowActive ? null : (
                    <Button
                      onClick={handleOverflow}
                      className="mt-2 !p-0 underline"
                      variant="ghost"
                      size="sm"
                    >
                      {textOpen ? "Show less" : "Show more"}
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <SongCredits
                  credits={songCredits}
                  cLine={metaData?.cline}
                  pLine={metaData?.pline}
                />
              </div>

              {/* MINT SECTION */}
              {candy &&
                candy.guardsAndEligibility?.[0]?.hasStarted &&
                !candy.guardsAndEligibility?.[0]?.hasEnded && (
                  <div>
                    <div>
                      {/* <div className="flex justify-between">
                        <div>
                          <Typography
                            size="body-xs"
                            className="text-neutral-content"
                          >
                            Supporters
                          </Typography>
                        </div>
                        {percentagePot && (
                          <Typography
                            size="body-xs"
                            className="text-neutral-content"
                          >
                            {percentagePot.toFixed(2)}% of pot
                          </Typography>
                        )}
                      </div>
                      <progress
                        className="progress progress-primary h-1 w-full bg-base-300"
                        value={percentagePot || 0}
                        max={100}
                      ></progress> */}
                      {/* <div className="w-full"></div> */}
                    </div>
                    {/* <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2 ">
                          <SolIcon height={20} />
                          <Typography size="body-xl" className="">
                            {drop?.lowestPrice}
                            {solUsdPrice && (
                              <span className="ml-2 text-sm text-neutral-content">
                                (
                                {(
                                  solUsdPrice * (drop?.lowestPrice || 0)
                                ).toFixed(2)}{" "}
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
                                  !candy?.guardsAndEligibility?.[0]?.isEligible
                                }
                                onClick={handleMint}
                                // loading={isMinting}
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
                    </div> */}
                    {candyMachineId &&
                      !candy.guardsAndEligibility?.[0]?.hasEnded && (
                        <Buy
                          candyMachineId={candyMachineId}
                          // competitorCandyId={competitorCandyId}
                        />
                      )}
                    {!candy?.guardsAndEligibility?.[0]?.isEligible && (
                      <Typography size="body-xs" color="neutral-gray">
                        {
                          candy?.guardsAndEligibility?.[0]
                            ?.inEligibleReasons?.[0]
                        }
                      </Typography>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div>
            {/* {(isLoadingListing || isCheckingOwner) && (
                <div className=" bg-slate-400 animate-pulse h-24 w-full rounded-lg"></div>
              )}
              {((!listing && isOwner && !isCheckingOwner) ||
                (listing && !isCheckingOwner)) && (
                <TokenSaleCard
                  metaplex={metaplex}
                  mintAddress={mintAddress as any as string}
                  loggedInUserKey={loggedInUserKey as any as string}
                  isOwner={isOwner}
                  listing={listing}
                />
              )} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default DropDetails;
