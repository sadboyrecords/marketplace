import React, { useEffect, useState, useContext, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Share } from "@/components/iconComponents";
import Icon from "@/components/icons";
import Link from "next/link";
// import TokenActivity from '@/components/TokenActivity';
import { api } from "@/utils/api";
// import TokenLikes from '@/components/TokenLikes';
import Typography from "@/components/typography";
import { routes } from "@/utils/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import ShareLink from "@/components/shareLink/Share";
import ModalContainer from "@/components/modalContainer/ModalContainer";
import Button from "@/components/buttons/Button";
// import TokenSaleCard from '@/components/TokenSaleCard';
// import { type Metaplex } from "@metaplex-foundation/js";
import type {
  Sft,
  SftWithToken,
  Nft,
  NftWithToken,
} from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import MintDescription from "@/components/mintDetails/MintDescription";
import About from "@/components/mintDetails/About";
import {
  getNftOwner,
  getNftTransactions,
  getSolUsdPrice,
} from "@/utils/rpcCalls";
import Notification from "@/components/alertsNotifications/Notification";
import Avatar from "@/components/avatar/Avatar";
// import { PlayerContext } from "@/components/Player/Provider";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { getHashAndUriFromNFT } from "@/utils/helpers";
import PlayButton from "@/components/likes-plays/PlayButton";
import type { IMetaplexMetadata, PartialSongType } from "@/utils/types";
import GeneralLikes from "@/components/likes-plays/GeneralLikes";

function TokenProfilePage() {
  const wallet = useWallet();
  // const connection = new Connection(
  //   clusterApiUrl(process.env.NEXT_PUBLIC_SOLANA_NETWORK as any)
  // );
  // const { connection } = useConnection();
  // const metaplex = new Metaplex(connection).use(walletAdapterIdentity(wallet));
  const { metaplex } = useMetaplex();
  const { publicKey: loggedInUserKey } = wallet;

  // const { currentToken, isPlaying, handlePlayPause } =
  //   useContext(PlayerContext);
  // const { mintAddress } = props as any;
  const router = useRouter();
  const mintAddress = router.query.mintAddress as string;

  // const activeListing = api.listing.getActiveTokenListing.useQuery({
  //   mintAddress: mintAddress as any as string,
  // });

  // const { isLoading: isLoadingListing, data: listing } = activeListing;

  // const track = tokenQuery.data;
  // const artist = track?.rawArtists;

  const [nftDetails, setNftDetails] = useState<
    Sft | SftWithToken | Nft | NftWithToken
  >();
  const [nftDetailsError, setSetNftDetailsError] = useState<boolean>(false);
  const [creators, setCreators] = useState<string[]>([]);
  const [nftOwner, setNftOwner] = useState<string>();
  const [tokenAccountAddress, setTokenAccountAddress] = useState<string>();
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [songHash, setSongHash] = useState<{
    imageHash: string | undefined;
    audioHash: string | undefined;
    imageUrl: string | undefined;
    audioUrl: string | undefined;
  }>();

  // api.token.findOrCreateNft.useQuery(
  //   {
  //     mintAddress: mintAddress as any as string,
  //     nft: nftDetails,
  //   },
  //   {
  //     enabled: !!nftDetails,
  //   }
  // );
  const getDetails = api.token.getNftDetails.useQuery(
    {
      mintAddress: mintAddress,
      nft: nftDetails,
    },
    {
      enabled: !!nftDetails,
    }
  );
  console.log({ getDetails });
  const indexNft = async () => {
    try {
      console.log("indexing ");
      const data = await fetch("/api/notify-indexer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.QSTASH_TOKEN }`,
        },
        body: JSON.stringify({
          nftData: nftDetails,
        }),
        // body: JSON.stringify({
        //   mintAddress: mintAddress as any as string,
        //   nft: nftDetails,
        // }),
      });
      await data.json();
      // console.log({ res });
    } catch (error) {
      console.log({ error });
    }
  };
  useMemo(() => {
    if (!getDetails.isLoading && !getDetails.data) {
      // const data = f
      void indexNft();
    }
  }, [getDetails.isLoading, getDetails.data]);
  const songQuery = api.songs.getSongsByUriHash.useQuery(
    {
      hash: songHash?.audioHash,
      uri: songHash?.audioUrl,
    },
    {
      enabled: !!songHash,
    }
  );
  // console.log({ data });
  // const songQuery = null;

  // console.log({ tokenQuery, songQuery });

  const handleShare = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getNftDetails = async ({ mintAddress }: { mintAddress: string }) => {
    // connection.getAccountInfo
    if (!metaplex) return;
    try {
      const token = await metaplex?.nfts().findByMint({
        mintAddress: new PublicKey(mintAddress),
        loadJsonMetadata: true,
      });
      // console.log('token', token);
      setNftDetails(token);
      setCreators(
        token?.creators.filter((c) => c.share).map((c) => c.address?.toBase58())
      );
      setCurrentUrl(window && window?.location.href);
      const data = getHashAndUriFromNFT(token);
      console.log({ data });
      setSongHash(data);

      return token;
      // console.log({ data });

      // `https://public-api.solscan.io/token/holders?tokenAddress=${address}&limit=10&offset=0&cluser=devnet`

      // const resholders = await fetch(
      //   `https://api.solscan.io/token/holders?tokenAddress=${address}&limit=10&offset=0&cluser=devnet`
      // );

      // const holders = await resholders.json();

      // const accountInfo = await connection.getTokenLargestAccounts(
      //   new PublicKey('Dz8Lf6zTw7UyoeFzzSNpXmvC12p6to6EVF5LK6v96wqj')
      // );
      // console.log({
      //   accountInfo,
      //   owner: accountInfo.value[0]?.address?.toBase58(),
      //   // owner: accountInfo?.value?.owner?.toBase58(),
      //   // owner: accountInfo?.owner.toBase58(),
      //   // data: accountInfo?.data.buffer,
      // });
    } catch (error) {
      console.log({ error });
      setSetNftDetailsError(true);
      return;
    }
  };

  const handleGetOwner = async (addy: string) => {
    try {
      // const res = await fetch(
      //   `https://public-api.solscan.io/token/holders?tokenAddress=${addy}&limit=10&offset=0&cluser=devnet`
      // );
      // const data = await res.json();
      const t = await getNftOwner(addy);
      if (!t) setIsCheckingOwner(false);
      setNftOwner(t?.owner as string);
      setTokenAccountAddress(t?.tokenAccountAddress);
    } catch (error) {
      console.log({ error });
    }
  };

  const handleGetNftTransactions = async (mintAddress: string) => {
    try {
      const transactions = await getNftTransactions(mintAddress);
    } catch (error) {
      console.log({ error });
    }
  };

  const handleGetPrice = async () => {
    try {
      const pricing = await getSolUsdPrice();
      // console.log({ pricing });
    } catch (error) {}
  };

  const handleRefresh = async () => {
    await getNftDetails({ mintAddress: mintAddress });
    return;
  };

  // console.log({
  //   nftDetails,
  //   creators: nftDetails?.creators.filter((c) => c?.share > 0),
  // });
  // useEffect(() => {
  //   if (mintAddress) {
  //     console.log('MIT ADDRESS CHANGED');
  //     handleGetOwner(mintAddress as string);
  //     handleGetNftTransactions(mintAddress as string);
  //     handleGetPrice();
  //     if (!nftOwner || !tokenAccountAddress) {
  //       setIsCheckingOwner(true);
  //     }
  //   }
  // }, [mintAddress]);

  useMemo(() => {
    if (nftOwner) {
      setIsOwner(nftOwner === loggedInUserKey?.toBase58());
      setIsCheckingOwner(false);
    }
  }, [nftOwner, loggedInUserKey]);

  useMemo(() => {
    if (mintAddress) {
      void getNftDetails({ mintAddress: mintAddress });
      console.log("MIT ADDRESS CHANGED");
      void handleGetOwner(mintAddress);
      void handleGetNftTransactions(mintAddress);
      void handleGetPrice();
      if (!nftOwner || !tokenAccountAddress) {
        setIsCheckingOwner(true);
      }
    }
  }, [mintAddress]);

  console.log({ nftDetails, songData: songQuery.data });

  return (
    <>
      <div className="">
        <ModalContainer
          open={open}
          title={"Share this NFT"}
          handleCancel={handleClose}
        >
          <ShareLink url={currentUrl || ""} title={nftDetails?.name || ""} />
        </ModalContainer>
        {nftDetailsError && (
          <div className="mb-8">
            <Notification
              type="error"
              secondaryMessage="There was an error getting this token. Please make sure you have the correct address"
            />
          </div>
        )}
        <div className="z-0 flex  w-full max-w-[80rem] flex-col space-y-10 lg:max-w-[80rem]  lg:flex-row lg:space-x-6">
          <div className=" md:self-center lg:flex-1 lg:self-start  ">
            <div className="h-full w-full overflow-hidden md:h-[80vw] md:max-h-[700px] md:w-[80vw] md:max-w-[700px] lg:h-full  lg:w-full">
              {nftDetails && (
                <>
                  <ImageDisplay
                    url={nftDetails?.json?.image}
                    hash={null}
                    width={300}
                    quality={90}
                    alt={nftDetails?.name || "nft"}
                    className="rounded-box transition-shadow duration-300 hover:opacity-75 hover:shadow-xl"
                    imgTagClassName="w-full block rounded-xl"
                  />
                </>
              )}
              {!nftDetails && !nftDetailsError && (
                <div className="h-full w-full animate-pulse rounded-lg bg-slate-400 lg:h-[500px] lg:w-[500px]"></div>
              )}
            </div>
          </div>
          <div className="space-y-8 lg:flex-1">
            {nftDetails && (
              <div className="flex flex-row justify-start gap-2 align-top">
                <div>
                  <PlayButton
                    song={
                      songQuery?.data ||
                      ({
                        id: songHash?.audioUrl,
                        lossyAudioURL: songHash?.audioUrl,
                        lossyArtworkURL: songHash?.imageUrl,
                        title: nftDetails?.name,
                        creators: nftDetails?.creators.map((c) => ({
                          walletAddress: c?.address.toBase58(),
                        })),
                      } as PartialSongType)
                    }
                  />
                </div>

                <div>
                  <Typography size="display-xs">{nftDetails?.name}</Typography>

                  {/* <Typography
                  variant="h6"
                  color="primary"
                  className=" font-normal"
                > */}
                  <div className="avatar-group -space-x-4">
                    {creators?.map((creator) => (
                      <Link href={routes.userProfile(creator)} key={creator}>
                        <Avatar
                          username={creator}
                          alt={creator}
                          className="cursor-pointer"
                        />
                      </Link>
                    ))}
                  </div>

                  {/* </Typography> */}
                  <div className="mb-4 mt-4 flex flex-row items-center space-x-5 align-middle">
                    {/* <TokenLikes
                      padding="none"
                      track={songQuery?.data}
                      isPrimary={false}
                      sideView
                    /> */}
                    {songQuery?.data && (
                      <GeneralLikes songId={songQuery?.data.id} />
                    )}

                    <button onClick={handleShare} className="flex space-x-3">
                      <Share />
                      <Typography size="body-sm">Share</Typography>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* 
            <div>
              {(isLoadingListing || isCheckingOwner) && !nftDetailsError && (
                <div className="space-y-8">
                  <div className=" h-24 w-full animate-pulse rounded-lg bg-slate-400"></div>
                  <div className=" h-24 w-full animate-pulse rounded-lg bg-slate-400"></div>
                  <div className=" h-48 w-full animate-pulse rounded-lg bg-slate-400"></div>
                </div>
              )}
              {nftDetails && nftDetails.primarySaleHappened && (
                <>
                  {((!listing && isOwner && !isCheckingOwner) ||
                    (listing && !isCheckingOwner)) && (
                    <TokenSaleCard
                      metaplex={metaplex as Metaplex}
                      mintAddress={mintAddress as any as string}
                      loggedInUserKey={loggedInUserKey as any as string}
                      isOwner={isOwner}
                      listing={listing}
                      refresh={handleRefresh}
                    />
                  )}
                </>
              )}
            </div> */}
            {/*  */}
            {nftDetails && (
              <>
                <About nftDetails={nftDetails} />
                <MintDescription
                  mintAddress={mintAddress}
                  nftDetails={nftDetails}
                  ownerAddress={nftOwner}
                  tokenAccountAddress={tokenAccountAddress}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* <TokenActivity activityArray={MOCK_TOKEN_ACTIVITY} /> */}
    </>
  );
}

// export const getStaticPaths = async () => {
//   // TODO: get all token ids
//   const data = await prisma?.rawProcessedTracks?.findMany({
//     where: {
//       id: {
//         startsWith: 'solana',
//       },
//     },
//   });

//   const paths = data?.map((track) => ({
//     params: { contractAddress: track?.platformInternalId },
//   }));

//   return {
//     paths,
//     fallback: 'blocking',
//   };
// };

// export const getStaticProps = async ({ params }: any) => {
//   const { mintAddress } = params;
//   console.log({ mintAddress });
//   // const ssg = await createSSGHelpers({
//   //   router: appRouter,
//   //   ctx: prisma as any,
//   //   transformer: superjson,
//   // });

//   // await ssg.fetchQuery('token.getNftDetails', {
//   //   mintAddress,
//   // });

//   return {
//     props: {
//       // apiState: ssg.dehydrate(),
//       mintAddress,
//     },
//     revalidate: 10,
//   };
// };

export default TokenProfilePage;
