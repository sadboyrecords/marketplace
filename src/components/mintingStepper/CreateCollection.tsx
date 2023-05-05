import Button from 'components/Buttons/Button';
import Typography from 'components/Typography';
// import useSongFactory from 'components/MintSongButton/useSongFactory';
import { useGenerateStep, iterate } from './MintingStepper';
import Link from 'next/link';

import {
  createCollection,
  createCandyMachine,
  InsertItemsToCandy,
} from 'utils/metaplex';
import { Metaplex, PublicKey } from '@metaplex-foundation/js';

const useCreateCollectionStep = ({
  metadata,
  mp,
  publicKey,
}: {
  metadata: any;
  mp: Metaplex;
  publicKey: PublicKey;
}) => {
  const CreateCollection = useGenerateStep({
    stepTitle: 'Creating Collection',
    stepDescription: 'Creating Collection to populate Candy Machine',
    callFunction: async ({ jsonIpfsHash }) => {
      try {
        const result = await createCollection({
          name: metadata.name,
          metaplex: mp,
          uri: `//ipfs/${jsonIpfsHash}`,
          sellerFeeBasisPoints: 250,
          creators: [
            {
              address: publicKey,
              share: 100,
            },
          ],
        } as any);
        return {
          collection: result,
          mintAddress: result.mintAddress,
          jsonIpfsHash,
          mp,
          metadata,
          publicKey,
        };
      } catch (e) {
        console.log({ e });
        // throw e;
      }
    },

    SuccessUI: () => {
      return (
        <>
          <Typography variant="body1" className="mb-4 ml-7 !text-secondary">
            Collection created!
          </Typography>
        </>
      );
    },
    ErrorUI: ({ res }: { res: any }) => {
      const { steps } = res?.successErrorParams;
      return (
        <>
          <Typography variant="body1" className=" ml-7 !text-warning">
            Failed to create collection
          </Typography>
          <Button
            variant="accent"
            className="ml-7 h-10 text-accent !border-none !bg-transparent"
            onClick={() => {
              try {
                iterate(steps);
              } catch (e) {
                console.log(e);
              }
            }}
          >
            Retry
          </Button>
        </>
      );
    },
  });

  return CreateCollection;
};

export default useCreateCollectionStep;
