import Button from 'components/Buttons/Button';
import Typography from 'components/Typography';
// import useSongFactory from 'components/MintSongButton/useSongFactory';
import { useGenerateStep, iterate } from './MintingStepper';

import { Metaplex, PublicKey } from '@metaplex-foundation/js';

const useInsertItems = ({
  metadata,
  mp,
  publicKey,
  symbol,
  editionCount,
}: {
  metadata: any;
  mp: Metaplex;
  publicKey: PublicKey;
  symbol: string;
  editionCount: number;
}) => {
  const InsertItems = useGenerateStep({
    stepTitle: 'Creating NFTs',
    stepDescription: 'Creating NFTs to populate Candy Machine',
    callFunction: async ({ candyMachine, address, jsonIpfsHash }) => {
      try {
        const candyAddress = candyMachine.address;
        const cm = await mp.candyMachines().findByAddress({
          address: candyAddress,
        });
        console.log('candy machine', candyMachine);
        const items = await mp.candyMachines().insertItems({
          candyMachine: cm,

          items: Array.from({ length: editionCount }, (_, i) => ({
            name: '',
            uri: `https://reamp.mypinata.cloud/ipfs/${jsonIpfsHash}`,
          })),
        });
        return {
          items,
          mp,
          metadata,
          publicKey,
        };
      } catch (e) {
        throw e;
      }
    },

    SuccessUI: () => {
      return (
        <>
          <Typography variant="body1" className="mb-4 ml-7 !text-secondary">
            Items Created!
          </Typography>
        </>
      );
    },
    ErrorUI: ({ res }: { res: any }) => {
      const { steps } = res?.successErrorParams;
      return (
        <>
          <Typography variant="body1" className=" ml-7 !text-warning">
            Failed to create items
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

  return InsertItems;
};

export default useInsertItems;
