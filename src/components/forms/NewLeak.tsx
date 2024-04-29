import React, { useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { IUserCredits } from "@/utils/types";
import Input from "@/components/formFields/Input";
import Button from "@/components/buttons/Button";
import DropElement from "@/components/mintingContainer/DropElement";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { routes, liveIpfsGateway } from "@/utils/constants";
import { toast } from "react-toastify";
import { api } from "@/utils/api";

const UploadedFileIpfs = dynamic(
  () => import("@/components/mintingContainer/UploadedFileIpfs"),
  { ssr: false }
);

// type IMintKeys = keyof IMint;

interface FormValues {
  leakName: string;
  artistName: string;
  artistWalletAddress: string;
  songTitle: string;
  imageUri: string;
  imageHash?: string;
  audioUri: string;
  audioHash?: string;
  credits: IUserCredits[];
  pline?: string;
  cline?: string;
}

// const defaultCredits = [
//   {
//     walletAddress: "",
//     name: "",
//     role: [],
//   },
// ];

function NewLeak({ isEditing = false }: { isEditing?: boolean }) {
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
      // credits: defaultCredits,
    },
  });
  const router = useRouter();
  const slug = router.query.slug as string | undefined;
  // console.log({ id });

  const { data: leak, isLoading } = api.leaks.getLeak.useQuery(
    { slug: slug || "" },
    { enabled: !!slug && isEditing }
  );

  // console.log({ battle });

  const [loading, setLoading] = React.useState(false);
  const [isLoaded, setIsloaded] = React.useState(false);

  // const {
  //   fields: creditFields,
  //   append: appendCredits,
  //   remove: removeCredits,
  // } = useFieldArray({
  //   control,
  //   name: "credits",
  // });

  // const credits = watch("credits");

  const audioHash = watch("audioHash");
  const imageHash = watch("imageHash");
  // const allValues = watch();

  const [preventUpload, setPreventUpload] = React.useState(false);

  const [localTrack, setLocalTrack] = React.useState<File>();
  const [localImage, setLocalImage] = React.useState<File>();

  React.useEffect(() => {
    setIsloaded(true);
  }, []);

  React.useEffect(() => {
    if (audioHash) {
      setValue("audioUri", liveIpfsGateway + audioHash);
      clearErrors("audioUri");
    } else {
      setValue("audioUri", "");
    }
    if (imageHash) {
      setValue("imageUri", liveIpfsGateway + imageHash);
      clearErrors("imageUri");
    } else {
      setValue("imageUri", "");
    }
  }, [audioHash, imageHash, setValue, clearErrors]);

  React.useEffect(() => {
    if (localTrack) {
      clearErrors("audioUri");
    }
    if (localImage) {
      clearErrors("imageUri");
    }
  }, [localTrack, localImage, clearErrors]);

  const mutation = api.leaks.createLeak.useMutation();
  const updateLeak = api.leaks.update.useMutation();
  // console.log({ imageHash, imageHash2, first, second });

  const onSubmit = async (data: FormValues) => {
    console.log({ formSubmission: data });

    try {
      if (!localTrack) {
        setError(
          "audioUri",
          {
            type: "custom",
            message: "Audio file is required",
          },
          { shouldFocus: true }
        );
      }
      if (!localImage) {
        setError(
          "imageUri",
          {
            type: "custom",
            message: "Image file is required",
          },
          { shouldFocus: true }
        );

        if (!localImage || !localTrack) {
          if (!isEditing) {
            toast.warn("Please upload your files");
            return;
          }
        }
        if (!audioHash || !imageHash) {
          toast.warn("Please wait for your files to uploadt");
          return;
        }
        setLoading(true);
      }
      if (isEditing) {
        console.log("editing");
        if (!leak) return;
        const updated = await updateLeak.mutateAsync({
          leakId: leak.id,
          leakName:
            data.leakName.trim() === leak.leakName.trim()
              ? undefined
              : data.leakName,
          disconnctAudioHash:
            data.audioHash === leak.songs[0]?.lossyAudioIPFSHash
              ? undefined
              : leak.songs[0]?.lossyAudioIPFSHash || undefined,
          imageHash: data.imageHash,
          imageUrl: data.imageUri,
          songInfo:
            data.audioHash === leak.songs[0]?.lossyAudioIPFSHash
              ? undefined
              : {
                  artistName: data.artistName,
                  artistWalletAddress: data.artistWalletAddress,
                  songTitle: data.songTitle,
                  audioHash: data.audioHash as string,
                  audioUrl: data.audioUri,
                },
        });
        if (updated) {
          toast.success("Leak updated successfully");
          await router.push(routes.leakDetails(updated.slug));
        }
        return;
      }
      //     setLoading(true);
      if (!data.audioHash || !data.imageHash) {
        toast.warn("Please wait for your files to upload");
        return;
      }

      const created = await mutation.mutateAsync({
        artistName: data.artistName,
        leakName: data.leakName,
        artistWalletAddress: data.artistWalletAddress,
        songTitle: data.songTitle,
        audioHash: data.audioHash,
        audioUrl: data.audioUri,
        imageHash: data.imageHash,
        imageUrl: data.imageUri,
      });
      if (created) {
        toast.success("Leak created successfully");
        await router.push(routes.leakDetails(created.slug));
      }
      setLoading(false);
    } catch (error) {
      console.log({ error });
      toast.error("Error creating leak");
      setLoading(false);
    }
  };

  const fetchContents = useCallback(async () => {
    console.log({ leak });
    if (!leak) return;
    console.log("running");
    if (leak.pinnedImage) {
      const imageRes = await fetch(
        `${niftytunesIpfsUrl}${leak.pinnedImage?.ipfsHash}` || ""
      );
      const imageBlob = await imageRes.blob();
      const imageType = imageRes.headers.get("content-type");
      const imageFile = new File([imageBlob], "", {
        type: imageType || "image/jpeg",
      });
      setLocalImage(imageFile);
    }

    if (leak.songs[0]?.lossyAudioIPFSHash) {
      console.log("--audio hashj-");
      const audioRes = await fetch(
        `${niftytunesIpfsUrl}${leak.songs[0].lossyAudioIPFSHash}`
        // `${leak.songs[0].lossyAudioURL}`
      );
      console.log({ audioRes });
      console.log("--audio res----------");

      const audioBlob = await audioRes.blob();
      const type = audioRes.headers.get("content-type");
      const audioFile = new File([audioBlob], "", {
        type: type || "audio/mp3",
      });
      setLocalTrack(audioFile);
    }
  }, [leak]);
  // React.useEffect(() => {
  //   if (battle && !editedState) {
  //     console.log("----effect to updated");

  //     setPreventUpload(true);
  //     //  setValue("leakName", battle.leakName);

  //     setEditedState(true);
  //   }
  // }, [battle, editedState, setValue]);
  const [formUpdate, setFormUpdate] = React.useState(false);
  React.useEffect(() => {
    if (isEditing && leak && !formUpdate) {
      const song = leak.songs[0];
      if (!song) return;
      setValue("leakName", leak.leakName);
      setValue("artistWalletAddress", song.creators[0]?.walletAddress || "");
      setValue("artistName", song.creators[0]?.name || "");
      setValue("audioHash", song?.lossyAudioIPFSHash || "");
      setValue("audioUri", song?.lossyAudioURL || "");
      setValue("imageHash", song?.lossyArtworkIPFSHash || "");
      setValue("imageUri", song?.lossyArtworkURL || "");
      setValue("songTitle", song?.title || "");
      void fetchContents();
      setFormUpdate(true);
    }
  }, [formUpdate, isEditing, leak, setValue, fetchContents]);

  // React.useEffect(() => {
  //   void fetchContents();
  // }, [fetchContents]);

  if (isEditing && (isLoading || !leak)) {
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
          label="Leak Name"
          // optional
          type="text"
          error={!!errors?.leakName}
          errorMessage={(errors?.leakName?.message as string) || ""}
          inputProps={{
            ...register("leakName", {
              required: "You must provide a leak name ",
            }),
          }}
        />
        <Input
          label="Artist Name "
          // description="(First Contestant)"
          type="text"
          error={!!errors?.artistName}
          errorMessage={(errors?.artistName?.message as string) || ""}
          inputProps={{
            ...register("artistName", {
              required: "You must provide an Artist Name",
            }),
          }}
        />
        <Input
          label="Wallet Address"
          description="(Wallet Address for this artist)"
          type="text"
          error={!!errors?.artistWalletAddress}
          errorMessage={(errors?.artistWalletAddress?.message as string) || ""}
          inputProps={{
            ...register("artistWalletAddress", {
              required: "You must provide a wallet address",
            }),
          }}
        />
        <Input
          label="Song Title"
          // optional
          type="text"
          error={!!errors?.songTitle}
          errorMessage={(errors?.songTitle?.message as string) || ""}
          inputProps={{
            ...register("songTitle", {
              required: "You must provide a song title",
            }),
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
              setIPFSHash={(imageIPFS) => setValue("imageHash", imageIPFS)}
              clearFile={() => {
                setPreventUpload(false);
                setLocalImage(undefined);
                setValue("imageHash", undefined);
              }}
            />
          )}
          {localTrack && (
            <UploadedFileIpfs
              preventUpload={preventUpload}
              uploadedFile={localTrack}
              setIPFSHash={(trackHash) => setValue("audioHash", trackHash)}
              clearFile={() => {
                setPreventUpload(false);
                setLocalTrack(undefined);
                setValue("audioHash", undefined);
              }}
            />
          )}
        </div>
        {/* <div>
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
                        error={!!errors?.credits?.[index]?.name}
                        errorMessage={
                          (errors?.credits?.[index]?.name?.message as string) ||
                          ""
                        }
                        inputProps={{
                          ...register(`credits.${index}.name`, {
                            required: "You must enter a name",
                          }),
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
                          ...register(`credits.${index}.role`),
                        }}
                      />
                      <RadioCheckbox
                        label="Featured Artist"
                        type="checkbox"
                        name="role"
                        value="FEATURED_ARTIST"
                        inputProps={{
                          ...register(`credits.${index}.role`),
                        }}
                      />
                      <RadioCheckbox
                        label="Producer"
                        type="checkbox"
                        name="role"
                        value="PRODUCER"
                        inputProps={{
                          ...register(`credits.${index}.role`),
                        }}
                      />
                      <RadioCheckbox
                        label="Songwriter"
                        type="checkbox"
                        name="role"
                        value="SONGWRITER"
                        inputProps={{
                          ...register(`credits.${index}.role`),
                        }}
                      />
                      <RadioCheckbox
                        label="Label"
                        type="checkbox"
                        name="role"
                        value="LABEL"
                        inputProps={{
                          ...register(`credits.${index}.role`),
                        }}
                      />
                      <RadioCheckbox
                        label="Distributor"
                        type="checkbox"
                        name="role"
                        value="DISTRIBUTOR"
                        inputProps={{
                          ...register(`credits.${index}.role`),
                        }}
                      />
                    </div>
                    <div className="flex">
                      <button
                        className={`btn btn-link flex ${
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
                        disabled={credits.length < 2}
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
                ...register("cline"),
              }}
            />
            <Input
              label="PLine"
              type="text"
              inputProps={{
                ...register("pline"),
              }}
            />
          </div>
        </div> */}
        <Button loading={loading} type="submit">
          Save
        </Button>
      </form>
    </>
  );
}

export default NewLeak;
