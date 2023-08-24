/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/utils/api";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import type { IMint } from "@/utils/types";
import { Label } from "@/components/formFields/Label";
import Typography from "@/components/typography";
import type { Steps } from "@/components/mintingStepper/Stepper";
import { LoadingSpinner } from "@/components/iconComponents";
import Button from "@/components/buttons/Button";
import { toast } from "react-toastify";
import {
  uploadFileToIpfs,
  hashJsonToNumber,
  convertToSlug,
  // getLowestSolpaymentFromGuard,
  getLowestTokenpaymentFromGuard,
} from "@/utils/helpers";
import {
  toBigNumber,
  sol,
  toDateTime,
  PublicKey,
  token,
} from "@metaplex-foundation/js";
import type { Signer } from "@metaplex-foundation/js";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {
  battleDropsTreasury,
  ipfsPublicGateway,
  liveIpfsGateway,
} from "@/utils/constants";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { routes } from "@/utils/constants";
import Link from "next/link";
import { solanaUsdToken } from "@/utils/constants";

type CreatorInput = {
  readonly address: PublicKey;
  readonly share: number;
  readonly authority?: Signer | undefined;
};

export function TitleContent({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Typography size="body-xs" className="text-neutral-content">
        {title}
      </Typography>
      <Typography className="overflow-scroll">{content}</Typography>
    </div>
  );
}

function ReviewMint({ battleDrop = false }: { battleDrop?: boolean }) {
  const router = useRouter();
  const { id } = router.query;
  const { publicKey } = useWallet();
  const { metaplex } = useMetaplex();
  const { data, isLoading } = api.candyMachine.getDraftById.useQuery(
    { id: id as string },
    {
      enabled: !!(publicKey?.toBase58() || id),
    }
  );
  const utils = api.useContext();

  const updateMutation = api.candyMachine.updateDraft.useMutation();
  const candyMutation = api.candyMachine.create.useMutation();
  const [mintingSteps, setMintingSteps] = useState<Steps[]>();
  const [isMinting, setIsMinting] = useState(false);

  const formSubmission = data?.formSubmission as unknown as IMint;

  const stepperKeys = {
    METADATA_UPLOAD: "METADATA_UPLOAD",
    CREATE_COLLECTION: "CREATE_COLLECTION",
    CREATE_CANDY_MACHINE: "CREATE_CANDY_MACHINE",
    INSERT_ITEMS: "INSERT_ITEMS",
    SAVE_DATA: "SAVE_DATA",
  };

  const uploadToIpfs = async () => {
    try {
      if (!data) {
        toast.error("Can't upload at this time");
        return;
      }
      setIsMinting(true);
      const newSteps = originalSteps?.map((step) => {
        if (step?.step === stepperKeys.METADATA_UPLOAD) {
          return {
            ...step,
            status: stepperStatus.inProgress,
          } as Steps;
        }
        return step;
      });
      setMintingSteps(newSteps);

      const metaData = {
        name: formSubmission?.collectionName,
        description: formSubmission?.description,
        symbol: formSubmission?.symbol,
        image: formSubmission?.imageUri,
        attributes: {
          trait_type: "Exchange",
          vales: "NiftyTunes",
        },
        properties: {
          files: [
            {
              uri: formSubmission?.imageUri,
              type: "image/png",
            },
            {
              uri: formSubmission?.audioUri,
              type: "audio/mp3",
            },
            // {
            //   uri: 'https://enj7mawcig6xeljjji2cxe5jqixv2ijzclq64htm2zvgtqebvi.arweave.net/I1P2AsJBvXItKUo0K5Opgi9dITkS4e4ebNZq_acCBqs',
            //   type: 'audio/wav',
            // },
          ],
          category: "audio",
        },
        credits: formSubmission?.credits,
        pline: formSubmission?.pline,
        cline: formSubmission?.cline,
        isrc: formSubmission?.isrc,
        upc: formSubmission?.upc,
        genre: formSubmission?.genre,
        songTitle: formSubmission?.trackTitle,
      };
      const uploadData = await uploadFileToIpfs({ json: metaData });
      const jsonIpfsHash = uploadData?.cid;
      if (!jsonIpfsHash) {
        toast.error(
          "Sorry there was an issue uploading your metadata. Please try again later."
        );
        return;
      }
      const str = JSON.stringify(metaData);
      const hash = await hashJsonToNumber(str);
      const jsonUri = ipfsPublicGateway + jsonIpfsHash;
      await updateMutation.mutateAsync({
        id: data?.id,
        currentStep: "METADATA_UPLOAD",
        jsonUri: jsonUri,
        jsonIpfshash: jsonIpfsHash,
        metaDataHash: hash as number[],
      });
      await utils.candyMachine.getDraftById.invalidate({
        id: data.id,
      });
      // toast.success("Metadata uploaded successfully");
      setIsMinting(false);
    } catch (error) {
      console.log(error);
      setIsMinting(false);
      const newSteps = originalSteps?.map((step) => {
        if (step?.step === stepperKeys.METADATA_UPLOAD) {
          return {
            ...step,
            status: stepperStatus.error,
          } as Steps;
        }
        return step;
      });
      setMintingSteps(newSteps);

      toast.error(
        "Sorry there was an issue uploading your metadata. Please try again later."
      );
    }
  };

  const createCollection = async () => {
    console.log("CREATING COLLECTION");
    if (!data) {
      toast.error("Can't create collection at this time");
      return;
    }
    if (data.collectionAddress) {
      await updateMutation.mutateAsync({
        id: data?.id,
        currentStep: "CREATE_COLLECTION",
      });
      await utils.candyMachine.getDraftById.invalidate({
        id: data.id,
      });
      // toast.success("Your Collection was created successfully");
      setIsMinting(false);
      return;
    }
    setIsMinting(true);
    const newSteps = originalSteps?.map((step) => {
      if (step?.step === stepperKeys.CREATE_COLLECTION) {
        return {
          ...step,
          status: stepperStatus.inProgress,
        } as Steps;
      }
      return step;
    });
    setMintingSteps(newSteps);
    try {
      const creators = formSubmission?.walletSplits.map((creator) => ({
        address: new PublicKey(creator.walletAddress),
        share: creator.percentage,
      }));
      console.log({ formSubmission });
      const result = await metaplex?.nfts().create({
        name: formSubmission?.collectionName,
        uri: data.metadataUri as string,
        sellerFeeBasisPoints: (formSubmission?.sellerFeeBasisPoints || 0) * 100,
        isCollection: true,
        tokenOwner: publicKey as PublicKey,
        creators: (creators as CreatorInput[]) || undefined,
        // updateAuthority: wallet.signMessage(),
      });
      const collectionAddress = result?.mintAddress?.toBase58();
      const collectionUrl = result?.nft?.uri;
      console.log("-----COLLECTION ADDRESS------", {
        collectionAddress,
        collectionUrl,
        collection: result,
      });
      if (!collectionAddress) {
        toast.error(
          "Sorry there was an issue creating your collection. Please try again later."
        );
        setIsMinting(false);
        const newSteps = originalSteps?.map((step) => {
          if (step?.step === stepperKeys.CREATE_COLLECTION) {
            return {
              ...step,
              status: stepperStatus.error,
            } as Steps;
          }
          return step;
        });
        setMintingSteps(newSteps);

        return;
      }
      //   setCurrentStep(stepperKeys.CREATE_CANDY_MACHINE);
      await updateMutation.mutateAsync({
        id: data?.id,
        currentStep: "CREATE_COLLECTION",
        collectionAddress,
      });
      await utils.candyMachine.getDraftById.invalidate({
        id: data.id,
      });
      // toast.success("Your Collection was created successfully");
      setIsMinting(false);
    } catch (error) {
      console.log(error);
      const newSteps = originalSteps?.map((step) => {
        if (step?.step === stepperKeys.CREATE_COLLECTION) {
          return {
            ...step,
            status: stepperStatus.error,
          } as Steps;
        }
        return step;
      });
      setIsMinting(false);
      setMintingSteps(newSteps);
      toast.error(
        "Sorry there was an issue creating your collection. Please try again later."
      );
    }
  };
  console.log({ data });

  const createCandyMachine = async () => {
    console.log("------CREATING Candy Machine-----");
    if (!data) {
      toast.error("Can't create collection at this time");
      return;
    }
    if (!data.collectionAddress) {
      setIsMinting(false);
      toast.error(
        "There was an error creating candy machine. Collection has not been created"
      );
      const newSteps = originalSteps?.map((step) => {
        if (step?.step === stepperKeys.CREATE_CANDY_MACHINE) {
          return {
            ...step,
            status: stepperStatus.error,
          } as Steps;
        }
        return step;
      });
      setMintingSteps(newSteps);
      return;
    }
    if (data.candyMachineId || data.candyMachineIdPlaceholder) {
      await updateMutation.mutateAsync({
        id: data?.id,
        currentStep: "CREATE_CANDY_MACHINE",
      });
      await utils.candyMachine.getDraftById.invalidate({
        id: data.id,
      });
      // toast.success("Your Candy Machine was created successfully");
      setIsMinting(false);
      return;
    }
    setIsMinting(true);
    const newSteps = originalSteps?.map((step) => {
      if (step?.step === stepperKeys.CREATE_CANDY_MACHINE) {
        return {
          ...step,
          status: stepperStatus.inProgress,
        } as Steps;
      }
      return step;
    });
    setMintingSteps(newSteps);
    try {
      console.log({ formSubmission });
      const creators = formSubmission?.walletSplits.map((creator) => ({
        address: new PublicKey(creator.walletAddress),
        share: creator.percentage,
      }));

      const result = await metaplex?.candyMachines().create({
        creators: creators as CreatorInput[],
        collection: {
          address: new PublicKey(data.collectionAddress),
          updateAuthority: metaplex.identity(),
        },
        sellerFeeBasisPoints: (formSubmission?.sellerFeeBasisPoints || 0) * 100,
        itemsAvailable: toBigNumber(formSubmission?.itemsAvailable || 1),
        itemSettings: {
          // type: 'configLines',
          // prefixName: `${formSubmission?.collectionName} #$ID+1$'`,
          // nameLength: 4, // number of characters in the name
          // prefixUri: jsonUri as string,
          // uriLength: 100, // number of characters in the uri
          // isSequential: false,
          type: "hidden",
          name: `${formSubmission?.collectionName} #$ID+1$`,
          uri: data.metadataUri as string,
          hash: data.metaDataHash,
        },
        symbol: formSubmission?.symbol,
        groups: formSubmission?.guards.map((g, i) => ({
          label: g.label,
          guards: {
            tokenPayment: g.tokenPayment
              ? {
                  amount: token(g.tokenPayment.amount, 6), //* 1e6
                  mint: new PublicKey(solanaUsdToken), //The address of the mint account defining the SPL Token we want to pay with.
                  destinationAta: metaplex
                    .tokens()
                    .pdas()
                    .associatedTokenAccount({
                      mint: new PublicKey(solanaUsdToken),
                      owner: new PublicKey(battleDropsTreasury as string),
                    }),
                  // Destination Associated Token Address (ATA): The address of the associated token account to
                  // send the tokens to. We can get this address by finding the Associated Token Address PDA using the
                  // Token Mint attribute and the address of any wallet that should receive these tokens
                }
              : null,
            solPayment: g.solPayment?.amount
              ? {
                  amount: sol(g.solPayment.amount),
                  destination: new PublicKey(g.solPayment?.destination),
                }
              : null,
            startDate: {
              date: toDateTime(new Date(g.startDate || "")),
            },
            endDate: {
              date: toDateTime(new Date(g.endDate || "")),
            },
            mintLimit: g.mintLimit
              ? {
                  id: i,
                  limit: g.mintLimit,
                }
              : null,
            redeemedAmount: g.redeemAmount
              ? {
                  maximum: toBigNumber(g.redeemAmount),
                }
              : null,
          },
        })),
      });
      console.log("---CANDY RESULTS------", { result });
      const candyMachineAddress = result?.candyMachine?.address?.toBase58();
      await updateMutation.mutateAsync({
        id: data?.id,
        currentStep: "CREATE_CANDY_MACHINE",
        candyMachineId: candyMachineAddress,
      });
      await utils.candyMachine.getDraftById.invalidate({
        id: data.id,
      });
      // toast.success("Drop has been created successfully");
      setIsMinting(false);

      //   setCurrentStep(stepperKeys.SAVE_DATA);
    } catch (error) {
      console.log(error);
      const newSteps = originalSteps?.map((step) => {
        if (step?.step === stepperKeys.CREATE_CANDY_MACHINE) {
          return {
            ...step,
            status: stepperStatus.error,
          } as Steps;
        }
        return step;
      });
      setMintingSteps(newSteps);
      setIsMinting(false);
      toast.error(
        "Sorry there was an issue creating your collection. Please try again later."
      );
    }
  };

  const publishDrop = async () => {
    console.log("----Publish-----");
    if (!data) {
      toast.error("Can't create collection at this time");
      return;
    }
    setIsMinting(true);
    const newSteps = originalSteps?.map((step) => {
      if (step?.step === stepperKeys.SAVE_DATA) {
        return {
          ...step,
          status: stepperStatus.inProgress,
        } as Steps;
      }
      return step;
    });
    setMintingSteps(newSteps);

    try {
      let startDate = formSubmission?.guards[0]?.startDate;
      let endDate = formSubmission?.guards[0]?.endDate;
      if (formSubmission && formSubmission?.guards.length > 1) {
        console.log(" FILTER");
        const filteredStart = formSubmission.guards.filter((g) => g.startDate);
        console.log({ filteredStart });
        const sortedStart = filteredStart.sort(
          (a, b) =>
            new Date(a?.startDate as Date)?.getTime() -
            new Date(b?.startDate as Date).getTime()
        );
        console.log({ sortedStart });
        startDate = sortedStart[0]?.startDate;

        const filteredEnd = formSubmission.guards.filter((g) => g.endDate);
        const sortedEnd = filteredEnd.sort(
          (a, b) =>
            new Date(a?.endDate as Date)?.getTime() -
            new Date(b?.endDate as Date).getTime()
        );
        console.log({ sortedEnd });
        endDate = sortedEnd[filteredEnd.length - 1]?.endDate;
      }

      if (!startDate || !endDate) {
        setIsMinting(false);
        toast.error("There was an error publishing your drop");
        return;
      }
      const slug = convertToSlug(formSubmission?.collectionName || "");
      const songTitleSlug = convertToSlug(formSubmission?.trackTitle || "");
      // const price = getLowestSolpaymentFromGuard(formSubmission?.guards);
      const price = getLowestTokenpaymentFromGuard(formSubmission?.guards);
      console.log({ formSubmission, startDate, endDate, data });
      if (!data.candyMachineId && !data.candyMachineIdPlaceholder) {
        setIsMinting(false);
        toast.error(
          "There was an error publishing your drop. No drop was found"
        );
        return;
      }
      await candyMutation.mutateAsync({
        candyMachineId: (data.candyMachineIdPlaceholder ||
          data.candyMachineId) as string,
        creatorWalletAddress: publicKey?.toBase58() || "",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        slug,
        description: formSubmission?.description,
        candyMachineImageUrl: formSubmission?.imageUri,
        dropName: formSubmission?.collectionName,
        songUri: formSubmission?.audioUri,
        songIpfsHash: data.audioIpfsHash as string,
        songTitle: formSubmission?.trackTitle,
        songTitleSlug: songTitleSlug,
        imageIpfsHash: data.imageIpfsHash as string,
        jsonIpfsHash: data.jsonIpfsHash as string,
        tokenUri: data.metadataUri as string,
        creators: formSubmission?.walletSplits.map((split) => {
          return {
            address: split.walletAddress,
          };
        }),
        price: price as number,
        items: formSubmission?.itemsAvailable,
        collectionAddress: data.collectionAddress as string,
        draftId: data.id,
        externalID: data.externalID || undefined,
        treasury: data.treasury || undefined,
      });

      // console.log({ res });
      //   setSlug(res.slug);
      // setCurrentStep(stepperKeys.CREATE_CANDY_MACHINE);
      await utils.candyMachine.getDraftById.invalidate({
        id: data.id,
      });
      // toast.success("Drop has been published successfully");
    } catch (error) {
      console.log({ error });
      const newSteps = originalSteps?.map((step) => {
        if (step?.step === stepperKeys.SAVE_DATA) {
          return {
            ...step,
            status: stepperStatus.error,
          } as Steps;
        }
        return step;
      });
      setMintingSteps(newSteps);
      setIsMinting(false);
      toast.error(
        "Sorry there was an issue creating your collection. Please try again later."
      );
    }
  };

  const originalSteps: Steps[] = [
    {
      step: stepperKeys.METADATA_UPLOAD,
      status: "PENDING",
      description: {
        PENDING: "Upload metadata ",
        IN_PROGRESS: "Uploading metadata",
        COMPLETED: "Uploaded metadata",
        ERROR: "Couldn't upload metadata",
        START: "Upload metadata ",
      },
      retry: uploadToIpfs,
      start: uploadToIpfs,
    },
    {
      step: stepperKeys.CREATE_COLLECTION,
      status: "PENDING",
      description: {
        PENDING: "Create collection on Solana",
        IN_PROGRESS: "Creating your collection",
        COMPLETED: "Collection Created",
        ERROR: "Couldn't create your collection",
        START: "Create collection on Solana",
      },
      retry: createCollection,
      start: createCollection,
    },
    {
      step: stepperKeys.CREATE_CANDY_MACHINE,
      status: "PENDING",
      description: {
        PENDING: "Create Drop on Solana ",
        IN_PROGRESS: "Creating your candy machine",
        COMPLETED: "Candy Machine Created",
        ERROR: "Couldn't create your candy machine",
        START: "Create Drop on Solana",
      },
      retry: createCandyMachine,
      start: createCandyMachine,
    },
    {
      step: stepperKeys.SAVE_DATA,
      status: "PENDING",
      description: {
        PENDING: "Publish your drop on Nifty Tunes",
        IN_PROGRESS: "Publishing your drop on Nifty Tunes",
        COMPLETED: "Drop Published",
        ERROR: "Couldn't publish this drop, please try again later",
        START: "Publish your drop on Nifty Tunes",
      },
      retry: publishDrop,
      start: publishDrop,
    },
  ];
  const stepperStatus = {
    start: "START",
    pending: "PENDING",
    inProgress: "IN_PROGRESS",
    completed: "COMPLETED",
    error: "ERROR",
  };
  const stepperColor = {
    [stepperStatus.completed]: "step-primary",
    [stepperStatus.inProgress]: "step-primary",
    [stepperStatus.pending]: "",
    [stepperStatus.start]: "",
    [stepperStatus.error]: "step-error",
  };
  const stepperDataContent = {
    [stepperStatus.completed]: "✓",
    [stepperStatus.inProgress]: "●",
    [stepperStatus.error]: "●",
  };

  useMemo(() => {
    if (data) {
      if (data?.currentStep === "CREATED") {
        // setMintingSteps(originalSteps);
        // setCurrentStep(stepperKeys.METADATA_UPLOAD);
        const newSteps = originalSteps?.map((step) => {
          if (step?.step === stepperKeys.METADATA_UPLOAD) {
            return {
              ...step,
              status: stepperStatus.start,
            } as Steps;
          }
          return step;
        });
        setMintingSteps(newSteps);
      }
      if (data?.currentStep === "METADATA_UPLOAD") {
        // setMintingSteps(originalSteps);
        // setCurrentStep(stepperKeys.CREATE_COLLECTION);

        const newSteps = originalSteps?.map((step) => {
          if (step?.step === stepperKeys.METADATA_UPLOAD) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.CREATE_COLLECTION) {
            return {
              ...step,
              status: stepperStatus.start,
            } as Steps;
          }
          return step;
        });
        setMintingSteps(newSteps);
      }
      if (data?.currentStep === "CREATE_COLLECTION") {
        // setMintingSteps(originalSteps);
        // setCurrentStep(stepperKeys.CREATE_CANDY_MACHINE);

        const newSteps = originalSteps?.map((step) => {
          if (step?.step === stepperKeys.METADATA_UPLOAD) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.CREATE_COLLECTION) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.CREATE_CANDY_MACHINE) {
            return {
              ...step,
              status: stepperStatus.start,
            } as Steps;
          }
          return step;
        });
        setMintingSteps(newSteps);
      }
      if (data?.currentStep === "CREATE_CANDY_MACHINE") {
        // setMintingSteps(originalSteps);
        // setCurrentStep(stepperKeys.SAVE_DATA);

        const newSteps = originalSteps?.map((step) => {
          if (step?.step === stepperKeys.METADATA_UPLOAD) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.CREATE_COLLECTION) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.CREATE_CANDY_MACHINE) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.SAVE_DATA) {
            return {
              ...step,
              status: stepperStatus.start,
            } as Steps;
          }
          return step;
        });
        setMintingSteps(newSteps);
      }
      if (data?.currentStep === "UPDATE_DB") {
        // setMintingSteps(originalSteps);
        // setCurrentStep(stepperKeys.SAVE_DATA);

        const newSteps = originalSteps?.map((step) => {
          if (step?.step === stepperKeys.METADATA_UPLOAD) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.CREATE_COLLECTION) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.CREATE_CANDY_MACHINE) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          if (step?.step === stepperKeys.SAVE_DATA) {
            return {
              ...step,
              status: stepperStatus.completed,
            } as Steps;
          }
          return step;
        });
        setMintingSteps(newSteps);
      }
    }
  }, [data]);

  console.log({ formSubmission });
  if (!formSubmission || isLoading) {
    return <>Loading...</>;
  }

  return (
    <div className="flex flex-col gap-10 ">
      {battleDrop && data && (
        <div>
          <Typography type="h1" size="display-lg">
            {" "}
            Battle Drop Contestant
          </Typography>
          <Link
            className="text-xs text-primary underline"
            href={routes.battleDetails(data?.battleContestant?.battle.id || "")}
          >
            {`<`} Back to battle{" "}
          </Link>
        </div>
      )}
      <div className="h-64 w-64">
        <ImageDisplay
          width={100}
          className="h-full w-full rounded-xl"
          quality={80}
          url={liveIpfsGateway + (formSubmission?.imageHash || "")} //formSubmission?.imageUri
          alt="Drop Image"
          hash={null}
          imgTagClassName="rounded-xl w-full h-full"
        />
      </div>
      <div>
        <audio
          controls
          src={liveIpfsGateway + (formSubmission?.audioHash || "")} //formSubmission?.audioUri
          // alt=""
          className="h-[3.75rem] w-[12.5rem]"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <TitleContent title="Song Title" content={formSubmission.trackTitle} />
        <TitleContent
          title="Collection Name"
          content={formSubmission.collectionName}
        />
        <TitleContent
          title="Description"
          content={formSubmission.description}
        />
        <TitleContent title="Song Title" content={formSubmission.trackTitle} />
        <TitleContent title="Symbol" content={formSubmission.symbol} />
        <TitleContent
          title="Royalties"
          content={formSubmission.sellerFeeBasisPoints?.toString()}
        />
        <TitleContent
          title="Items Available"
          content={formSubmission.itemsAvailable.toString()}
        />
      </div>
      <hr className="border-neutral-content opacity-30 "></hr>
      <div>
        <Typography className="font-bold text-neutral-content">
          Launches
        </Typography>
        {formSubmission.guards.map((guard, index) => (
          <div key={guard.label} className="my-2">
            <Label>Launch {index + 1}</Label>
            <div className="mt-2 grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 md:grid-cols-3">
              <TitleContent title="Label" content={guard.label} />
              <TitleContent
                title="Price"
                content={guard.solPayment?.amount.toString() || ""}
              />
              <TitleContent
                title="Treasury (Primary Sale Wallet)"
                content={guard.solPayment?.destination || ""}
              />
              <TitleContent
                title="Start Date"
                content={new Date(guard?.startDate as Date).toISOString() || ""}
              />
              <TitleContent
                title="End Date"
                content={new Date(guard?.endDate as Date).toISOString() || ""}
              />
              <TitleContent
                title="Mint Limit"
                content={guard.mintLimit?.toString() || ""}
              />
              <TitleContent
                title="Redeem Amount"
                content={guard.redeemAmount?.toString() || ""}
              />
            </div>
          </div>
        ))}
        <TitleContent title="Song Title" content={formSubmission.trackTitle} />
      </div>
      <hr className="border-neutral-content opacity-30 "></hr>
      <div>
        <Typography className="font-bold text-neutral-content">
          Creators & Splits
        </Typography>
        {formSubmission.walletSplits.map((w, index) => (
          <div className="my-4" key={`${w.walletAddress}${index}`}>
            <div className="flex flex-wrap space-x-3 overflow-hidden">
              <div className="">
                <TitleContent
                  title="Wallet Address"
                  content={w.walletAddress}
                />
              </div>
              <div>
                <TitleContent
                  title="Percentage"
                  content={w.percentage?.toString() || ""}
                />
              </div>
            </div>
          </div>
        ))}
        <TitleContent title="Song Title" content={formSubmission.trackTitle} />
      </div>
      <hr className="border-neutral-content opacity-30 "></hr>

      <div>
        <Typography
          size="display-xs"
          className="font-bold text-neutral-content"
        >
          Steps to publishng your drop
        </Typography>
        <ul className="steps steps-vertical w-full">
          {mintingSteps?.map((step, index) => (
            <li
              key={step.step}
              data-content={
                step.status === stepperStatus.pending
                  ? index + 1
                  : stepperDataContent[step.status]
              }
              className={`step ${stepperColor[step.status]}`}
            >
              <div className="flex flex-col space-y-3 text-left">
                <div className="flex items-center space-x-2">
                  <Typography size="body-sm">
                    {step.description[step.status]}
                  </Typography>
                  {step.status === stepperStatus.inProgress && (
                    <LoadingSpinner width={20} height={20} />
                  )}
                  {step.status === stepperStatus.error && (
                    <ExclamationCircleIcon className="text-error h-5 w-5" />
                  )}
                  {step.status === stepperStatus.start && (
                    <div className="flex">
                      <Button
                        onClick={step.retry}
                        // size="fit"
                        // rounded="lg"
                        // variant="link"
                        loading={isMinting}
                        className="ml-2 no-underline"
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </div>

                {step.status === stepperStatus.error && (
                  <div className="flex">
                    <Button
                      onClick={step.retry}
                      // size="small"
                      // rounded="lg"
                      // variant="primaryOutline"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        {data?.candyMachineSlug && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircleIcon className="text-success h-12 w-12" />
            <Typography className="text-center" size="display-xs">
              Congrats, your drop has been published on NiftyTunes.
            </Typography>
            <Typography className="text-center" color="neutral-content">
              Select the button below to view details.
            </Typography>
            {/* <Link href={`/drops/${slug}`}> */}
            <Button
              onClick={() =>
                router.push(
                  routes.battleDetails(data?.battleContestant?.battle?.id || "")
                ) as unknown
              }
              // rounded="lg"
              className="flex"
            >
              Back to battle
            </Button>
            <Button
              onClick={() =>
                router.push(
                  routes.dropDetails(data?.candyMachineSlug || "")
                ) as unknown
              }
              // rounded="lg"
              className="flex"
            >
              View Drop
            </Button>
            {/* </Link> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewMint;
