// import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");
import base58 from "bs58";
import React from "react";
import Button from "@/components/buttons/Button";
import { SigninMessage } from "@/utils/SignMessage";
import { getCsrfToken, signIn, useSession, signOut } from "next-auth/react";
import { api } from "@/utils/api";
import dynamic from "next/dynamic";

const AvataterNav = dynamic(() => import("@/components/buttons/AvataterNav"), {
  ssr: false,
});

export default function WalletAdaptor() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  // console.log({ publicKey: publicKey?.toBase58(), connected });
  const { setVisible } = useWalletModal();

  const { data: session, status } = useSession();
  const loading = status === "loading";

  const { data } = api.user.myProfile.useQuery(undefined, {
    enabled: !!session,
    staleTime: 1000 * 10,
  });

  const handleSignIn = React.useCallback(async () => {
    if (!publicKey) {
      setVisible(true);
      // return;
    }
    const csrf = await getCsrfToken();
    if (!csrf || !publicKey || !signMessage) {
      return;
    }
    console.log({ location: window.location, csrf });
    const message = new SigninMessage({
      domain: window.location.host,
      publicKey: publicKey.toBase58(),
      statement:
        " We need your signature to confirm you own this wallet. Sign your wallet to log into NiftyTunes. ",
      nonce: csrf,
    });
    const data = new TextEncoder().encode(message.prepare());
    const signature = await signMessage(data);
    const signatureBase58 = base58.encode(signature);
    console.log({ signatureBase58, message });
    //   // const message = "Sign to provide access to app";
    //   console.log({ account });
    //   // const { message } = await apiPost("api/auth/request-message", account);
    //   const res = await fetch("api/auth/request-message", {
    //     method: "POST",
    //     body: JSON.stringify(account),
    //   });
    //   const { message } = await res?.json();
    //   console.log({ message });
    //   const encodedMessage = new TextEncoder().encode(message);
    //   const signedMessage = await signMessage(encodedMessage, "utf8");
    try {
      const res = await signIn("solana-auth", {
        message: JSON.stringify(message),
        signature: signatureBase58,
        redirect: false,
        callbackUrl: window.location.href,
      });
      if (!res) {
        await disconnect();
      }
    } catch (error) {
      console.log({ error });
      await disconnect();
    }
  }, [disconnect, publicKey, setVisible, signMessage]);

  React.useMemo(() => {
    if (connected && status === "unauthenticated") {
      void handleSignIn();
    }
    if (status === "authenticated" && !connected) {
      // void disconnect();
      signOut()
        .then(() => null)
        .catch(() => null);
    }
  }, [connected, status, handleSignIn]);

  // console.log({ status, session, connected });

  // const handleGetProfviders = async () => {
  //   const providers = await getProviders();
  //   console.log({ providers });
  //   return providers;
  // };

  // useEffect(() => {
  //   void handleGetProfviders();
  // }, [publicKey]);

  // const signCustomMessage = async () => {
  //   const address = publicKey?.toBase58();
  //   const chain = "devnet";
  //   const account = {
  //     address: address,
  //     chain: chain,
  //     network: "solana",
  //   };
  //   // const message = "Sign to provide access to app";
  //   console.log({ account });
  //   // const { message } = await apiPost("api/auth/request-message", account);
  //   const res = await fetch("api/auth/request-message", {
  //     method: "POST",
  //     body: JSON.stringify(account),
  //   });
  //   const { message } = await res?.json();
  //   console.log({ message });
  //   const encodedMessage = new TextEncoder().encode(message);
  //   const signedMessage = await signMessage(encodedMessage, "utf8");
  //   setSigned(true);

  //   const signature = base58.encode(signedMessage);
  //   try {
  //     await signIn("credentials", {
  //       message,
  //       signature,
  //       redirect: false,
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     return;
  //   }
  // };

  // const { requestChallengeAsync, error } = useAuthRequestChallengeSolana();

  // const signCustomMessage = async () => {
  //   if (!publicKey) {
  //     throw new Error("Wallet not avaiable to process request.");
  //   }
  //   const address = publicKey.toBase58();
  //   console.log({ address });
  //   const challenge = await requestChallengeAsync({
  //     address,
  //     network: "devnet",
  //   });
  //   console.log({ challenge });
  //   const encodedMessage = new TextEncoder().encode(challenge?.message);
  //   if (!encodedMessage) {
  //     throw new Error("Failed to get encoded message.");
  //   }

  //   const signedMessage = await signMessage?.(encodedMessage);
  //   const signature = base58.encode(signedMessage as Uint8Array);
  //   try {
  //     const authResponse = await signIn("moralis-auth", {
  //       message: challenge?.message,
  //       signature,
  //       network: "Solana",
  //       redirect: false,
  //     });
  //     if (authResponse?.error) {
  //       throw new Error(authResponse.error);
  //     }
  //   } catch (e) {
  //     await disconnect();
  //     console.log(e);
  //     return;
  //   }
  // };

  // useEffect(() => {
  //   publicKey && !signed ? signCustomMessage() : setSigned(false);
  // }, [publicKey]);

  // useEffect(() => {
  //   if (error) {
  //     disconnect();
  //     console.log(error);
  //   }
  // }, [disconnect, error]);

  // useEffect(() => {
  //   if (disconnecting) {
  //     signOut({ redirect: false });
  //   }
  // }, [disconnecting]);

  // useEffect(() => {
  //   connected && signCustomMessage();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [connected]);

  return (
    <>
      {!session && !loading && (
        <Button loading={loading} size="sm" onClick={() => setVisible(true)}>
          Sign In
        </Button>
      )}
      {session && <AvataterNav />}

      {/* <WalletMultiButton /> */}
    </>
  );
}
