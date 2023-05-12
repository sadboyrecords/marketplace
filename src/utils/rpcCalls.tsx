import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const network =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || WalletAdapterNetwork.Devnet;

export const customRpc =
  "https://green-aged-meadow.solana-mainnet.discover.quiknode.pro/dffa42853163d5021878db504cc05722eca00092/";
// const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);

export const quickNode_dev =
  "https://intensive-green-pallet.solana-devnet.discover.quiknode.pro/1f0149b4235d3f6e9a39b428ad8b9df6db1650b6/";
// let connection = new Connection(clusterApiUrl('devnet'));
// let connection = new Connection(quickNode_dev);
// if (env === 'prod') {
//   connection = new Connection(customRpc);
// }
const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_HOST ||
    clusterApiUrl(network as WalletAdapterNetwork)
);

export const getTokenLargestAccounts = async (mintAddress: string) => {
  const response = await connection.getTokenLargestAccounts(
    new PublicKey(mintAddress)
  );
  //   returns token account addresses  with the largest balances
  return response;
};

export const getAccountInfo = async (tokenAccountAddress: string) => {
  const response = await connection.getParsedAccountInfo(
    new PublicKey(tokenAccountAddress)
  );
  return response;
};

export const getNftOwner = async (mintAddress: string) => {
  const response = await getTokenLargestAccounts(mintAddress);
  // console.log({ response });
  const largestAccount = response.value.filter(
    (f) => f?.uiAmount && f?.uiAmount > 0
  );
  const tokenAccountAddress = largestAccount[0]?.address.toBase58();
  if (!tokenAccountAddress) return null;
  if (tokenAccountAddress) {
    const accountInfo = await getAccountInfo(tokenAccountAddress);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // const owner = accountInfo.value?.data?.parsed?.info?.owner;
    const owner = "";
    // console.log({ accountInfo, tokenAccountAddress });
    return { accountInfo, tokenAccountAddress, owner };
  }
};

export const getNftTransactions = async (mintAddress: string) => {
  const signatures = await connection.getSignaturesForAddress(
    new PublicKey(mintAddress)
    // {
    // limit: 20,
    // }
  );
  // console.log({ signatures });
  const sigList = signatures.map((s) => s.signature);
  // console.log({ sigList });
  const transactionDetails = await connection.getParsedTransactions(sigList);

  return transactionDetails;
};

export const getSolUsdPrice = async () => {
  // const response = await fetch(
  //     'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
  // );
  const response = await fetch("https://price.jup.ag/v1/price?id=sol");
  //
  const data = (await response.json()) as {
    data: { price: number };
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return data?.data?.price;
};
