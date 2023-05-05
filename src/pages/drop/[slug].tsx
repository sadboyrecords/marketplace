import Typography from "@/components/typography";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/utils/api";
import { useEffect, useState, useRef, useMemo } from "react";
import Icon from "@/components/icons";
import { usePlayerProvider } from "@/components/player/Provider";
import Button from "@/components/buttons/Button";
import CountdownLabel from "@/components/countdown/CountdownLabel";
import TextLoader from "@/components/loaders/TextLoader";
import { routes } from "@/utils/constants";
import { Share } from "@/components/iconComponents";
import ModalContainer from "@/components/modalContainer";
import ShareLink from "@/components/shareLink";
import AvatarGroup from "@/components/avatarGroup";
import linkifyStr from "linkify-string";
import { liveIpfsGateway } from "@/utils/constants";
import DropLikes from "@/components/likes-plays/DropLikes";
import DropMintButton from "@/components/dropMintButton";
import type { IFullCredits } from "@/utils/types";
import SongCredits from "@/components/songCredits";
import dynamic from "next/dynamic";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import type { IMetadata } from "@/utils/types";

type RouterOutput = inferRouterOutputs<AppRouter>;

const UpdateSettings = dynamic(
  () => import("@/components/candyMachineUpdate/UpdateSettings"),
  {
    ssr: false,
  }
);

export type DropDetailsProps = RouterOutput["candyMachine"]["getBySlug"];

function DropDetails() {
  const currentLocation = global.window && window?.location;
  const overFlowRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { slug } = router.query;
  const wallet = useWallet();

  const { currentToken, isPlaying, handlePlayPause } = usePlayerProvider();
  const { data: drop, isLoading } = api.candyMachine.getBySlug.useQuery(
    {
      slug: slug as unknown as string,
    },
    {
      enabled: !!slug,
    }
  );

  console.log({ drop });

  const { candyMachineV3, setCurrentSlug } = useMetaplex();
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [parsedDescription, setParsedDescription] = useState<string | null>();
  const [metaData, setMetaData] = useState<unknown>();
  const [textOpen, setTextOpen] = useState(false);
  const [overflowActive, setOverflowActive] = useState(false);
  const [songCredits, setSongCredits] = useState<IFullCredits[]>();
  const [isOwner, setIsOwner] = useState(false);

  const { guardsAndEligibility } = useMemo(
    () => ({
      items: candyMachineV3.items,
      candyMachine: candyMachineV3.candyMachine,
      walletBalance: candyMachineV3.walletBalance,
      guardsAndEligibility: candyMachineV3.guardsAndEligibility,
    }),
    [
      candyMachineV3.items,
      candyMachineV3.candyMachine,
      candyMachineV3.walletBalance,
      candyMachineV3.guardsAndEligibility,
    ]
  );

  function isOverflowActive(event: any) {
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

      role?.reduce((acc, roleType) => {
        const index = fullCredits.findIndex((item) => item.role === roleType);
        if (index === -1) {
          fullCredits.push({
            role: roleType,
            names: [{ name, walletAddress }],
          });
        } else {
          fullCredits[index]?.names.push({ name, walletAddress });
        }
      }, {});
      //   acc[name] = value;
      return creditNames;
    }, {});
    setSongCredits(fullCredits);
  };

  const handleOverflow = () => {
    if (overFlowRef.current) {
      setTextOpen(!textOpen);
    }
  };

  useEffect(() => {
    console.log("------Running effect-------", { drop });
    if (drop && drop.candyMachineId) {
      candyMachineV3.handleChangeCandyMachineId(drop.candyMachineId);
      setCurrentSlug(drop?.slug);
    }
  }, [drop?.id || slug]);

  useEffect(() => {
    if (isOverflowActive(overFlowRef.current)) {
      setOverflowActive(true);
      return;
    }

    setOverflowActive(false);
  }, [isOverflowActive]);

  useMemo(() => {
    if (drop && drop.candyMachineId) {
      setImageUri(drop.candyMachineImageUrl);
      if (drop?.description) {
        setParsedDescription(
          linkifyStr(drop.description, {
            target: "_blank",
            className: "text-primary",
          })
        );
      }
      handleMetaData(drop);
    }
  }, []);

  useMemo(() => {
    if (candyMachineV3.candyMachine) {
      setIsOwner(
        wallet?.publicKey?.toBase58() ===
          candyMachineV3.candyMachine?.authorityAddress?.toBase58()
      );
    }
  }, [candyMachineV3.candyMachine, wallet?.publicKey]);

  if (
    isLoading ||
    candyMachineV3.currentSlug !== slug ||
    candyMachineV3.isLoading
  )
    // candyMachineV3.currentSlug !== slug
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
          <DropMintButton />
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
                    <button
                      className="flex self-center rounded-full  "
                      disabled={!drop?.song}
                      onClick={() => handlePlayPause(drop?.song)}
                    >
                      {currentToken?.id === drop?.song?.id && isPlaying ? (
                        <Icon name="PAUSE" className="h-8 w-8 text-primary" />
                      ) : (
                        <Icon name="PLAY" className="h-8 w-8 text-primary" />
                      )}
                    </button>
                    <div className="flex items-center">
                      <Typography
                        className="text-neutral-content"
                        size="body-xs"
                      >
                        Creators:
                      </Typography>
                      <AvatarGroup
                        avProp={drop?.creators?.map((d) => ({
                          name: d.walletAddress,
                          img: d.profilePictureImage,
                          hash: d.profilePictureHash,
                          altText: "Creator's profile picture",
                          route: routes.artistProfile(d.walletAddress),
                        }))}
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

              {guardsAndEligibility?.map((state, index) => (
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
                  variant="body1"
                  className={`text-neutral-content ${
                    textOpen ? "" : "line-clamp-4"
                  }`}
                  ref={overFlowRef}
                >
                  <div
                    className="whitespace-pre-line text-neutral-content"
                    dangerouslySetInnerHTML={{
                      __html: parsedDescription as string,
                    }}
                    // ref={overFlowRef}
                  />
                </Typography>
                <div className="flex">
                  {!textOpen && !overflowActive ? null : (
                    <Button
                      onClick={handleOverflow}
                      variant="link"
                      size="small"
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
