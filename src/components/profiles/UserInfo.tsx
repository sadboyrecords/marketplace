/* eslint-disable @typescript-eslint/no-misused-promises */
import Button from "@/components/buttons/Button";
import { useMemo, useState } from "react";
import ReplaceImageIpfs from "@/components/imageUpload/ReplaceImageIpfs";
import Typography from "@/components/typography";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import { api } from "@/utils/api";
import Image from "next/image";
import Avatar from "@/components/avatar/Avatar";
import MarginLayout from "../layouts/MarginLayout";
import { getCreatorname, isValidUrl } from "@/utils/helpers";
import { DocumentDuplicateIcon as CopyIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Input from "@/components/formFields/Input";
import TextArea from "@/components/formFields/TextArea";
import {
  SpotifyIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  DiscordIcon,
  TikTokIcon,
} from "@/components/iconComponents";
import { type SubmitHandler, useForm } from "react-hook-form";
import { socialMediaPrefix } from "@/utils/constants";

type UserInfoProps = {
  walletAddress?: string;
};

interface ProfileUpdateType {
  name?: string;
  description?: string;
  instagram?: string;
  spotify?: string;
  facebook?: string;
  twitter?: string;
  discord?: string;
  tiktok?: string;
}

function UserInfo({ walletAddress }: UserInfoProps) {
  const userData = api.user.getUser.useQuery(
    { publicKey: walletAddress || "" },
    {
      enabled: !!walletAddress,
    }
  );

  const { data: user, refetch } = userData;

  const [isLoading, setIsLoading] = useState(false);
  const [axis, setAxis] = useState<{ x: number; y: number }>();
  const [imageHash, setImageHash] = useState<string>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarImageHash, setAvatarImageHash] = useState<string>();
  const [avatarImageUrl, setAvatarImageUrl] = useState<string>();
  const [uploadingAvatarImage, setUploadingAvatarImage] = useState(false);
  const [avatarAxis, setAvatarAxis] = useState<{
    x: number;
    y: number;
  }>();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  // const { publicKey: loggedInUserKey } = useWallet();
  const loggedInUserKey = session?.user.walletAddress;
  const publicAddress =
    userData?.data?.magicSolanaAddress || userData?.data?.walletAddress;
  const disableSave = uploadingImage || uploadingAvatarImage;
  const imFollowing = userData?.data?.followers?.filter(
    (f) => f?.followerAddress === loggedInUserKey
  );

  const follow = api.user.followUnfollow.useMutation();

  const handleFollow = async () => {
    if (!walletAddress) return;
    try {
      setIsLoading(true);
      const followUser = imFollowing?.length === 0;
      await follow.mutateAsync({
        followingAddress: walletAddress,
        isFollowing: followUser,
        userAddress: loggedInUserKey as string,
      });
      // debugger;
      await refetch();
      // toast.success(
      //   followUser
      //     ? `You're now following ${getCreatorname({
      //         name: user?.name || user?.firstName || "",
      //         walletAddress: publicAddress || "",
      //       })}`
      //     : `You have unfollowed ${getCreatorname({
      //         name: user?.name || user?.firstName || "",
      //         walletAddress: publicAddress || "",
      //       })}`
      // );
      setIsLoading(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again later");
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!publicAddress) return;
    navigator.clipboard
      .writeText(publicAddress)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1000); // Set timeout for 3 seconds (3000 milliseconds)
      })
      .catch((error) => {
        console.error("Error copying text to clipboard:", error);
      });
  };

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileUpdateType>();

  // SpotifyIcon,
  // InstagramIcon,
  // FacebookIcon,
  // TwitterIcon,
  // DiscordIcon,
  // TikTokIcon,

  const watchDescription = watch("description");
  const utils = api.useContext();
  const userMutations = api.user.updateUser.useMutation();

  const handleUpdateProfile: SubmitHandler<ProfileUpdateType> = async (
    data
  ) => {
    try {
      setIsLoading(true);
      const updatedProfile = {
        name: data.name,
        description: data.description,
        walletAddress: session?.user.walletAddress,
        profileBannerImage: imageUrl,
        profileBannerHash: imageHash,
        profilePictureImage: avatarImageUrl,
        profilePictureHash: avatarImageHash,
        profileBannerXAxis: axis?.x,
        profileBannerYAxis: axis?.y,
        profilePictureXAxis: avatarAxis?.x,
        profilePictureYAxis: avatarAxis?.y,
        instagram: data.instagram,
        facebook: data.facebook,
        twitter: data.twitter,
        tiktok: data.tiktok,
        discord: data.discord,
        spotify: data.spotify,
      };
      await userMutations.mutateAsync(updatedProfile);

      await utils.user.myProfile.invalidate();
      await refetch();
      setIsLoading(false);
      setEditing(false);
      reset();
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Something went wrong. Please try again later");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue("name", userData?.data?.name || userData?.data?.firstName || "");
    setValue("description", userData?.data?.description || "");
    setEditing(false);
  };

  useMemo(() => {
    setValue("name", userData?.data?.name || userData?.data?.firstName || "");
    setValue("description", userData?.data?.description || "");
    setValue("instagram", userData?.data?.instagram || "");
    setValue("facebook", userData?.data?.facebook || "");
    setValue("twitter", userData?.data?.twitter || "");
    setValue("tiktok", userData?.data?.tiktok || "");
    setValue("discord", userData?.data?.discord || "");
    setValue("spotify", userData?.data?.spotify || "");
  }, [
    setValue,
    userData?.data?.description,
    userData?.data?.discord,
    userData?.data?.facebook,
    userData?.data?.firstName,
    userData?.data?.instagram,
    userData?.data?.name,
    userData?.data?.spotify,
    userData?.data?.tiktok,
    userData?.data?.twitter,
  ]);

  return (
    <>
      <div className="relative mx-auto  -mt-20 w-full">
        {/* Banner */}
        <div className="relative h-80 overflow-hidden sm:h-96 ">
          {editing ? (
            <ReplaceImageIpfs
              isBanner
              setAxis={setAxis}
              setLoadingUpload={setUploadingImage}
              loadingUpload={uploadingImage}
              setImageIpfsHash={setImageHash}
              setImageUrl={setImageUrl}
              originalImageHash={user?.profileBannerHash || undefined}
              originalImageUrl={user?.profileBannerImage || undefined}
            />
          ) : (
            <div className="relative h-full w-full">
              {user?.profileBannerImage ? (
                <ImageDisplay
                  width={500}
                  // height={500}
                  quality={80}
                  url={user?.profileBannerImage || undefined}
                  hash={user?.profileBannerHash || null}
                  fill
                  className=" object-cover"
                  //  translate(0px, -146.922px)
                />
              ) : (
                <Image
                  //   width={6000}
                  //   height={3375}
                  alt="background image"
                  quality={80}
                  src={"/placeholder/banners/vector.jpg"}
                  fill
                  sizes="10vw"
                  priority
                  className="object-cover brightness-75"
                  //    translate(0px, -146.922px)
                />
              )}
            </div>
          )}
        </div>
      </div>
      <MarginLayout>
        <div className="sm:mt-[-75px]">
          <div className="flex max-w-3xl flex-wrap  gap-6 ">
            {user ? (
              <div className="flex w-full flex-wrap items-center justify-between space-y-4 sm:w-auto sm:flex-col sm:justify-start">
                <Avatar
                  editing={editing}
                  setAxis={setAvatarAxis}
                  setLoadingUpload={setUploadingAvatarImage}
                  loadingUpload={uploadingAvatarImage}
                  setImageIpfsHash={setAvatarImageHash}
                  setImageUrl={setAvatarImageUrl}
                  src={user?.profilePictureImage || ""}
                  imageHash={user?.profilePictureHash || undefined}
                  width="150px"
                  height="150px"
                  widthNumber={150}
                  heightNumber={150}
                  alt={user?.name || user?.firstName || publicAddress || ""}
                  pinnedStatus={user?.pinnedProfilePicture?.status}
                  username={
                    user?.name || user?.firstName || publicAddress || ""
                  }
                  path={user?.pinnedProfilePicture?.path}
                  // mx-auto lg:ml-[3rem]
                />
                {/* follow button/edit/Cancel */}
                {session?.user && (
                  <div className="mt-2 sm:w-full">
                    {walletAddress !== loggedInUserKey ? (
                      <Button
                        className=" w-full"
                        onClick={handleFollow}
                        loading={isLoading}
                      >
                        {imFollowing && imFollowing?.length > 0
                          ? "Unfollow"
                          : "Follow"}
                      </Button>
                    ) : (
                      <Button
                        // variant="outlined"
                        className={`w-full ${editing ? "hidden" : ""}`}
                        onClick={() => setEditing(!editing)}
                        loading={isLoading}
                      >
                        {editing ? "Cancel" : "Edit"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className=" h-36 w-36 animate-pulse rounded-xl bg-gray-400/30" />
                <div className=" h-12 w-36 animate-pulse rounded-xl bg-gray-400/30" />
              </div>
            )}

            {/* follow button/edit/Cancel */}
            <div className="flex flex-1 flex-col place-self-end sm:mt-[75px]">
              {editing ? (
                <>
                  <div className="">
                    {editing && (
                      <div className="flex flex-col gap-6">
                        <Input
                          label="Name"
                          inputProps={{
                            ...register("name", {}),
                          }}
                        />
                        <TextArea
                          label="Bio"
                          rows={5}
                          error={!!errors?.description?.message}
                          errorMessage={
                            (errors?.description?.message as string) || "error"
                          }
                          inputProps={{
                            ...register("description", {
                              // maxLength: {
                              //   value: 160,
                              //   message: `You can only enter 160 characters. You currently have ${
                              //     watchDescription?.length || ""
                              //   } characters`,
                              // },
                            }),
                          }}
                        />
                        <div className="flex flex-col space-y-2">
                          <p className="font-bold">Socials</p>
                          {/* <div className="flex space-x-8">
                            <p className="text-sm text-gray-500">
                              @ - handle only
                            </p>
                            <p className="text-sm text-gray-500">
                              url: full url
                            </p>
                          </div> */}

                          <Input
                            // label="Name"
                            // type=""
                            error={!!errors?.instagram?.message}
                            errorMessage={
                              (errors?.instagram?.message as string) || "error"
                            }
                            beginAddOn="@"
                            iconEnd={
                              <span className="flex">
                                <InstagramIcon className="h-5 w-5 text-base-content" />
                              </span>
                            }
                            placeholder="instagram_handle"
                            inputProps={{
                              ...register("instagram", {
                                validate: (value) => {
                                  if (
                                    value &&
                                    value.includes("instagram.com")
                                  ) {
                                    return "Please enter a valid instagram handle";
                                  }
                                  return true;
                                },
                              }),
                            }}
                          />
                          <Input
                            beginAddOn="@"
                            iconEnd={
                              <TikTokIcon className="h-6 w-6 text-base-content" />
                            }
                            error={!!errors?.tiktok?.message}
                            errorMessage={
                              (errors?.tiktok?.message as string) || "error"
                            }
                            placeholder="tiktok_handle"
                            inputProps={{
                              ...register("tiktok", {
                                validate: (value) => {
                                  if (value && value.includes("tiktok.com")) {
                                    return "Please enter a valid tiktok handle";
                                  }
                                  return true;
                                },
                              }),
                            }}
                          />

                          <Input
                            beginAddOn="@"
                            iconEnd={
                              <TwitterIcon className="h-6 w-6 text-base-content" />
                            }
                            error={!!errors?.twitter?.message}
                            errorMessage={
                              (errors?.twitter?.message as string) || "error"
                            }
                            placeholder="twitter_handle"
                            inputProps={{
                              ...register("twitter", {
                                validate: (value) => {
                                  if (value && value.includes("twitter.com")) {
                                    return "Please enter a valid x handle";
                                  }
                                  return true;
                                },
                              }),
                            }}
                          />
                          <Input
                            // type=""
                            beginAddOn="@"
                            iconEnd={
                              <FacebookIcon className="h-5 w-5 text-base-content" />
                            }
                            error={!!errors?.facebook?.message}
                            errorMessage={
                              (errors?.facebook?.message as string) || "error"
                            }
                            placeholder="facebook_username"
                            inputProps={{
                              ...register("facebook", {
                                validate: (value) => {
                                  if (value && value.includes("facebook.com")) {
                                    return "Please enter a valid facebook handle";
                                  }
                                  return true;
                                },
                              }),
                            }}
                          />
                          <Input
                            type="url"
                            beginAddOn="url"
                            iconEnd={
                              <DiscordIcon className="h-6 w-6 text-base-content" />
                            }
                            error={!!errors?.discord?.message}
                            errorMessage={
                              (errors?.discord?.message as string) || "error"
                            }
                            placeholder="https://discord.gg/1234567890"
                            inputProps={{
                              ...register("discord", {
                                // validate: (value) => {
                                //   if (value && isValidUrl(value)) {
                                //     return true;
                                //   } else if (value && !isValidUrl(value)) {
                                //     return "Please enter a valid url";
                                //   }
                                //   return true;
                                // },
                              }),
                            }}
                          />

                          <Input
                            beginAddOn="url"
                            // description="Enter your spotify profile url"
                            iconEnd={
                              <SpotifyIcon className="h-6 w-6 text-base-content" />
                            }
                            error={!!errors?.spotify?.message}
                            errorMessage={
                              (errors?.spotify?.message as string) || "error"
                            }
                            placeholder="https://open.spotify.com/artist/1234567890192"
                            inputProps={{
                              ...register("spotify", {
                                // validate: (value) => {
                                //   if (value && isValidUrl(value)) {
                                //     return true;
                                //   } else if (value && !isValidUrl(value)) {
                                //     return "Please enter a valid url";
                                //   }
                                //   return true;
                                // },
                              }),
                            }}
                          />
                        </div>
                        {/* upload profile image */}
                        {/* <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-neutral-900">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    className="border border-neutral-300 rounded-md p-2"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      const image = await upload(file);
                      userMutations.mutateAsync({
                        profilePictureImage: image,
                      });
                      toast.success('Profile image updated');
                      userData.refetch();
                    }}
                  />
                </div> */}
                        <div className="mt-2 space-x-2">
                          <Button
                            loading={isLoading}
                            onClick={handleSubmit(handleUpdateProfile)}
                            disabled={disableSave}
                          >
                            Save
                          </Button>
                          <Button variant="ghost" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {user ? (
                    <>
                      <Typography
                        size="display-xs"
                        className="max-w-sm shrink flex-wrap break-words font-bold"
                      >
                        {getCreatorname({
                          name: user?.name || user?.firstName || "",
                          walletAddress: publicAddress || "",
                        })}
                        {/* {user?.firstName || walletAddress} */}
                      </Typography>
                      <div
                        className={`inline-flex cursor-pointer  items-center`}
                        onClick={handleCopy}
                      >
                        <Typography
                          type="div"
                          size="body"
                          color="neutral-gray"
                          className={` `}
                        >
                          {getCreatorname({
                            name: "",
                            walletAddress: publicAddress || "",
                          })}
                          {/* {user?.firstName || walletAddress} */}
                        </Typography>
                        <div
                          data-tip="Copied"
                          className={`ml-1 h-4 w-4 text-neutral-content ${
                            copied ? "tooltip tooltip-bottom tooltip-open" : ""
                          } `}
                        >
                          <CopyIcon
                            className={`ml-1 h-4 w-4 text-neutral-content `}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <div className=" h-4 w-36 animate-pulse bg-gray-400/30" />
                      <div className=" h-4 w-24 animate-pulse bg-gray-400/30" />
                      <div className=" h-4 w-36 animate-pulse bg-gray-400/30" />
                    </div>
                  )}

                  {/* FOLLOWS/FOLLOWER SECTION */}
                  {user && (
                    <div className="mt-3 flex flex-row gap-10">
                      <div className="flex flex-row gap-2">
                        <Typography className="font-bold">
                          {user.following?.length || 0}
                          <span className=" ml-1 font-normal">Following</span>
                        </Typography>
                      </div>
                      <div className="flex flex-row gap-2">
                        <Typography className="font-bold">
                          {user.followers?.length || 0}
                          <span className=" ml-1 font-normal">Followers</span>
                        </Typography>
                      </div>
                    </div>
                  )}
                  {/* BIO */}
                  <Typography
                    size="body-sm"
                    className="mt-2"
                    color="neutral-content"
                  >
                    {user?.description}
                  </Typography>
                  {/* SOCIALS */}
                  <div className="mt-4 flex flex-row flex-wrap items-center gap-4">
                    {user?.instagram && (
                      <a
                        target="_blank"
                        href={socialMediaPrefix.instagram + user?.instagram}
                      >
                        <InstagramIcon className="h-4 w-4 cursor-pointer" />
                      </a>
                    )}
                    {user?.twitter && (
                      <a
                        target="_blank"
                        href={socialMediaPrefix.twitter + user?.twitter}
                      >
                        <TwitterIcon className="h-5 w-5 cursor-pointer" />
                      </a>
                    )}
                    {user?.tiktok && (
                      <a
                        target="_blank"
                        href={socialMediaPrefix.tiktok + user?.tiktok}
                      >
                        <TikTokIcon className=" cursor-pointer" />
                      </a>
                    )}
                    {user?.facebook && (
                      <a
                        target="_blank"
                        href={socialMediaPrefix.facebook + user?.facebook}
                      >
                        <FacebookIcon className=" cursor-pointer" />
                      </a>
                    )}
                    {user?.spotify && (
                      <a target="_blank" href={user?.spotify}>
                        <SpotifyIcon className="h-5 w-5 cursor-pointer" />
                      </a>
                    )}
                    {user?.discord && (
                      <a target="_blank" href={user?.discord}>
                        <DiscordIcon className=" h-5 w-5 cursor-pointer" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* <div>user</div> */}
        </div>
      </MarginLayout>
    </>
  );
}

export default UserInfo;
