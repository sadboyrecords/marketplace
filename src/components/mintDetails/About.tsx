import Typography from "@/components/typography";
// import { externalUrls } from 'utils/constants';
import type {
  Sft,
  SftWithToken,
  Nft,
  NftWithToken,
} from "@metaplex-foundation/js";

interface MintDescriptionProps {
  nftDetails?: Sft | SftWithToken | Nft | NftWithToken;
}

function About({ nftDetails }: MintDescriptionProps) {
  return (
    <div
      tabIndex={1}
      className="collapse-arrow collapse rounded-lg border-2 border-base-300"
    >
      <Typography size="display-xs" className="collapse-title bg-base-300">
        About {nftDetails?.name}
      </Typography>
      <div className="collapse-content">
        <div tabIndex={0}>
          <Typography type="div">
            <div
              dangerouslySetInnerHTML={{
                __html: nftDetails?.json?.description || "",
              }}
            />
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default About;
