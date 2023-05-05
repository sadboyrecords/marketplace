import Button from 'components/Buttons/Button';
import Typography from 'components/Typography';
// import useSongFactory from 'components/MintSongButton/useSongFactory';
import { useGenerateStep, iterate } from './MintingStepper';
import Link from 'next/link';
import { UploadJsonToPinata } from 'utils/ipfsUpload';

const useUploadStep = ({ metadata }: { metadata: any }) => {
  const UploadStep = useGenerateStep({
    stepTitle: 'Upload to IPFS',
    stepDescription: 'blah',
    callFunction: async () => {
      const jsonIpfsHash = await UploadJsonToPinata(metadata);
      return {
        jsonIpfsHash,
        metadata,
      };
    },

    SuccessUI: () => {
      return (
        <>
          <Typography variant="body1" className="mb-4 ml-7 !text-secondary">
            Uploaded to IPFS!
          </Typography>
        </>
      );
    },
    ErrorUI: ({ res }: { res: any }) => {
      return (
        <>
          <Typography variant="body1" className="mb-4 ml-7 !text-warning">
            Failed to upload to IPFS
          </Typography>
        </>
      );
    },
  });

  return UploadStep;
};

export default useUploadStep;
