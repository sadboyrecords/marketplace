import React, { useMemo } from "react";
import Image from "next/image";
// import Avatar from 'react-avatar';
import { CameraIcon } from "@heroicons/react/24/outline";
import LoaderSpinner from "@/components/iconComponents/LoadingSpinner";
import { toast } from "react-toastify";
import { ipfsPublicGateway } from "@/utils/constants";
// import { uploadFileToIpfs, getImageDimensions } from "utils/helpers";
// import IconButton from 'components/Buttons/IconButton';
import { useDropzone } from "react-dropzone";
// import ImageDisplay from 'components/ImageDisplay/ImageDisplay';
import { api } from "@/utils/api";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";

type Props = {
  src?: string;
  alt: string;
  width?: string;
  widthNumber?: number;
  heightNumber?: number;
  height?: string;
  style?: React.CSSProperties;
  className?: string;
  username: string;
  editing?: boolean;
  setLoadingUpload?: (loading: boolean) => void;
  loadingUpload?: boolean;
  setImageIpfsHash?: (hash: string) => void;
  setImageUrl?: (url: string) => void;
  setAxis?: unknown;
  imageHash?: string;
  // layout?: "fill" | "fixed" | "intrinsic" | "responsive";
  fill?: boolean;
  quality?: number;
  pinnedStatus?: string;
  path?: string;
  loading?: boolean;
  type: "circle" | "squircle" | "square";
};

function AvatarImage({
  loading,
  src,
  widthNumber,
  heightNumber,
  imageHash,
  alt,
  width,
  height,
  style,
  className = "",
  username,
  editing,
  setLoadingUpload,
  loadingUpload,
  setImageIpfsHash,
  setImageUrl,
  fill,
  quality = 75,
  pinnedStatus,
  path,
  type = "squircle",
}: Props) {
  const typeClasses = {
    circle: "rounded-full",
    square: "rounded-xl",
    squircle: "mask mask-squircle",
  };
  // const [localImage, setLocalImage] = React.useState<File>();
  // const imageApi = api.pinnedFiles.createUpdateImage.useMutation();

  // const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
  //   console.log('DROPIING-______');
  //   if (!setLoadingUpload || !setImageIpfsHash || !setImageUrl) {
  //     console.log(
  //       "Can't upload image. Missing props. (setLoadingUpload, setImageIpfsHash, setImageUrl"
  //     );
  //     toast.error('There was an error uploading your image. Please try again.');
  //     return;
  //   }
  //   const imageFile = acceptedFiles.find((file) => file.type.includes('image'));
  //   console.log({ imageFile });

  //   if (imageFile) {
  //     setLocalImage(imageFile);
  //     setLoadingUpload(true);
  //     try {
  //       const data = await uploadFileToIpfs({ imageFile });
  //       const cid = data?.cid;
  //       const key = data?.key;
  //       if (cid && key) {
  //         const dimensions = await getImageDimensions(imageFile);
  //         const data = await imageApi.mutateAsync({
  //           height: dimensions.height,
  //           width: dimensions.width,
  //           ipfsHash: cid,
  //           path: key,
  //         });
  //         console.log({ data });
  //         setImageIpfsHash(cid as string);
  //         setImageUrl(`${ipfsPublicGateway}${cid}`);
  //         setLoadingUpload(false);
  //         console.log({ cid });
  //         toast.success('Your image has been successfully uploaded.');
  //       }
  //       if (!cid) {
  //         setLoadingUpload(false);
  //         toast.error(
  //           'There was an error uploading your image. Please try again.'
  //         );
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       toast.error(
  //         'There was an error uploading your image. Please try again.'
  //       );
  //       setLoadingUpload(false);
  //     }
  //   }
  // }, []);

  // const { getRootProps, getInputProps, open } = useDropzone({
  //   noClick: true,
  //   maxFiles: 1,
  //   onDrop,
  //   accept: {
  //     'image/*': [],
  //   },
  // });

  useMemo(() => {
    if (!editing) {
      // setLocalImage(undefined);
    }
  }, [editing]);

  // if (editing) {
  //   return (
  //     <div className="avatar">
  //       <div
  //         className={`relative rounded-full overflow-hidden ${className} flex justify-center align-middle text-center`}
  //         style={{
  //           width: width || 40,
  //           height: height || 40,
  //           ...style,
  //         }}
  //       >
  //         <div {...getRootProps()} className="h-full w-full">
  //           <input
  //             type="file"
  //             name="file"
  //             id="file"
  //             className="sr-only"
  //             {...getInputProps()}
  //           />
  //           {src || localImage ? (
  //             <>
  //               {localImage ? (
  //                 <>
  //                   <img
  //                     src={
  //                       (localImage && URL.createObjectURL(localImage)) || src
  //                     }
  //                     alt={alt}
  //                     className={`w-full h-full ${
  //                       loadingUpload ? 'brightness-50' : ''
  //                     } ${localImage ? 'object-cover' : ''}`}
  //                   />
  //                 </>
  //               ) : (
  //                 <ImageDisplay
  //                   width={300}
  //                   // height={300}
  //                   quality={80}
  //                   url={localImage ? URL.createObjectURL(localImage) : src}
  //                   hash={imageHash || null}
  //                   layout={layout}
  //                   className={`w-full h-full ${
  //                     loadingUpload ? 'brightness-50' : ''
  //                   } `}
  //                   // ${localImage ? 'object-cover' : ''}
  //                 />
  //               )}
  //               {/* // <Draggable axis={localImage ? 'both' : 'none'}> */}
  //             </>
  //           ) : (
  //             // </Draggable>
  //             <Avatar
  //               name={username}
  //               size={width || '40px'}
  //               round={true}
  //               className="text-center"
  //             />
  //           )}
  //           {/* {loadingUpload } */}
  //           <div className="absolute z-50 top-[40%] right-[36%]">
  //             {loadingUpload ? (
  //               <>
  //                 <LoaderSpinner className="h-10 w-10 text-base-content bg-base-100 rounded-full" />
  //               </>
  //             ) : (
  //               <IconButton
  //                 color="primary"
  //                 variant="solid"
  //                 padding="none"
  //                 size="sm"
  //                 className=" !p-2 rounded-full hover:bg-current"
  //                 onClick={open}
  //                 disabled={loadingUpload}
  //               >
  //                 <CameraIcon className="h-4 w-4 text-white" />
  //               </IconButton>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="avatar">
      <div
        className={`${typeClasses[type]} relative  overflow-hidden ${className} flex  justify-center text-center align-middle`}
        // h-10 w-10
        style={{
          width: widthNumber || 40,
          height: heightNumber || 40,
          ...style,
        }}
      >
        {loading ? (
          <div className="flex h-full w-full animate-pulse items-center justify-center bg-border-gray" />
        ) : (
          <ImageDisplay
            width={widthNumber || 300}
            height={widthNumber || 300}
            quality={quality}
            url={src || "/placeholder/cute-planet.jpg"}
            hash={imageHash || null}
            className={`bg-red-500`}
            fill={fill}
            pinnedStatus={pinnedStatus}
            path={path}
          />
        )}

        {/* {src ? (
          // <img src={src} alt={alt} className="w-full" />
          <ImageDisplay
            width={widthNumber || 300}
            height={widthNumber || 300}
            quality={quality}
            url={src}
            hash={imageHash || null}
            className={``}
            layout={layout}
            pinnedStatus={pinnedStatus}
            path={path}
          />
        ) : (
          <div>
            <div className="">
              <img src="/placeholder/cute-planet.jpg" />
            </div>

          </div>
        )} */}
      </div>
    </div>
  );
}

export default AvatarImage;
