import Button from 'components/Buttons/Button';
import Typography from 'components/Typography';
// import useSongFactory from 'components/MintSongButton/useSongFactory';
import { useGenerateStep, iterate } from './MintingStepper';
import Link from 'next/link';
import { trpc } from 'utils/trpc';

import {
  createCollection,
  createCandyMachine,
  InsertItemsToCandy,
} from 'utils/metaplex';

import {
  Metaplex,
  walletAdapterIdentity,
  WalletAdapterIdentityDriver,
  toBigNumber,
  sol,
  toDateTime,
  WalletAdapter,
  PublicKey,
  CandyMachine,
} from '@metaplex-foundation/js';

const useCreateCandyMachineStep = ({
  metadata,
  editionCount,
  symbol,
  mp,
  publicKey,
  jsonIpfsHash,
  endTime,
}: {
  metadata: any;
  mp: Metaplex;
  publicKey: PublicKey;
  editionCount: number;
  symbol: string;
  jsonIpfsHash: string;
  endTime: Date;
}) => {
  const CreateCandyMachine = useGenerateStep({
    stepTitle: 'Creating Candy Machine',
    stepDescription: 'Creating Candy Machine to populate with NFTs',
    callFunction: async ({ mintAddress, jsonIpfsHash }) => {
      try {
        const candyMachine = await mp.candyMachines().create({
          itemsAvailable: toBigNumber(editionCount),
          sellerFeeBasisPoints: 333, // 3.33%
          symbol: symbol,
          collection: {
            address: mintAddress,
            updateAuthority: mp.identity(),
          },

          // creators: [
          //   {
          //     address: publicKey,
          //     share: 100,
          //   },
          // ],
          authority: mp.identity(),
          // withoutCandyGuard: false,
          itemSettings: {
            type: 'configLines',
            prefixName: `${metadata.name} #$ID+1$`,
            nameLength: metadata.name.length + 5, // number of characters in the name
            prefixUri: '', //'https://nft-test.free.beeceptor.com/great-collection/', //`
            uriLength: `//ipfs/${jsonIpfsHash}`.length, // number of characters in the uri
            isSequential: false,
          },
          guards: {
            solPayment: {
              amount: sol(0.2),
              destination: publicKey, //or treasury
            },
            startDate: {
              date: toDateTime(new Date(metadata.originalReleaseDate)),
            },
            endDate: {
              // start date plus 1 year
              date: toDateTime(new Date(endTime)),
            },
          },
          groups: [
            {
              label: 'early',
              guards: {
                redeemedAmount: { maximum: toBigNumber(4) },
                solPayment: {
                  amount: sol(0.1),
                  destination: publicKey,
                },
              },
            },
            {
              label: 'late',
              guards: {
                solPayment: {
                  amount: sol(0.5),
                  destination: publicKey,
                },
              },
            },
          ],
        });

        // const result = await createMachineMutation.mutateAsync({
        //   candyMachineId: candyMachine.candyMachine.address?.toBase58(),
        //   creatorWalletAddress: publicKey.toBase58(),
        //   startDate: new Date(metadata.originalReleaseDate),
        //   endDate: new Date(endTime),
        //   slug: '',
        // });
        // return {
        //   candyMachine: candyMachine.candyMachine,
        //   machineDB: result,
        //   address: candyMachine.candyMachine.address,
        //   mp,
        //   metadata,
        //   jsonIpfsHash,
        //   publicKey,
        // };
        return null;
      } catch (e) {
        throw e;
      }
    },

    SuccessUI: () => {
      return (
        <>
          <Typography variant="body1" className="mb-4 ml-7 !text-secondary">
            CandyMachine created!
          </Typography>
        </>
      );
    },
    ErrorUI: ({ res }: { res: any }) => {
      const { steps } = res?.successErrorParams;
      return (
        <>
          <Typography variant="body1" className=" ml-7 !text-warning">
            Failed to create CandyMachine
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

  return CreateCandyMachine;
};

export default useCreateCandyMachineStep;
