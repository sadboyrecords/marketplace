/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import MoneyIcon from "@heroicons/react/24/outline/BanknotesIcon";

import { loadStripeOnramp } from "@stripe/crypto";
import { useCallback, useState } from "react";
import { CryptoElements, OnrampElement } from "./StripeCryptoElements";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/components/iconComponents";
import { useSession } from "next-auth/react";
import { selectPublicAddress } from "@/lib/slices/appSlice";
import { useSelector } from "react-redux";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { useTheme } from "next-themes";

const GenericModal = dynamic(() => import("@/components/modals/GenericModal"), {
  ssr: false,
});
const OnrampModal = dynamic(() => import("@/components/modals/OnrampModal"), {
  ssr: false,
});

type Props = {
  close?: () => void;
};

function BuyWithStripe({ close }: Props) {
  const stripeOnrampPromise = loadStripeOnramp(
    process.env.NEXT_PUBLIC_STRIPE_PK as string
  );
  const { theme } = useTheme();

  const { candyMachines, fetchCandyMachineById, getUserBalance } =
    useMetaplex();
  const [open, setOpen] = useState(false);
  console.log({ open });
  const { data: session } = useSession();
  const [clientSecret, setClientSecret] = useState<string>();
  // const [message, setMessage] = useState("");
  const [loading, setIsLoading] = useState(false);
  const publicAddress = useSelector(selectPublicAddress);

  const handleCandyRefresh = async () => {
    console.log("refreshing candy machines");
    if (Object?.keys(candyMachines || {}).length === 0 || !candyMachines) {
      console.log("no candy");
      return;
    }
    await Promise.allSettled(
      Object.keys(candyMachines).map(async (key) => {
        console.log({ key });
        await fetchCandyMachineById(key);
      })
    );
    void getUserBalance();
    setIsLoading(false);
    return;
  };

  const handleBuy = async () => {
    setIsLoading(true);
    // console.log({ candyMachines });

    try {
      const body = {
        transactionDetails: {
          destinationCurrency: "sol",
          // destinationExchangeAmount: "1",
          destinationNetwork: "solana",
          walletAddress: {
            solana: publicAddress,
          },
        },
        customerInformation: {
          email: session?.user?.email,
        },
      } as StripeOnrampSessionRequest;
      console.log({ body });
      const res = await fetch("/api/stripe-onramp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status !== 200) {
        setIsLoading(false);
        toast.error("There was an error adding funds.");
        return;
      }
      const data = (await res.json()) as { clientSecret: string };
      console.log({ data });
      setClientSecret(data.clientSecret);
      setOpen(true);
    } catch (error) {
      setIsLoading(false);
      console.log({ error });
      toast.error("There was an error adding funds.s");
    }
  };

  const handleOnRamper = () => {
    // setIsLoading(true);
    console.log(" ON RAMP -------");

    try {
      setOpen(true);
    } catch (error) {
      setIsLoading(false);
      console.log({ error });
      toast.error("There was an error adding funds.s");
    }
  };

  const handleClose = useCallback(() => {
    if (close) {
      close();
    }
    setOpen(false);
    setClientSecret(undefined);
    setIsLoading(false);
  }, []);

  const onChange = ({ session }: { session: { status: string } }) => {
    // One of = {initialized, rejected,
    //           requires_payment, fulfillment_processing, fulfillment_complete}

    // setMessage(`OnrampSession is now in ${session.status} state.`);
    console.log({ session });
    // handleClose();
    setIsLoading(false);
    if (session.status === "fulfillment_complete") {
      console.log("COMPLETED");
      void handleCandyRefresh();
    }
  };

  // const moonSign = api.onramp.signMoonpayUrl.useMutation();
  const handleMoon = () => {
    try {
      // @ts-ignore
      if (!window?.MoonPayWebSdk) {
        console.log("no moon");
        return;
      }
      // ISSUE LIST
      // variant drawer doesn't work
      //   showWalletAddressForm: true, -> doesn't allow user to change address
      // doc says to sign url if passing in wallet address  -> doesn't work
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const moonpaySdk = window?.MoonPayWebSdk?.init({
        // debug: true,
        flow: "buy",
        environment:
          process.env.NEXT_PUBLIC_ENV === "prod" ? "production" : "sandbox",
        variant: "overlay",
        // variant: "drawer",
        params: {
          email: session?.user?.email,
          apiKey: process.env.NEXT_PUBLIC_MOONPAY_PK,
          baseCurrencyAmount: "50",
          baseCurrencyCode: "cad",
          defaultCurrencyCode:
            process.env.NEXT_PUBLIC_ENV === "prod" ? "SOL" : "ETH",
          // showOnlyCurrencies: "ETH,SOL,USDC",
          showWalletAddressForm: true,
          // walletAddress: "0x962dBA6E9f5CAcE9d2899970354F4402B39c1b93",
          walletAddresses:
            process.env.NEXT_PUBLIC_ENV === "prod"
              ? JSON.stringify({
                  sol: publicAddress,
                })
              : JSON.stringify({
                  sol: publicAddress,
                  eth: "0x962dBA6E9f5CAcE9d2899970354F4402B39c1b93",
                }),
          colorCode: "#9945FF",
        },
      });

      console.log({ moonpaySdk, publicAddress });
      // const urlForSignature = moonpaySdk.getUrlForSignature();
      // const signature = await moonSign.mutateAsync({ url: urlForSignature });
      // console.log({ signature });
      // moonpaySdk.updateSignature(signature);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      moonpaySdk.show();
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <div className="flex w-fit flex-col items-center space-x-3 space-y-2">
      <div
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        // onClick={handleBuy}
        onClick={handleOnRamper}
        className="flex cursor-pointer items-center rounded-md border border-border-gray   px-2 py-1 text-xs text-primary-500 hover:text-primary-700"
      >
        <MoneyIcon className="mr-2 h-4 w-4" />
        Add Funds
      </div>
      {/* <div
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleBuy}
        className="flex cursor-pointer items-center rounded-md border border-border-gray   px-2 py-1 text-xs text-primary-500 hover:text-primary-700"
      >
        <MoneyIcon className="mr-2 h-4 w-4" />
        Add Funds
      </div> */}
      {/* <div
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleMoon}
        className="flex cursor-pointer items-center rounded-md border border-border-gray   px-2 py-1 text-xs text-primary-500 hover:text-primary-700"
      >
        <MoneyIcon className="mr-2 h-4 w-4" />
        Add Funds MOON
      </div> */}
      {/* <GenericModal
        title="Add Funds"
        noPadding
        isOpen={open}
        closeModal={handleClose}
      >
        {loading && (
          <div className="flex h-32 w-full flex-col items-center justify-center">
            <LoadingSpinner className="h-10 w-10 text-primary-500" />
          </div>
        )}

        <CryptoElements stripeOnramp={stripeOnrampPromise}>
          {clientSecret && (
            // @ts-ignore
            <OnrampElement
              id="onramp-element"
              clientSecret={clientSecret}
              onChange={onChange}
            />
          )}
        </CryptoElements>
      </GenericModal> */}
      <OnrampModal
        title="Add Funds"
        noPadding
        isOpen={open}
        closeModal={handleClose}
      >
        {/* {loading && (
          <div className="flex h-32 w-full flex-col items-center justify-center">
            <LoadingSpinner className="h-10 w-10 text-primary-500" />
          </div>
        )} */}
        <iframe
          src={`https://buy.onramper.com/?themeName=${
            theme === "dark" ? "dark" : "light"
          }&primaryColor=9945FF&borderRadius=0.5&wgBorderRadius=1`}
          title="Onramper Widget"
          height="630px"
          width="100%" //"420px"
          allow="accelerometer; autoplay; camera; gyroscope; payment"
        />
      </OnrampModal>
    </div>
  );
}

export default BuyWithStripe;
