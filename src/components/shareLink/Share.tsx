import {
  TwitterShareButton,
  TwitterIcon,
  TelegramShareButton,
  TelegramIcon,
  WhatsappShareButton,
  RedditShareButton,
  // EmailShareButton,
  FacebookShareButton,
  // FacebookMessengerShareButton,
  // FacebookMessengerIcon,
  // LinkedinShareButton,
  // PinterestShareButton,
  FacebookIcon,
  // LinkedinIcon,
  // PinterestIcon,
  // VKIcon,
  // OKIcon,
  WhatsappIcon,
  RedditIcon,
  // TumblrIcon,
  // MailruIcon,
  // EmailIcon,
  // LivejournalIcon,
  // ViberIcon,
  // WorkplaceIcon,
} from "react-share";

function Share({ url, title }: { url: string; title: string }) {
  // const [open, setOpen] = useState(false);
  // const handleShare = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };
  return (
    <>
      <div className="flex space-x-3">
        <TwitterShareButton
          title={`Check out ${title} on NiftyTunes`}
          url={url}
          via="TunesNifty"
          hashtags={["NiftyTunes", "musicnfts"]}
          // related={['NiftyTunes', 'Music NFTs']}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <TelegramShareButton
          url={url}
          title={`Check out ${title} on NiftyTunes`}
        >
          <TelegramIcon size={32} round />
        </TelegramShareButton>
        <FacebookShareButton
          url={url}
          quote={title}
          title={`Check out ${title} on NiftyTunes`}
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        {/* <FacebookMessengerShareButton
            url={url}
            appId="521270401588372"
          >
            <FacebookMessengerIcon size={32} round />
          </FacebookMessengerShareButton> */}
        <WhatsappShareButton
          url={url}
          title={`Check out ${title} on NiftyTunes`}
          separator=":: "
        >
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
        {/* <LinkedinShareButton url={url}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton> */}
        <RedditShareButton
          url={url}
          title={`Check out ${title} on NiftyTunes`}
          windowWidth={660}
          windowHeight={460}
        >
          <RedditIcon size={32} round />
        </RedditShareButton>
        {/* <PinterestShareButton
            url={String(window.location)}
            media={`${String(window.location)}/${exampleImage}`}
            className="Demo__some-network__share-button"
          >
            <PinterestIcon size={32} round />
          </PinterestShareButton> */}
      </div>
    </>
  );
}

export default Share;
