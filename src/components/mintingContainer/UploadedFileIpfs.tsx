import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  TrashIcon,
  CheckCircleIcon,
  // XCircleIcon,
  ArrowPathRoundedSquareIcon as RefreshIcon,
} from "@heroicons/react/24/solid";
import OvalLoader from "@/components/loaders/OvalLoader";
import Button from "@/components/buttons/Button";
import { uploadFileToIpfs, getImageDimensions } from "@/utils/helpers";
import { api } from "@/utils/api";

function UploadedFileIpfs({
  uploadedFile,
  setIPFSHash,
  clearFile,
  text,
  placeholderImg,
  preventUpload,
}: // uploadPercentage = 0,
{
  preventUpload?: boolean;
  uploadedFile: File;
  setIPFSHash: (hash: string | undefined) => void;
  clearFile: () => void;
  text?: string;
  placeholderImg?: any;
  // uploadPercentage?: number;
}) {
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<
    "PENDING" | "UPLOADING" | "ERROR" | "SUCCESS"
  >("PENDING");
  const [type, setType] = useState<"IMAGE" | "AUDIO" | "VIDEO" | undefined>();

  const imageApi = api.pinnedFiles.createUpdateImage.useMutation();
  const audioApi = api.pinnedFiles.createUpdateAudio.useMutation();

  const handleUpload = async () => {
    // e?.preventDefault();

    try {
      console.log("UPLOADING");
      setStatus("UPLOADING");
      let isImage = false;
      const fileType = uploadedFile.type;
      if (fileType.includes("image")) {
        isImage = true;
        setType("IMAGE");
        if (preventUpload) {
          setStatus("SUCCESS");
          return;
        }
        console.log("---UPLOADING IMAGE TO IPFS---");
        const data = await uploadFileToIpfs({ imageFile: uploadedFile });
        const cid = data?.cid;
        const key = data?.key;
        // console.log({ cid, key });
        if (cid && key) {
          const dimensions = await getImageDimensions(uploadedFile);
          console.log({ dimensions });
          const res = await imageApi.mutateAsync({
            height: dimensions.height,
            width: dimensions.width,
            ipfsHash: cid,
            path: key,
          });
          // console.log({ res });
        }

        setIPFSHash(cid);
        if (!cid) {
          toast.error("Error uploading file");
        }
      }
      if (fileType.includes("audio")) {
        console.log("------UPLOADING AUDIO TO IPFS------");
        setType("AUDIO");
        if (preventUpload) {
          setStatus("SUCCESS");
          console.log("PREVENT UPLOAD");
          return;
        }
        console.log({ uploadedFile });
        const data = await uploadFileToIpfs({ audioFile: uploadedFile });
        const cid = data?.cid;
        const key = data?.key;
        if (cid && key) {
          const res = await audioApi.mutateAsync({
            ipfsHash: cid,
            path: key,
          });
          // console.log({ res });
        }

        setIPFSHash(cid);
        if (!cid) {
          toast.error("Error uploading file");
        }
      }

      setStatus("SUCCESS");
    } catch (e) {
      console.log("upload error:", e);
      toast.error("Error uploading file");
      setStatus("ERROR");
      setDone(false);
    }
  };

  // console.log({ status });

  useMemo(() => {
    if (uploadedFile && !done) {
      void handleUpload();
    }
  }, [uploadedFile]);

  const handleDelete = () => {
    // e.preventDefault();
    void clearFile();
  };

  return (
    <div className="flex items-center justify-between ">
      <div className="flex flex-col space-y-2">
        <div className="h-auto w-auto truncate text-base font-medium text-base-content">
          {type === "IMAGE" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              src={URL.createObjectURL(uploadedFile) || placeholderImg}
              alt="uploaded image"
              className="h-[100px] w-[100px]"
            />
          )}
          {type === "AUDIO" && (
            <audio
              controls
              src={URL.createObjectURL(uploadedFile)}
              // alt=""
              className="h-[3.75rem] w-[12.5rem]"
            />
          )}
        </div>
        <div className="w-[12.5rem] truncate text-base font-medium text-base-content">
          {text} {uploadedFile?.name}
        </div>
        {/* {!art || !done ? (
     
    ) : (
     
    )} */}
      </div>

      <div className="flex  items-center">
        {/* <span
          className="flex h-3 w-3 relative tooltip"
          data-tip={getStepText()}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75" />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${getStepColor()}`}
          />
        </span> */}

        {status === "UPLOADING" && (
          <>
            <OvalLoader className="h-6 w-6" />
          </>
        )}
        {status === "ERROR" && (
          <>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button variant="ghost" onClick={handleUpload}>
              <RefreshIcon className="h-6 w-6" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          onClick={handleDelete}
          disabled={status === "UPLOADING"}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
        {/* {status === "ERROR" && (
          <>
            <XCircleIcon className="text-error h-6 w-6" />
          </>
        )} */}
        {status === "SUCCESS" && (
          <>
            <CheckCircleIcon className="text-success h-6 w-6" />
          </>
        )}
      </div>
    </div>
  );
}

export default UploadedFileIpfs;
