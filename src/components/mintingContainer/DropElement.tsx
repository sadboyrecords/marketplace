import React, { useCallback } from "react";
import Typography from "@/components/typography";
import { useDropzone } from "react-dropzone";

function DropElement({
  setLocalImage,
  setLocalTrack,
  localImage,
  localTrack,
}: {
  setLocalImage: (file: File) => void;
  setLocalTrack: (file: File) => void;
  localImage: File | undefined;
  localTrack: File | undefined;
}) {
  const typeValidation = (file: File) => {
    if (localImage) {
      if (file.type.split("/")[0] === "image") {
        return {
          code: "image already uploaded",
          message: `You have already uploaded your image`,
        };
      }
    }
    if (localTrack) {
      if (file.type.split("/")[0] === "audio") {
        return {
          code: "track already uploaded",
          message: `You have already uploaded your track`,
        };
      }
    }

    return null;
  };
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFile = acceptedFiles.find((file) =>
        file.type.includes("image")
      );
      const audioFile = acceptedFiles.find((file) =>
        file.type.includes("audio")
      );
      // if (!imageFile || !audioFile) return;

      if (imageFile) {
        setLocalImage(imageFile);
      }
      if (audioFile) {
        console.log("has audio");
        setLocalTrack(audioFile);
      }
    },
    [setLocalImage, setLocalTrack]
  );

  const disabled = !!localImage && !!localTrack;

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    // isDragAccept,
    // isDragReject,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    maxFiles: 2,
    onDrop,
    validator: typeValidation,
    accept: {
      "image/*": [], //'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'
      "audio/*": [], //'.mp3', '.mp4', '.ogg', '.wav', '.flac', '.aac', '.m4a', '.wma', '.aiff', '.ape', '.opus'
    },
    disabled,
  });

  // const handleDrop = (e: any) => {
  //   e.preventDefault();
  //   const acceptedFiles = e.target.files;
  //   const file = acceptedFiles[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     // check for image or audio
  //     if (file.type.includes("image")) {
  //       setLocalImage(file);
  //     }
  //     if (file.type.includes("audio")) {
  //       setLocalTrack(file);
  //     }
  //   };
  //   // reader.onabort = () => console.log('file reading was aborted');
  //   // reader.onerror = () => console.log;
  //   reader?.readAsArrayBuffer(file);
  //   e.target.value = null;
  // };

  // const acceptString = () => {
  //   let acceptString = "";
  //   if (!localImage) {
  //     acceptString += "image/* ";
  //   }
  //   if (!localTrack) {
  //     acceptString += "audio/* ";
  //   }
  //   return acceptString;
  // };

  return (
    <div {...getRootProps()}>
      <input
        type="file"
        name="file"
        id="file"
        className="sr-only"
        disabled={disabled}
        {...getInputProps()}
      />
      <label
        htmlFor="file"
        className={`relative flex  min-h-[12.5rem] items-center justify-center rounded-lg border border-dashed ${
          !disabled
            ? "border-base-content text-base-content"
            : "border-base-300 text-base-300"
        } ${
          isDragActive ? "border-2 border-primary shadow-md" : ""
        } bg-base-100  text-center`}
      >
        <div>
          <div className="mb-4 text-center">
            <svg width={40} height={40} viewBox="0 0 80 80" className="mx-auto">
              <path
                d="M28.3333 45L36.6667 55L48.3333 40L63.3333 60H16.6667L28.3333 45ZM70 63.3333V16.6667C70 12.9667 67 10 63.3333 10H16.6667C14.8986 10 13.2029 10.7024 11.9526 11.9526C10.7024 13.2029 10 14.8986 10 16.6667V63.3333C10 65.1014 10.7024 66.7971 11.9526 68.0474C13.2029 69.2976 14.8986 70 16.6667 70H63.3333C65.1014 70 66.7971 69.2976 68.0474 68.0474C69.2976 66.7971 70 65.1014 70 63.3333Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <Typography size="body">
            <span className="mb-2">
              Drop {!localImage && "Image"}{" "}
              {!localImage && !localTrack && "and"} {!localTrack && "Audio"}{" "}
              File Here
            </span>
          </Typography>
          <Typography size="body-sm">
            ({!localImage && "PNG, JPEG, WebP, etc"}{" "}
            {!localTrack && "MP3, OGG, WAV"} File)
          </Typography>
          <Typography size="body" className="mt-2">
            Or select to choose a file
          </Typography>
        </div>
      </label>
      {fileRejections?.map((fileRejection) => (
        <div key={fileRejection.file.name} className="text-error text-sm">
          {fileRejection.errors[0]?.message}
        </div>
      ))}
    </div>
  );
}

export default DropElement;
