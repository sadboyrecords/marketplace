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
import { getCreatorname } from "@/utils/helpers";
import { DocumentDuplicateIcon as CopyIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Input from "@/components/formFields/Input";
import TextArea from "@/components/formFields/TextArea";
import { type SubmitHandler, useForm } from "react-hook-form";

type UserInfoProps = {
  walletAddress?: string;
};

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
  } = useForm<{
    name?: string;
    description?: string;
  }>();

  const watchDescription = watch("description");
  const utils = api.useContext();
  const userMutations = api.user.updateUser.useMutation();

  const handleUpdateProfile: SubmitHandler<{
    name?: string;
    description?: string;
  }> = async (data) => {
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
      };
      await userMutations.mutateAsync(updatedProfile);

      await utils.user.myProfile.invalidate();
      await refetch();
      setIsLoading(false);
      setEditing(false);
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
  }, [
    setValue,
    userData?.data?.description,
    userData?.data?.firstName,
    userData?.data?.name,
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
              <div className="flex w-full flex-wrap items-center justify-between space-y-4 sm:w-auto sm:flex-col">
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
                              maxLength: {
                                value: 160,
                                message: `You can only enter 160 characters. You currently have ${
                                  watchDescription?.length || ""
                                } characters`,
                              },
                            }),
                          }}
                        />
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
                            copied ? "tooltip-open tooltip tooltip-bottom" : ""
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
