import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  SolletExtensionWalletAdapter,
  LedgerWalletAdapter,
  SafePalWalletAdapter,
  SlopeWalletAdapter,
  SolongWalletAdapter,
  //   LedgerWalletAdapterConfig,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useMemo } from "react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

function Web3Provider({ children }: { children: React.ReactNode }) {
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ||
    WalletAdapterNetwork.Devnet) as
    | WalletAdapterNetwork.Mainnet
    | WalletAdapterNetwork.Devnet;

  const rpcHost = process.env.NEXT_PUBLIC_RPC_HOST || clusterApiUrl(network);
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = useMemo(() => rpcHost, [rpcHost]);
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
      new LedgerWalletAdapter(),
      new SafePalWalletAdapter(),
      new SlopeWalletAdapter({ network }),
      new SolongWalletAdapter(),
      // new WalletConnectWalletAdapter({
      //   network,
      //   options: {
      //     relayUrl: 'wss://relay.walletconnect.com',
      //     // example WC dapp project ID
      //     projectId: '312246a0d3961ccc7e11cd131a51570e',
      //     metadata: {
      //       name: 'Nifty Tunes - Marketplace',
      //       description: 'Nifty Tunes - Marketplace',
      //       url: 'https://github.com/sadboyrecords/NiftyTunes-Marketplace',
      //       icons: ['https://avatars.githubusercontent.com/u/35608259?s=200'],
      //     },
      //   },
      // }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default Web3Provider;
