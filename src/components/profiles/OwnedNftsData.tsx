// import MarginLayout from "@/components/layouts/MarginLayout";
// import Typography from "@/components/typography";
// import { api } from "@/utils/api";
// import TrackItem from "@/components/track/TrackItem";
// import PlaylistCard from "@/components/playlist/PlaylistCard";
// import { routes } from "@/utils/constants";
// import Link from "next/link";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { type Nft, PublicKey } from "@metaplex-foundation/js";
import type {
  FindNftsByOwnerOutput,
  JsonMetadata,
} from "@metaplex-foundation/js";
import { useMemo, useState } from "react";
import TokenCard from "../tokens/TokenCard";
import { niftyIpfsGateway } from "@/utils/constants";

type Props = {
  walletAddress: string | undefined;
};

function OwnedNftsData({ walletAddress }: Props) {
  const { metaplex } = useMetaplex();
  const [ownedNfts, setOwnedNfts] = useState<FindNftsByOwnerOutput>(); //<FindNftsByOwnerOutput[]>
  const getNfts = async () => {
    try {
      if (!walletAddress) return;

      const owned = await metaplex?.nfts().findAllByOwner({
        owner: new PublicKey(walletAddress),
      });

      const nftData = owned?.filter((f) => f.collection?.verified);
      console.log({ nftData, amount: nftData?.length });
      const newArray = [] as FindNftsByOwnerOutput;
      if (!nftData) return;
      if (nftData?.length > 0) {
        for (const item of nftData) {
          // console.log({ item, address: item.address.toBase58() });
          const ipfsHash = item.uri.split("ipfs/").pop();
          let newUri = item.uri;
          if (!ipfsHash?.includes("http") && ipfsHash) {
            newUri = niftyIpfsGateway + ipfsHash;
          }

          // console.log({ newUri });

          // console.log({ ipfsHash });
          const data = (await (await fetch(newUri)).json()) as JsonMetadata;
          // console.log({ data });
          // const data = //await result.json();
          //

          const filtered = data.properties?.files?.filter((f) =>
            f?.type?.includes("audio")
          );

          console.log({ filtered });
          //  === 'audio/mp3'
          if (
            (data.properties?.category === "audio" ||
              (filtered && filtered?.length > 0)) &&
            item.primarySaleHappened
          ) {
            const nftIndex = newArray.findIndex(function (n) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              return n.mintAddress?.toBase58() === item.mintAddress?.toBase58();
            });
            // console.log({ nftIndex, ownedNfts, newArray });
            if (nftIndex === -1) {
              newArray.push({ ...item, json: data });
            }
            if (nftIndex > -1) {
              newArray[nftIndex] = { ...item, json: data };
            }
          }
        }
        console.log("--done---");
        console.log({ newArray });

        // setOwnedNftsLoading(false);
        setOwnedNfts(newArray);
        // console.log({ newArray });
      } else {
        // setOwnedNftsLoading(false);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  useMemo(() => {
    if (walletAddress) {
      void getNfts();
    }
  }, [walletAddress]);

  // if (isLoading)
  //   return (
  //     <MarginLayout>
  //       <div className=" h-4 w-32 animate-pulse bg-slate-500/30" />
  //       <div className="mt-6 grid grid-cols-1 sm:grid-cols-2">
  //         {TrackItem.loader}
  //         {TrackItem.loader}
  //         {TrackItem.loader}
  //         {TrackItem.loader}
  //       </div>
  //     </MarginLayout>
  //   );

  return (
    <>
      {ownedNfts &&
        ownedNfts?.length > 0 &&
        ownedNfts.map((nft) => (
          <TokenCard key={nft.address.toBase58()} nft={nft as Nft} />
        ))}
    </>
  );
}

export default OwnedNftsData;
