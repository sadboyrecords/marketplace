import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type { IMint, GuardFormType } from "@/utils/types";
import Typography from "@/components/typography";
import Input from "@/components/formFields/Input";
import DateTimePicker from "../formFields/DateTimePicker";
import Button from "@/components/buttons/Button";
import FormFieldLabel from "@/components/formFields/FormFieldLabel";
import { PublicKey } from "@metaplex-foundation/js";
import { TrashIcon } from "@heroicons/react/24/outline";
import RadioCheckbox from "../formFields/RadioCheckbox";
import DropElement from "@/components/mintingContainer/DropElement";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  routes,
  battleDropsTreasury,
  ipfsPublicGateway,
} from "@/utils/constants";
import { toast } from "react-toastify";
import { api } from "@/utils/api";
import TextArea from "@/components/formFields/TextArea";
import { solanaUsdToken } from "@/utils/constants";
import type { inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type RouterOutput = inferRouterInputs<AppRouter>;

const UploadedFileIpfs = dynamic(
  () => import("@/components/mintingContainer/UploadedFileIpfs"),
  { ssr: false }
);

type FormSubmissionType = RouterOutput["battle"]["createBattle"];

// type IMintKeys = keyof IMint;

interface FormValues {
  battleName: string;
  battleDescription: string;
  battleImage?: string;
  battlePrice: number;
  battleStartDate: Date;
  battleEndDate: Date;
  royalties: number;
  itemsAvailable: number;
  firstContestant: IMint;
  secondContestant: IMint;
  contestantOne: {
    name: string;
    bio?: string;
    walletAddress: string;
  };
  contestantTwo: {
    name: string;
    bio?: string;
    walletAddress: string;
  };
}

const defaultWalletSplits = [
  {
    walletAddress: "",
    percentage: undefined,
  },
];
const defaultCredits = [
  {
    walletAddress: "",
    name: "",
    role: [],
  },
];

function NewBattle({ isEditing = false }: { isEditing?: boolean }) {
  const niftytunesIpfsUrl = "https://niftytunes.myfilebase.com/ipfs/";
  const {
    register,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      // firstContestant: {
      //   walletSplits: defaultWalletSplits,
      //   credits: defaultCredits,
      // },
      // secondContestant: {
      //   walletSplits: defaultWalletSplits,
      //   credits: defaultCredits,
      // },
    },
  });
  const router = useRouter();
  const id = router.query.id as string | undefined;
  // console.log({ id });

  const { data: battle, isLoading } = api.battle.getBattleById.useQuery(
    { battleId: id || "" },
    { enabled: !!id && isEditing }
  );

  // console.log({ battle });

  const [loading, setLoading] = React.useState(false);
  const [isLoaded, setIsloaded] = React.useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "firstContestant.walletSplits",
  });

  const {
    fields: creditFields,
    append: appendCredits,
    remove: removeCredits,
  } = useFieldArray({
    control,
    name: "firstContestant.credits",
  });

  const {
    fields: fields2,
    append: append2,
    remove: remove2,
  } = useFieldArray({
    control,
    name: "secondContestant.walletSplits",
  });

  const {
    fields: creditFields2,
    append: appendCredits2,
    remove: removeCredits2,
  } = useFieldArray({
    control,
    name: "secondContestant.credits",
  });

  const startDate = watch("battleStartDate");
  const endDate = watch("battleEndDate");
  const royallties = watch("royalties");
  const price = watch("battlePrice");

  //   const;
  const splits = watch("firstContestant.walletSplits");
  const splits2 = watch("secondContestant.walletSplits");
  const credits = watch("firstContestant.credits");
  const credits2 = watch("secondContestant.credits");

  const audioHash = watch("firstContestant.audioHash");
  const imageHash = watch("firstContestant.imageHash");
  const audioHash2 = watch("secondContestant.audioHash");
  const imageHash2 = watch("secondContestant.imageHash");

  // const first = watch("firstContestant");
  // const second = watch("secondContestant");

  const [preventUpload, setPreventUpload] = React.useState(false);
  const [editedState, setEditedState] = React.useState(false);

  const [localTrack, setLocalTrack] = React.useState<File>();
  const [localImage, setLocalImage] = React.useState<File>();

  const [localTrack2, setLocalTrack2] = React.useState<File>();
  const [localImage2, setLocalImage2] = React.useState<File>();

  React.useEffect(() => {
    setIsloaded(true);
  }, []);

  React.useEffect(() => {
    // Effect for all same components
    if (startDate) {
      setValue("firstContestant.startDateTime", startDate);
      setValue("secondContestant.startDateTime", startDate);
    }
    if (endDate) {
      setValue("firstContestant.endDateTime", endDate);
      setValue("secondContestant.endDateTime", endDate);
    }
    if (price) {
      setValue("firstContestant.lowestPrice", price);
      setValue("secondContestant.lowestPrice", price);
    }
    if (royallties) {
      setValue("firstContestant.royalties", royallties);
      setValue("firstContestant.sellerFeeBasisPoints", royallties);
      setValue("secondContestant.royalties", royallties);
      setValue("secondContestant.sellerFeeBasisPoints", royallties);
    }
  }, [startDate, endDate, price, royallties, setValue]);

  React.useEffect(() => {
    if (audioHash) {
      setValue("firstContestant.audioUri", ipfsPublicGateway + audioHash);
      clearErrors("firstContestant.audioUri");
    } else {
      setValue("firstContestant.audioUri", "");
    }
    if (audioHash2) {
      setValue("secondContestant.audioUri", ipfsPublicGateway + audioHash2);
      clearErrors("secondContestant.audioUri");
    } else {
      setValue("secondContestant.audioUri", "");
    }
    if (imageHash) {
      setValue("firstContestant.imageUri", ipfsPublicGateway + imageHash);
      clearErrors("firstContestant.imageUri");
    } else {
      setValue("firstContestant.imageUri", "");
    }
    if (imageHash2) {
      setValue("secondContestant.imageUri", ipfsPublicGateway + imageHash2);
      clearErrors("secondContestant.imageUri");
    } else {
      setValue("secondContestant.imageUri", "");
    }
  }, [audioHash, audioHash2, imageHash, imageHash2, setValue, clearErrors]);

  // React.useMemo(() => {
  //   if (artistName) {
  //     setValue("firstContestant.credits[", artistName);
  //   }
  // },[])

  React.useEffect(() => {
    if (battleDropsTreasury) {
      setValue("firstContestant.treasuryAddress", battleDropsTreasury);
      setValue("secondContestant.treasuryAddress", battleDropsTreasury);
    }
  }, [setValue]);

  React.useEffect(() => {
    if (localTrack) {
      clearErrors("firstContestant.audioUri");
    }
    if (localTrack2) {
      clearErrors("secondContestant.audioUri");
    }
    if (localImage) {
      clearErrors("firstContestant.imageUri");
    }
    if (localImage2) {
      clearErrors("secondContestant.imageUri");
    }
  }, [localTrack, localTrack2, localImage, localImage2, clearErrors]);

  const mutation = api.battle.createBattle.useMutation();
  const updateBattle = api.battle.updateBattle.useMutation();
  // console.log({ imageHash, imageHash2, first, second });

  const onSubmit = async (data: FormValues) => {
    console.log({ formSubmission: data });

    // validate
    if (!data.firstContestant || !data.secondContestant) {
      return;
    }
    if (!localTrack) {
      setError(
        "firstContestant.audioUri",
        {
          type: "custom",
          message: "Audio file is required",
        },
        { shouldFocus: true }
      );
    }
    if (!localTrack2) {
      setError(
        "secondContestant.audioUri",
        {
          type: "custom",
          message: "Audio file is required",
        },
        { shouldFocus: true }
      );
    }
    if (!localImage) {
      setError(
        "firstContestant.imageUri",
        {
          type: "custom",
          message: "Image file is required",
        },
        { shouldFocus: true }
      );
    }
    if (!localImage2) {
      setError(
        "secondContestant.imageUri",
        {
          type: "custom",
          message: "Image file is required",
        },
        { shouldFocus: true }
      );
    }
    if (!localImage || !localTrack || !localImage2 || !localTrack2) {
      if (!isEditing) {
        toast.warn("Please upload your files");
        return;
      }
    }
    if (!audioHash || !imageHash || !audioHash2 || !imageHash2) {
      toast.warn("Please wait for your files to uploadt");
      return;
    }
    setLoading(true);
    try {
      const guards: GuardFormType[] = [
        {
          label: "battle",
          endDate: data.battleEndDate,
          startDate: data.battleStartDate,
          // solPayment: {
          //   amount: data.battlePrice,
          //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          //   destination: battleDropsTreasury!,
          // },
          tokenPayment: {
            amount: data.battlePrice,
            destination: battleDropsTreasury as string,
            splTokenAddress: solanaUsdToken,
          },
        },
      ];

      const submitData: FormSubmissionType = {
        ...data,
        contestantOne: {
          ...data.contestantOne,
          dropData: {
            ...data.firstContestant,
            guards,
            price: data.battlePrice,
            royalties: data.royalties,
            itemsAvailable: 10000,
            startDateTime: data.battleStartDate,
            endDateTime: data.battleEndDate,
            lowestPrice: data.battlePrice,
            symbol: data.firstContestant?.collectionName
              ?.slice(0, 2)
              .toUpperCase(),
          },
        },
        contestantTwo: {
          ...data.contestantTwo,
          dropData: {
            ...data.secondContestant,
            guards,
            price: data.battlePrice,
            royalties: data.royalties,
            itemsAvailable: 10000,
            lowestPrice: data.battlePrice,
            startDateTime: data.battleStartDate,
            endDateTime: data.battleEndDate,
            symbol: data.secondContestant?.collectionName
              ?.slice(0, 2)
              .toUpperCase(),
          },
        },
      };

      console.log({ submitData });
      if (!isEditing) {
        const res = await mutation.mutateAsync(submitData);

        void router.push(routes.battleDetails(res.id));
        if (!res) {
          setLoading(false);
          toast.error("Something went wrong");
          return;
        }
      }
      if (isEditing && battle) {
        const res = await updateBattle.mutateAsync({
          ...submitData,
          battleId: battle.id,
          contestantOneId: battle.battleContestants[0]?.id,
          contestantTwoId: battle.battleContestants[1]?.id,
        });

        void router.push(routes.battleDetails(res.id));
        if (!res) {
          setLoading(false);
          toast.error("Something went wrong");
          return;
        }
      }
    } catch (error) {
      console.log({ error });
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  console.log({ editedState });
  const fetchContents = async (drop1: IMint, drop2: IMint) => {
    console.log("--in content function-", drop1, drop2);
    fetch(drop1?.imageUri)
      .then((res) => {
        console.log(" image res---->", res);
      })
      .catch((err) => {
        console.log("err-----", err);
      });

    const imageRes = await fetch(drop1?.imageUri);
    console.log({ imageRes });
    const imageBlob = await imageRes.blob();
    const imageType = imageRes.headers.get("content-type");
    const imageFile = new File([imageBlob], "", {
      type: imageType || "image/jpeg",
    });
    setLocalImage(imageFile);
    const imageRes2 = await fetch(drop2?.imageUri);
    const imageBlob2 = await imageRes2.blob();
    const imageType2 = imageRes2.headers.get("content-type");
    const imageFile2 = new File([imageBlob2], "", {
      type: imageType2 || "image/jpeg",
    });
    setLocalImage2(imageFile2);
    if (drop1?.audioHash) {
      console.log("--audio hashj-");
      const audioRes = await fetch(`${niftytunesIpfsUrl}${drop1?.audioHash}`);
      console.log({ audioRes });
      const audioBlob = await audioRes.blob();
      const type = audioRes.headers.get("content-type");
      const audioFile = new File([audioBlob], "", {
        type: type || "audio/mp3",
      });
      setLocalTrack(audioFile);
    }

    const audioRes2 = await fetch(drop2?.audioUri);
    const audioBlob2 = await audioRes2.blob();
    const type2 = audioRes2.headers.get("content-type");
    const audioFile2 = new File([audioBlob2], "", {
      type: type2 || "audio/mp3",
    });
    setLocalTrack2(audioFile2);
  };
  React.useEffect(() => {
    if (battle && !editedState) {
      console.log("----effect to updated");
      // Object.keys(battle).forEach((key) => {
      //   console.log({ key, value: battle[key] });
      // });
      setValue("battleName", battle.battleName);
      setValue("battlePrice", battle.battlePrice || 0);
      setValue("battleStartDate", battle.battleStartDate);
      setValue("battleEndDate", battle.battleEndDate);
      setValue("royalties", battle.royalties || 0);
      const firstContestant = battle.battleContestants[0];
      const secondContestant = battle.battleContestants[1];
      const drop1 = firstContestant?.candyMachineDraft
        ?.formSubmission as unknown as IMint;
      const drop2 = secondContestant?.candyMachineDraft
        ?.formSubmission as unknown as IMint;
      setValue("contestantOne.name", firstContestant?.primaryArtistName || "");
      setValue("contestantTwo.name", secondContestant?.primaryArtistName || "");
      setValue("contestantOne.bio", firstContestant?.user.description || "");
      setValue("contestantTwo.bio", secondContestant?.user.description || "");
      setValue(
        "contestantOne.walletAddress",
        firstContestant?.user.walletAddress || ""
      );
      setValue(
        "contestantTwo.walletAddress",
        secondContestant?.user.walletAddress || ""
      );
      // console.log({ drop1 });
      // if (drop1) {
      //   // Object.keys(drop1).forEach((key) => {
      //   //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   //   // @ts-ignore
      //   //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      //   //   return setValue(`firstContestant.${key}`, drop1[key]);
      //   // });
      // }

      // setValue("firstContestant.trackTitle", drop1?.trackTitle || "");
      // setValue("secondContestant.trackTitle", drop2?.trackTitle || "");

      // Object.keys(drop2?.formSubmission).forEach((key) => {
      //   // console.log({ key, value: drop1?.formSubmission[key] });
      //   setValue(`secondContestant.${key}`, drop2?.formSubmission[key]);
      setPreventUpload(true);
      setValue("firstContestant.collectionName", drop1?.collectionName || "");
      setValue("secondContestant.collectionName", drop2?.collectionName || "");
      setValue("firstContestant.trackTitle", drop1?.trackTitle || "");
      setValue("secondContestant.trackTitle", drop2?.trackTitle || "");
      setValue("firstContestant.description", drop1?.description || "");
      setValue("secondContestant.description", drop2?.description || "");
      setValue("firstContestant.walletSplits", drop1?.walletSplits || "");
      setValue("secondContestant.walletSplits", drop2?.walletSplits || "");
      setValue("firstContestant.credits", drop1?.credits || "");
      setValue("secondContestant.credits", drop2?.credits || "");
      setValue("firstContestant.cline", drop1?.cline || "");
      setValue("secondContestant.cline", drop2?.cline || "");
      setValue("firstContestant.pline", drop1?.pline || "");
      setValue("secondContestant.pline", drop2?.pline || "");
      setValue("firstContestant.audioHash", drop1?.audioHash || "");
      setValue("secondContestant.audioHash", drop2?.audioHash || "");
      setValue("firstContestant.imageHash", drop1?.imageHash || "");
      setValue("secondContestant.imageHash", drop2?.imageHash || "");
      setValue("firstContestant.audioUri", drop1?.audioUri || "");
      setValue("secondContestant.audioUri", drop2?.audioUri || "");
      setValue("firstContestant.imageUri", drop1?.imageUri || "");
      setValue("secondContestant.imageUri", drop2?.imageUri || "");
      console.log("----fetching contents");
      fetchContents(drop1, drop2)
        .then(() => {
          console.log("---finished");
          setEditedState(true);
        })
        .catch((err) => {
          console.log("err-----", err);
          setEditedState(true);
        });
      setEditedState(true);
    }
  }, [battle, editedState, setValue]);

  React.useEffect(() => {
    if (!isEditing) {
      setValue("firstContestant.walletSplits", defaultWalletSplits);
      setValue("secondContestant.walletSplits", defaultWalletSplits);
      setValue("firstContestant.credits", defaultCredits);
      setValue("secondContestant.credits", defaultCredits);
    }
  }, [isEditing, setValue]);

  if (isEditing && (isLoading || !battle)) {
    return (
      <div className="flex max-w-lg flex-col space-y-8">
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-border-gray" />
      </div>
    );
  }

  return (
    <>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex max-w-lg flex-col gap-4"
      >
        <Input
          label="Battle Name"
          // optional
          type="text"
          error={!!errors?.battleName}
          errorMessage={(errors?.battleName?.message as string) || ""}
          inputProps={{
            ...register("battleName", {
              required: "You must provide a battle name ",
            }),
          }}
        />
        <Input
          label="Price (USDC)"
          type="number"
          error={!!errors?.battlePrice}
          errorMessage={(errors?.battlePrice?.message as string) || ""}
          inputProps={{
            step: "any",
            ...register("battlePrice", {
              required: "You must provide a price ",
              min: 0.1,
              valueAsNumber: true,
            }),
          }}
        />
        <Input
          label="Royalties"
          description="(Secondary Sales)"
          type="number"
          error={!!errors?.royalties}
          errorMessage={(errors?.royalties?.message as string) || ""}
          inputProps={{
            ...register("royalties", {
              required: "You must provide royallties",
              valueAsNumber: true,
            }),
          }}
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <Controller
            name="battleStartDate"
            control={control}
            rules={{ required: "You must provide a start date" }}
            render={({ field }) => (
              <DateTimePicker
                onChange={(date) => field.onChange(date)}
                value={field.value}
                timePickerTitle="Start Time"
                error={!!errors?.battleStartDate}
                errorMessage={
                  (errors?.battleStartDate?.message as string) || ""
                }
                label="Start Date/Time"
                //   startDateTime={guards[index]?.startDate}
                //   startDateInterval={1}
                //   optional
                // tooltipText="Add a date and time for your sale to end. If you don't set an end date, your sale will be open until you cancel it or it is purchased."
              />
            )}
          />
          <Controller
            name="battleEndDate"
            control={control}
            rules={{ required: "You must provide a start date" }}
            render={({ field }) => (
              <DateTimePicker
                onChange={(date) => field.onChange(date)}
                value={field.value}
                timePickerTitle="End Time"
                error={!!errors?.battleEndDate}
                errorMessage={(errors?.battleEndDate?.message as string) || ""}
                label="End Date/Time"
                //   startDateTime={guards[index]?.startDate}
                //   startDateInterval={1}
                //   optional
                // tooltipText="Add a date and time for your sale to end. If you don't set an end date, your sale will be open until you cancel it or it is purchased."
              />
            )}
          />
        </div>
        {/* FIRST CONTESTANT */}
        <div className="flex flex-col gap-4">
          <Typography className="mt-4 font-semibold" size="display-xs">
            Contestant 1
          </Typography>
          <Input
            label="Artist Name "
            description="(First Contestant)"
            type="text"
            error={!!errors?.contestantOne?.name}
            errorMessage={
              (errors?.contestantOne?.name?.message as string) || ""
            }
            inputProps={{
              ...register("contestantOne.name", {
                required: "You must provide an Artist Name",
              }),
            }}
          />
          <Input
            label="Wallet Address"
            description="(Wallet Address for this artist)"
            type="text"
            error={!!errors?.contestantOne?.walletAddress}
            errorMessage={
              (errors?.contestantOne?.walletAddress?.message as string) || ""
            }
            inputProps={{
              ...register("contestantOne.walletAddress", {
                required: "You must provide a wallet address",
              }),
            }}
          />
          <TextArea
            label="Bio"
            type="text"
            inputProps={{
              ...register("contestantOne.bio"),
            }}
          />

          <div className="mt-4 flex flex-col space-y-8">
            {(!localImage || !localTrack) && (
              <DropElement
                localImage={localImage}
                setLocalImage={setLocalImage}
                localTrack={localTrack}
                setLocalTrack={setLocalTrack}
              />
            )}

            {localImage && (
              <UploadedFileIpfs
                preventUpload={preventUpload}
                uploadedFile={localImage}
                setIPFSHash={(imageIPFS) =>
                  setValue("firstContestant.imageHash", imageIPFS)
                }
                clearFile={() => {
                  setPreventUpload(false);
                  setLocalImage(undefined);
                  setValue("firstContestant.imageHash", undefined);
                }}
              />
            )}
            {localTrack && (
              <UploadedFileIpfs
                preventUpload={preventUpload}
                uploadedFile={localTrack}
                setIPFSHash={(trackHash) =>
                  setValue("firstContestant.audioHash", trackHash)
                }
                clearFile={() => {
                  setPreventUpload(false);
                  setLocalTrack(undefined);
                  setValue("firstContestant.audioHash", undefined);
                }}
              />
            )}
          </div>
          <Input
            label="Song Title"
            optional
            type="text"
            error={!!errors?.firstContestant?.trackTitle}
            errorMessage={
              (errors?.firstContestant?.trackTitle?.message as string) || ""
            }
            inputProps={{
              ...register("firstContestant.trackTitle", {
                required: "You must provide a song title",
              }),
            }}
          />
          <Input
            label="Collection Name"
            type="text"
            error={!!errors?.firstContestant?.collectionName}
            errorMessage={
              (errors?.firstContestant?.collectionName?.message as string) || ""
            }
            inputProps={{
              ...register("firstContestant.collectionName", {
                required: "You must provide a collection name",
              }),
            }}
          />
          <TextArea
            label="Collection Description"
            type="text"
            error={!!errors?.firstContestant?.description}
            errorMessage={
              (errors?.firstContestant?.description?.message as string) || ""
            }
            inputProps={{
              ...register("firstContestant.description", {
                required: "You must provide a collection description",
              }),
            }}
          />
          <div>
            <FormFieldLabel tooltipText="Add anyone that will you will split the token secondary sales with">
              Creators & Splits
            </FormFieldLabel>
            <div className="space-y-4">
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-end space-x-2">
                      <div className="basis-5/6">
                        <Input
                          placeholder="Wallet Address"
                          error={
                            !!errors?.firstContestant?.walletSplits?.[index]
                              ?.walletAddress
                          }
                          errorMessage={
                            (errors?.firstContestant?.walletSplits?.[index]
                              ?.walletAddress?.message as string) || ""
                          }
                          inputProps={{
                            ...register(
                              `firstContestant.walletSplits.${index}.walletAddress`,
                              {
                                required: "You must provide a wallet address",
                                validate: (value) => {
                                  if (value) {
                                    try {
                                      const isValid = new PublicKey(value);
                                      if (!isValid) {
                                        return "You must provide a valid public key";
                                      }
                                    } catch (error) {
                                      return "You must provide a valid public key";
                                    }
                                  }
                                },
                              }
                            ),
                          }}
                        />
                      </div>
                      <div>
                        <Input
                          error={
                            !!errors?.firstContestant?.walletSplits?.[index]
                              ?.percentage
                          }
                          errorMessage={
                            errors?.firstContestant?.walletSplits?.[index]
                              ?.percentage?.message
                          }
                          placeholder="Percentage"
                          type="number"
                          inputProps={{
                            ...register(
                              `firstContestant.walletSplits.${index}.percentage`,
                              {
                                required: "You must provide a percentage",

                                valueAsNumber: true,
                                validate: (value) => {
                                  const formfields = getValues();
                                  if (value === 0)
                                    return "Percentage can't be 0";
                                  if (value && value > 100) {
                                    return "Percentage cannot be greater than 100.";
                                  }
                                  const result =
                                    formfields.firstContestant?.walletSplits.reduce(
                                      (acc, obj) => acc + (obj.percentage || 0),
                                      0
                                    );
                                  if (result && result > 100) {
                                    return "Total splits cannot be more 100.";
                                  }
                                  // return 0;
                                },
                              }
                            ),
                          }}
                        />
                      </div>
                      <div>
                        <Button
                          variant="outlined"
                          disabled={splits.length < 2}
                          onClick={() => remove(index)}
                        >
                          <TrashIcon className="h-4 w-4 " />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  //   rounded="lg"
                  //   color="ghost"
                  //   className="text-xs space-x-1 px-2"
                  //   variant="outline"
                  onClick={() => {
                    append({
                      walletAddress: "",
                      percentage: undefined,
                    });
                  }}
                >
                  Add another Wallet
                </Button>
              </div>
            </div>
          </div>
          <div>
            <FormFieldLabel className="font-extrabold " tooltipText="Credits ">
              Credits
            </FormFieldLabel>
            <div className="mt-4 flex flex-col gap-3">
              <>
                <div>
                  {creditFields.map((item, index) => (
                    <div key={item.id} className="flex flex-col space-y-4">
                      <div className="">
                        <Input
                          label="Name (Artist, label, producer, etc.)"
                          placeholder=""
                          error={
                            !!errors?.firstContestant?.credits?.[index]?.name
                          }
                          errorMessage={
                            (errors?.firstContestant?.credits?.[index]?.name
                              ?.message as string) || ""
                          }
                          inputProps={{
                            ...register(
                              `firstContestant.credits.${index}.name`,
                              {
                                required: "You must enter a name",
                              }
                            ),
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3">
                        <RadioCheckbox
                          label="Primary Artist"
                          type="checkbox"
                          name="role"
                          value="PRIMARY_ARTIST"
                          inputProps={{
                            ...register(
                              `firstContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Featured Artist"
                          type="checkbox"
                          name="role"
                          value="FEATURED_ARTIST"
                          inputProps={{
                            ...register(
                              `firstContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Producer"
                          type="checkbox"
                          name="role"
                          value="PRODUCER"
                          inputProps={{
                            ...register(
                              `firstContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Songwriter"
                          type="checkbox"
                          name="role"
                          value="SONGWRITER"
                          inputProps={{
                            ...register(
                              `firstContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Label"
                          type="checkbox"
                          name="role"
                          value="LABEL"
                          inputProps={{
                            ...register(
                              `firstContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        {/* <RadioCheckbox
                          label="Publisher"
                          type="checkbox"
                          name="role"
                          value="PUBLISHER"
                          inputProps={{
                            ...register(`credits.${index}.role`),
                          }}
                        /> */}
                        <RadioCheckbox
                          label="Distributor"
                          type="checkbox"
                          name="role"
                          value="DISTRIBUTOR"
                          inputProps={{
                            ...register(
                              `firstContestant.credits.${index}.role`
                            ),
                          }}
                        />
                      </div>
                      <div className="flex">
                        <button
                          className={`btn-link btn flex ${
                            credits?.length - 1 === index ? "" : "hidden"
                          }`}
                          // disabled={credits.length < 2}
                          onClick={() => {
                            appendCredits({
                              walletAddress: "",
                              name: "",
                              role: [],
                            });
                          }}
                        >
                          Add
                        </button>
                        <Button
                          variant="ghost"
                          disabled={credits2.length < 2}
                          onClick={() => removeCredits(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
              <Input
                label="CLine"
                type="text"
                inputProps={{
                  ...register("firstContestant.cline"),
                }}
              />
              <Input
                label="PLine"
                type="text"
                inputProps={{
                  ...register("firstContestant.pline"),
                }}
              />
            </div>
          </div>
        </div>
        {/* SECOND CONTESTANT */}
        <div className="flex flex-col gap-4">
          <Typography className="mt-4 font-semibold" size="display-xs">
            Contestant 2
          </Typography>
          <Input
            label="Artist Name "
            description="(First Contestant)"
            type="text"
            error={!!errors?.contestantTwo?.name}
            errorMessage={
              (errors?.contestantTwo?.name?.message as string) || ""
            }
            inputProps={{
              ...register("contestantTwo.name", {
                required: "You must provide an Artist Name",
              }),
            }}
          />
          <Input
            label="Wallet Address"
            description="(Wallet Address for this artist)"
            type="text"
            error={!!errors?.contestantTwo?.walletAddress}
            errorMessage={
              (errors?.contestantTwo?.walletAddress?.message as string) || ""
            }
            inputProps={{
              ...register("contestantTwo.walletAddress", {
                required: "You must provide a wallet address",
              }),
            }}
          />
          <TextArea
            label="Bio"
            type="text"
            inputProps={{
              ...register("contestantTwo.bio"),
            }}
          />
          <div className="mt-4 flex flex-col space-y-8">
            {(!localImage2 || !localTrack2) && (
              <DropElement
                localImage={localImage2}
                setLocalImage={setLocalImage2}
                localTrack={localTrack2}
                setLocalTrack={setLocalTrack2}
              />
            )}

            {localImage2 && (
              <UploadedFileIpfs
                preventUpload={preventUpload}
                uploadedFile={localImage2}
                setIPFSHash={(imageIPFS) =>
                  setValue("secondContestant.imageHash", imageIPFS)
                }
                clearFile={() => {
                  setPreventUpload(false);
                  setLocalImage2(undefined);
                  setValue("secondContestant.imageHash", undefined);
                }}
              />
            )}
            {localTrack2 && (
              <UploadedFileIpfs
                preventUpload={preventUpload}
                uploadedFile={localTrack2}
                setIPFSHash={(trackHash) =>
                  setValue("secondContestant.audioHash", trackHash)
                }
                clearFile={() => {
                  setPreventUpload(false);
                  setLocalTrack2(undefined);
                  setValue("secondContestant.audioHash", undefined);
                }}
              />
            )}
          </div>
          <Input
            label="Song Title"
            optional
            type="text"
            error={!!errors?.secondContestant?.trackTitle}
            errorMessage={
              (errors?.secondContestant?.trackTitle?.message as string) || ""
            }
            inputProps={{
              ...register("secondContestant.trackTitle", {
                required: "You must provide a song title",
              }),
            }}
          />
          <Input
            label="Collection Name"
            type="text"
            error={!!errors?.secondContestant?.collectionName}
            errorMessage={
              (errors?.secondContestant?.collectionName?.message as string) ||
              ""
            }
            inputProps={{
              ...register("secondContestant.collectionName", {
                required: "You must provide a collection name",
              }),
            }}
          />
          <TextArea
            label="Collection Description"
            type="text"
            error={!!errors?.secondContestant?.description}
            errorMessage={
              (errors?.secondContestant?.description?.message as string) || ""
            }
            inputProps={{
              ...register("secondContestant.description", {
                required: "You must provide a collection description",
              }),
            }}
          />
          <div>
            <FormFieldLabel tooltipText="Add anyone that will you will split the token secondary sales with">
              Creators & Splits
            </FormFieldLabel>
            <div className="space-y-4">
              <div className="space-y-4">
                {fields2.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-end space-x-2">
                      <div className="basis-5/6">
                        <Input
                          placeholder="Wallet Address"
                          error={
                            !!errors?.secondContestant?.walletSplits?.[index]
                              ?.walletAddress
                          }
                          errorMessage={
                            (errors?.secondContestant?.walletSplits?.[index]
                              ?.walletAddress?.message as string) || ""
                          }
                          inputProps={{
                            ...register(
                              `secondContestant.walletSplits.${index}.walletAddress`,
                              {
                                required: "You must provide a wallet address",
                                validate: (value) => {
                                  if (value) {
                                    try {
                                      const isValid = new PublicKey(value);
                                      if (!isValid) {
                                        return "You must provide a valid public key";
                                      }
                                    } catch (error) {
                                      return "You must provide a valid public key";
                                    }
                                  }
                                },
                              }
                            ),
                          }}
                        />
                      </div>
                      <div>
                        <Input
                          error={
                            !!errors?.secondContestant?.walletSplits?.[index]
                              ?.percentage
                          }
                          errorMessage={
                            errors?.secondContestant?.walletSplits?.[index]
                              ?.percentage?.message
                          }
                          placeholder="Percentage"
                          type="number"
                          inputProps={{
                            ...register(
                              `secondContestant.walletSplits.${index}.percentage`,
                              {
                                required: "You must provide a percentage",

                                valueAsNumber: true,
                                validate: (value) => {
                                  const formfields = getValues();
                                  if (value === 0)
                                    return "Percentage can't be 0";
                                  if (value && value > 100) {
                                    return "Percentage cannot be greater than 100.";
                                  }
                                  const result =
                                    formfields.secondContestant?.walletSplits.reduce(
                                      (acc, obj) => acc + (obj.percentage || 0),
                                      0
                                    );
                                  if (result && result > 100) {
                                    return "Total splits cannot be more 100.";
                                  }
                                  // return 0;
                                },
                              }
                            ),
                          }}
                        />
                      </div>
                      <div>
                        <Button
                          variant="outlined"
                          disabled={splits2.length < 2}
                          onClick={() => remove2(index)}
                        >
                          <TrashIcon className="h-4 w-4 " />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  //   rounded="lg"
                  //   color="ghost"
                  //   className="text-xs space-x-1 px-2"
                  //   variant="outline"
                  onClick={() => {
                    append2({
                      walletAddress: "",
                      percentage: undefined,
                    });
                  }}
                >
                  Add another Wallet
                </Button>
              </div>
            </div>
          </div>
          <div>
            <FormFieldLabel className="font-extrabold " tooltipText="Credits ">
              Credits
            </FormFieldLabel>
            <div className="mt-4 flex flex-col gap-3">
              <>
                <div>
                  {creditFields2.map((item, index) => (
                    <div key={item.id} className="flex flex-col space-y-4">
                      <div className="">
                        <Input
                          label="Name (Artist, label, producer, etc.)"
                          placeholder=""
                          error={
                            !!errors?.secondContestant?.credits?.[index]?.name
                          }
                          errorMessage={
                            (errors?.secondContestant?.credits?.[index]?.name
                              ?.message as string) || ""
                          }
                          inputProps={{
                            ...register(
                              `secondContestant.credits.${index}.name`,
                              {
                                required: "You must enter a name",
                              }
                            ),
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3">
                        <RadioCheckbox
                          label="Primary Artist"
                          type="checkbox"
                          name="role"
                          value="PRIMARY_ARTIST"
                          inputProps={{
                            ...register(
                              `secondContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Featured Artist"
                          type="checkbox"
                          name="role"
                          value="FEATURED_ARTIST"
                          inputProps={{
                            ...register(
                              `secondContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Producer"
                          type="checkbox"
                          name="role"
                          value="PRODUCER"
                          inputProps={{
                            ...register(
                              `secondContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Songwriter"
                          type="checkbox"
                          name="role"
                          value="SONGWRITER"
                          inputProps={{
                            ...register(
                              `secondContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        <RadioCheckbox
                          label="Label"
                          type="checkbox"
                          name="role"
                          value="LABEL"
                          inputProps={{
                            ...register(
                              `secondContestant.credits.${index}.role`
                            ),
                          }}
                        />
                        {/* <RadioCheckbox
                          label="Publisher"
                          type="checkbox"
                          name="role"
                          value="PUBLISHER"
                          inputProps={{
                            ...register(`credits.${index}.role`),
                          }}
                        /> */}
                        <RadioCheckbox
                          label="Distributor"
                          type="checkbox"
                          name="role"
                          value="DISTRIBUTOR"
                          inputProps={{
                            ...register(
                              `secondContestant.credits.${index}.role`
                            ),
                          }}
                        />
                      </div>
                      <div className="flex">
                        <button
                          className={`btn-link btn flex ${
                            credits2?.length - 1 === index ? "" : "hidden"
                          }`}
                          // disabled={credits.length < 2}
                          onClick={() => {
                            appendCredits2({
                              walletAddress: "",
                              name: "",
                              role: [],
                            });
                          }}
                        >
                          Add
                        </button>
                        <Button
                          variant="ghost"
                          disabled={credits2.length < 2}
                          onClick={() => removeCredits2(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
              <Input
                label="CLine"
                type="text"
                inputProps={{
                  ...register("secondContestant.cline"),
                }}
              />
              <Input
                label="PLine"
                type="text"
                inputProps={{
                  ...register("secondContestant.pline"),
                }}
              />
            </div>
          </div>
        </div>
        <Button loading={loading} type="submit">
          Save
        </Button>
      </form>
    </>
  );
}

export default NewBattle;
