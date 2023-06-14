/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
  SongType,
  CanPlayType,
  TransactionRecordType,
} from "@/utils/types";

export const getSupporters = (
  transactions: TransactionRecordType[]
): ISupporters | undefined | null => {
  const supporters = transactions?.reduce((acc, curr) => {
    const { receiverWalletAddress } = curr;
    // @ts-ignore
    if (!acc[receiverWalletAddress as string]) {
      // @ts-ignore
      acc[receiverWalletAddress] = [];
    }
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    acc[receiverWalletAddress].push({
      walletAddress:
        curr?.receiver?.magicSolanaAddress || curr?.receiverWalletAddress,
      tokenAddress: curr?.tokenAddressReferenceOnly,
      user: curr?.receiver,
    });
    return acc as ISupporters[];
  }, {});
  if (!supporters || Object.entries(supporters).length === 0) return null;
  const sortedData = Object.entries(supporters).sort(
    // @ts-ignore
    (a, b) => b?.[1]?.length - a?.[1]?.length
  );
  const sortedObject = Object.fromEntries(sortedData);
  const sortedArray = sortedData.reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  );
  // const sortedArray = sortedData.map(([key, value]) => ({ [key]: value }));
  // console.log({ sortedData, sortedObject, sortedArray });
  // @ts-ignore
  return sortedArray;
};
export const handleCanPlay = ({
  activeBattles,
  song,
  publicAddress,
}: {
  activeBattles?: CanPlayType;
  song: SongType;
  publicAddress?: string;
}) => {
  let canPlay = true;
  let supporters: ISupporters | undefined;
  let artistName: string | undefined = "";
  let collectionName: string | undefined = "";
  let candyId: string | undefined;
  let competitorCandyId: string | undefined;
  let battleIndex = 0;
  if (activeBattles) {
    activeBattles.forEach((b, index) => {
      b.battleContestants.forEach((bc) => {
        if (bc.candyMachineDraft?.drop?.song?.id === song?.id) {
          console.log(" CHecking song");
          const found = bc.candyMachineDraft?.drop?.transactions?.find(
            (t) => t?.receiver?.walletAddress === publicAddress
          );
          // @ts-ignore
          // supporters = bc.candyMachineDraft?.drop?.transactions?.reduce(
          //   (acc, curr) => {
          //     const { receiverWalletAddress } = curr;
          //     // @ts-ignore
          //     if (!acc[receiverWalletAddress as string]) {
          //       // @ts-ignore
          //       acc[receiverWalletAddress] = [];
          //     }
          //     // @ts-ignore
          //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          //     acc[receiverWalletAddress].push({
          //       walletAddress: curr?.receiverWalletAddress,
          //       tokenAddress: curr?.tokenAddressReferenceOnly,
          //       user: curr?.receiver,
          //     });
          //     return acc as ISupporters[];
          //   },
          //   {}
          // );
          supporters = getSupporters(bc.candyMachineDraft?.drop?.transactions);
          if (!found) {
            canPlay = false;
            artistName = bc.primaryArtistName;
            collectionName = bc.candyMachineDraft?.drop?.dropName;
            candyId = bc.candyMachineDraft?.drop?.candyMachineId;
            battleIndex = index;
          }
        }
      });
    });
    // const canPlay = activeBattles.some((battle) =>
    //   battle.songs.some((battleSong) => battleSong.id === song.id)
    // );

    // return canPlay;
  }
  if (candyId && activeBattles) {
    const comp = activeBattles[battleIndex]?.battleContestants.find(
      (bc) => bc.candyMachineDraft?.drop?.candyMachineId !== candyId
    );
    competitorCandyId = comp?.candyMachineDraft?.drop?.candyMachineId;
  }

  return {
    canPlay,
    supporters,
    artistName,
    collectionName,
    candyId,
    competitorCandyId,
  };
};
