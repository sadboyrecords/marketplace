import { ipfsUrl, myImageLoader } from "@/utils/helpers";
import Image from "next/image";

interface PropsTypes {
  url?: string;
  hash: string | null;
  quality: number;
  width: number;
  height?: number;
  className?: string;
  alt?: string;
  imgTagClassName?: string;
  // layout?: "fixed" | "intrinsic" | "responsive" | "fill";
  path?: string;
  pinnedStatus?: string;
  fill?: boolean;
  resizeWidth?: number;
  sizes?: string;
  publicImage?: boolean;
}

export default function ImageDisplay({
  url,
  hash,
  quality = 50,
  width,
  height,
  className,
  alt,
  imgTagClassName,
  // layout = "fixed",
  fill,
  path,
  pinnedStatus,
  resizeWidth,
  sizes,
  publicImage,
}: PropsTypes) {
  // console.log({ url, hash });
  // console.log({ url, hash, pinnedStatus, path });
  // const hashedUrl = ipfsUrl(hash, quality);
  // console.log({ hash, url });
  // console.log({ hashedUrl });

  // const handleImage = async () => {
  //   if (!path) {
  //     const imageUrl = await sharp(url).resize(100, 100).webp().toBuffer();
  //     const newSource = URL.createObjectURL(
  //       new Blob([imageUrl], { type: 'image/webp' })
  //     );
  //     console.log({ newSource });
  //   }
  // };
  // useMemo(() => {
  //   handleImage();
  // }, [url]);
  // console.log({ width, height });
  return (
    <>
      {/* <div className="h-full w-full relative "> */}
      {publicImage || hash || (path && pinnedStatus) ? (
        <>
          <Image
            //   className="w-full md:w-72 block rounded-md "
            className={className}
            src={
              ipfsUrl(
                hash,
                path,
                pinnedStatus
                // quality,
                // resizeWidth || width,
                // height
              ) ||
              url ||
              "/placeholder/music_placeholder.png"
            }
            width={fill ? undefined : width}
            height={fill ? undefined : height || width}
            // blurDataURL={
            //   ipfsUrl(hash, 5) || '/placeholder/music_placeholder.png'
            // }
            blurDataURL={"/placeholder/music_placeholder.png"}
            alt={alt || "image"}
            quality={quality}
            priority
            fill={fill}
            sizes={
              fill
                ? sizes ||
                  "(max-width: 640px) 90vw, (max-width: 800px) 60vw, (max-width: 800px) 50vw, (max-width: 1200px) 40vw, 30vw"
                : undefined
            }
            //   layout="responsive"
            // layout={layout}
            loader={
              pinnedStatus && pinnedStatus === "PINNED"
                ? myImageLoader
                : undefined
            }

            // loading
          />
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={imgTagClassName}
            src={url || "/placeholder/music_placeholder.png"}
            alt="music"
          />
        </>
      )}
      {/* </div> */}
    </>
  );
}
