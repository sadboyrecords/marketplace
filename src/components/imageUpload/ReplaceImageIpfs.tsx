import React, { useCallback } from "react";
import Typography from "@/components/typography";
import { useDropzone } from "react-dropzone";
import Draggable, { DraggableCore } from "react-draggable";
import type {
  DraggableEventHandler,
  DraggableData,
  DraggableEvent,
} from "react-draggable";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import Button from "@/components/buttons/Button";
import { ipfsPublicGateway } from "@/utils/constants";
import { uploadFileToIpfs, getImageDimensions } from "@/utils/helpers";
import LoaderSpinner from "@/components/iconComponents/LoadingSpinner";
import { toast } from "react-toastify";
import { api } from "@/utils/api";

function DropElement({
  setLoadingUpload,
  loadingUpload,
  isBanner,
  setAxis,
  setImageIpfsHash,
  setImageUrl,
  originalImageUrl,
  originalImageHash,
}: {
  setLoadingUpload: (loading: boolean) => void;
  loadingUpload: boolean;
  setImageIpfsHash: (hash: string) => void;
  setImageUrl: (url: string) => void;
  setAxis?: any;
  isBanner?: boolean;
  originalImageUrl?: string;
  originalImageHash?: string;
}) {
  const [localImage, setLocalImage] = React.useState<File>();
  const [imageError, setImageError] = React.useState(false);
  const imageApi = api.pinnedFiles.createUpdateImage.useMutation();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setImageError(false);

    const imageFile = acceptedFiles.find((file) => file.type.includes("image"));

    if (imageFile) {
      setLocalImage(imageFile);
      setLoadingUpload(true);
      try {
        const data = await uploadFileToIpfs({ imageFile });
        const cid = data?.cid;
        const key = data?.key;
        if (cid && key) {
          const dimensions = await getImageDimensions(imageFile);
          await imageApi.mutateAsync({
            height: dimensions.height,
            width: dimensions.width,
            ipfsHash: cid,
            path: key,
          });
          setImageIpfsHash(cid);
          setImageUrl(`${ipfsPublicGateway}${cid}`);
          setLoadingUpload(false);
          console.log({ cid });
          toast.success("Your image has been successfully uploaded.");
        }
        if (!cid) {
          setImageError(true);
          setLoadingUpload(false);
          toast.error(
            "There was an error uploading your image. Please try again."
          );
        }
      } catch (error) {
        console.log(error);
        setImageError(true);
        setLoadingUpload(false);
      }
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    // isDragAccept,
    // isDragReject,
    acceptedFiles,
    fileRejections,

    open,
  } = useDropzone({
    maxFiles: 1,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDrop,
    accept: {
      "image/*": [], //'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'
    },
    // disabled,
  });

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    console.log({ e, data });
    if (isBanner) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAxis({
        y: data.y,
      });
    }
  };

  return (
    <>
      {localImage || originalImageUrl ? (
        <div className="relative h-full">
          <Draggable axis="y" onStop={handleDragStop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`h-full w-full  rounded-lg object-cover ${
                loadingUpload || imageError ? "brightness-50" : ""
              }`}
              // h-full w-full object-cover w-full h-[12.5rem]
              src={
                (localImage && URL.createObjectURL(localImage)) ||
                originalImageUrl
              }
              alt="image"
            />
          </Draggable>
          {loadingUpload && (
            <div className="absolute left-[50%] top-[10%] text-center md:top-[30%]">
              <LoaderSpinner className="h-6 w-6 text-gray-300" />
            </div>
          )}
          {imageError && (
            <div className="absolute left-[50%] top-[10%] text-center md:top-[30%]">
              <ExclamationCircleIcon className="text-error h-10 w-10" />
            </div>
          )}
          {localImage && (
            <Button
              color="primary"
              size="sm"
              className="absolute right-0 top-0 z-50 rounded-sm !p-2"
              onClick={() => setLocalImage(undefined)}
              disabled={loadingUpload}
            >
              <TrashIcon className="h-4 w-4 text-white" />
            </Button>
          )}

          <Button
            color="primary"
            size="sm"
            className="absolute bottom-0 right-0 z-50 rounded-sm !p-2"
            onClick={open}
            disabled={loadingUpload}
          >
            <CameraIcon className="h-4 w-4 text-white" />
          </Button>
        </div>
      ) : (
        <>
          <div {...getRootProps()}>
            <input
              type="file"
              name="file"
              id="file"
              className="sr-only"
              // disabled={disabled}
              {...getInputProps()}
            />
            <label
              htmlFor="file"
              className={`relative flex  min-h-[20rem] items-center justify-center rounded-lg border border-dashed  ${
                isDragActive ? "border-2 border-primary shadow-md" : ""
              } bg-base-100  text-center`}
            >
              <div>
                <div className="mb-4 text-center">
                  <svg
                    width={40}
                    height={40}
                    viewBox="0 0 80 80"
                    className="mx-auto"
                  >
                    <path
                      d="M28.3333 45L36.6667 55L48.3333 40L63.3333 60H16.6667L28.3333 45ZM70 63.3333V16.6667C70 12.9667 67 10 63.3333 10H16.6667C14.8986 10 13.2029 10.7024 11.9526 11.9526C10.7024 13.2029 10 14.8986 10 16.6667V63.3333C10 65.1014 10.7024 66.7971 11.9526 68.0474C13.2029 69.2976 14.8986 70 16.6667 70H63.3333C65.1014 70 66.7971 69.2976 68.0474 68.0474C69.2976 66.7971 70 65.1014 70 63.3333Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <Typography>
                  <span className="mb-2">Drop image file Here</span>
                </Typography>
                <Typography size="body-xs">
                  PNG, JPEG, JPG, WebP, GIF, SVG
                </Typography>
                <Typography className="mt-2">
                  Or select to choose a file
                </Typography>
              </div>
            </label>
          </div>
        </>
      )}

      {fileRejections?.map((fileRejection) => (
        <div key={fileRejection.file.name} className="text-error text-sm">
          {fileRejection.errors[0]?.message}
        </div>
      ))}
    </>
  );
}

export default DropElement;
