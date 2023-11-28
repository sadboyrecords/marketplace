import Typography from "@/components/typography";
import { externalUrls } from "@/utils/constants";
import type {
  Sft,
  SftWithToken,
  Nft,
  NftWithToken,
} from "@metaplex-foundation/js";
import SongCredits from "@/components/songCredits";
import { returnFullCredits } from "@/utils/helpers";
import React from "react";
import { type IMetadata, type IFullCredits } from "@/utils/types";

interface MintDescriptionProps {
  mintAddress?: string;
  nftDetails?: Sft | SftWithToken | Nft | NftWithToken;
  tokenAccountAddress?: string;
  ownerAddress?: string;
}

function MintDescription({
  mintAddress,
  nftDetails,
  ownerAddress,
  tokenAccountAddress,
}: MintDescriptionProps) {
  const [credits, setCredits] = React.useState<IFullCredits[] | undefined>(
    undefined
  );
  const [metaData, setMetaData] = React.useState<IMetadata | undefined>();
  React.useEffect(() => {
    console.log("ss----- descrioption ssss", { nftDetails });
    const data = nftDetails?.json as IMetadata | undefined;

    setMetaData(data);
    if (!data?.credits) return;
    const fullCredits = returnFullCredits(data?.credits);
    console.log({ fullCredits });
    setCredits(fullCredits);
  }, [mintAddress, nftDetails]);
  return (
    <div
      tabIndex={1}
      className="collapse collapse-open collapse-arrow rounded-lg border-2 border-base-300 bg-base-100"
    >
      <Typography size="display-xs" className="collapse-title bg-base-300">
        Description
      </Typography>
      <div className="collapse-content">
        <div tabIndex={1}>
          <div className="my-4 grid grid-cols-2 justify-between gap-2  px-2 align-top ">
            <div className="flex flex-col gap-2 ">
              <Typography>Mint Address</Typography>
              {nftDetails?.collection && (
                <Typography>On Chain Collection</Typography>
              )}

              <Typography>Token Address</Typography>
              <Typography>Owner</Typography>
              {/* <Typography>Royalties</Typography> */}
              {/* fees depends on if its primary or secondary sales */}
              {/* <Typography>Fees</Typography>
              <Typography>Artists</Typography>
              <Typography>Songwriters</Typography>
              <Typography>Producers</Typography> */}
              {/* <Typography  >Labels</Typography>
              <Typography  >Distributors</Typography> */}
            </div>
            {/* flex flex-col */}
            <div className="flex flex-col items-end gap-2">
              <a
                target={"_blank"}
                href={externalUrls.solscanTokenDetails(mintAddress as string)}
              >
                <Typography>
                  <span>
                    {nftDetails?.mint?.address?.toBase58().substring(0, 5)}
                  </span>
                  <span>...</span>
                  <span>{nftDetails?.mint?.address?.toBase58().slice(-3)}</span>
                </Typography>
              </a>
              {nftDetails?.collection && (
                <a
                  target={"_blank"}
                  href={externalUrls.solscanTokenDetails(
                    nftDetails?.collection?.address?.toBase58()
                  )}
                >
                  <Typography>
                    <span>
                      {nftDetails?.collection?.address
                        ?.toBase58()
                        .substring(0, 5)}
                    </span>
                    <span>...</span>
                    <span>
                      {nftDetails?.collection?.address?.toBase58().slice(-3)}
                    </span>
                  </Typography>
                </a>
              )}
              {tokenAccountAddress ? (
                <a
                  target={"_blank"}
                  href={externalUrls.solscanAccountDetails(tokenAccountAddress)}
                >
                  <Typography>
                    <span>{tokenAccountAddress?.substring(0, 5)}</span>
                    <span>...</span>
                    <span>{tokenAccountAddress?.slice(-3)}</span>
                  </Typography>
                </a>
              ) : (
                <Typography>N/A</Typography>
              )}
              {tokenAccountAddress ? (
                <a
                  target={"_blank"}
                  href={externalUrls.solscanAccountDetails(ownerAddress || "")}
                >
                  <Typography>
                    <span>{ownerAddress?.substring(0, 5)}</span>
                    <span>...</span>
                    <span>{ownerAddress?.slice(-3)}</span>
                  </Typography>
                </a>
              ) : (
                <Typography>N/A</Typography>
              )}
              {/* {nftDetails?.sellerFeeBasisPoints ? (
                <Typography>
                  {nftDetails?.sellerFeeBasisPoints &&
                    nftDetails?.sellerFeeBasisPoints / 100}
                  %
                </Typography>
              ) : (
                <Typography>N/A</Typography>
              )} */}
            </div>
            <div className="mt-4">
              <SongCredits
                credits={credits}
                pLine={metaData?.pline}
                cLine={metaData?.cline}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MintDescription;
