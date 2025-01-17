import { type MintResponseType } from "@/utils/types";
import { SolIcon } from "@/components/iconComponents";
import Typography from "@/components/typography";
import Button from "@/components/buttons/Button";
// import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import React from "react";
import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
// import Input from "../formFields/Input";
// import { toast } from "react-toastify";
// import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import Link from "next/link";
import { routes } from "@/utils/constants";
// import { useDispatch } from "react-redux";
// import { closeJoinBattleFansModal } from "@/lib/slices/appSlice";
import Coinflow from "@/components/onRamp/Coinflow";

const GenericModal = dynamic(() => import("@/components/modals/GenericModal"), {
  ssr: false,
});

// const AddFunds = dynamic(() => import("@/components/onRamp/AddFunds"), {
//   ssr: false,
// });

type BuyProps = {
  candyMachineId: string;
  competitorCandyId?: string;
};
function Buy({ candyMachineId, competitorCandyId }: BuyProps) {
  const { data: session } = useSession();
  const { publicKey } = useWallet();

  const { fetchCandyMachineById, candyMachines } = useMetaplex();

  const candyMachine = candyMachines?.[candyMachineId || ""];

  const [mintAmount, setMintAmount] = React.useState<number>(1);

  // const handleIncrease = () => {
  //   setMintAmount(mintAmount + 1);
  // };

  // const handleDecrease = () => {
  //   if (mintAmount > 1) {
  //     setMintAmount(mintAmount - 1);
  //   }
  // };
  const [purchasedNft, setPurchasedNft] = React.useState<MintResponseType>();

  // const [isMinting, setIsMinting] = React.useState<boolean>(false);
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const handleCloseModal = () => {
    setModalOpen(false);
    setPurchasedNft(undefined);
  };
  // const dispatch = useDispatch();
  // async function handleMint() {
  //   if (!mintAmount || !candyMachineId) {
  //     return;
  //   }
  //   setIsMinting(true);
  //   const toastId = toast.loading("Purchase in progress");
  //   try {
  //     const data = await mint({
  //       candyMachineId,
  //       quantityString: mintAmount,
  //       label: candyMachine?.guardsAndEligibility?.[0]?.label || "",
  //       refetchTheseIds: competitorCandyId ? [competitorCandyId] : undefined,
  //     });
  //     setPurchasedNft(data as MintResponseType);
  //     setIsMinting(false);
  //     toast.done(toastId);
  //     dispatch(closeJoinBattleFansModal());
  //     setModalOpen(true);

  //     void confetti({
  //       particleCount: 100,
  //       angle: 60,
  //       spread: 70,
  //       origin: { x: 0.2 },
  //     });

  //     void confetti({
  //       particleCount: 100,
  //       angle: 120,
  //       spread: 70,
  //       origin: { x: 0.8 },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     toast.done(toastId);

  //     setIsMinting(false);
  //     toast.error("Error minting");
  //   }
  // }
  React.useMemo(() => {
    if (candyMachineId) {
      void fetchCandyMachineById(candyMachineId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candyMachineId]);
  return (
    <>
      <GenericModal
        title="Congrats on  your purchase!"
        isOpen={modalOpen}
        closeModal={handleCloseModal}
      >
        <Typography size="body-sm" color="neutral-content">
          Select {mintAmount > 1 ? "one of the links" : "the link"} below to
          view your digital collectable
        </Typography>
        <div className="mt-2 flex flex-col space-y-2 text-left text-sm text-primary-500">
          {purchasedNft?.nftData.map((nft) => (
            <Link
              key={nft.address}
              className=""
              href={routes.tokenItemDetails(nft?.address || "")}
              target="_blank"
            >
              {nft.name}
            </Link>
          ))}
        </div>
        <Button
          title="close"
          onClick={handleCloseModal}
          color="neutral"
          variant="outlined"
        >
          Close
        </Button>
      </GenericModal>
      <div className="mt-4 ">
        {/* flex flex-wrap items-center justify-between gap-3 */}
        <div className="flex flex-wrap items-center justify-between gap-3 ">
          <div className="flex items-center space-x-2 ">
            {candyMachine?.guardsAndEligibility?.[0]?.payment?.sol && (
              <>
                <SolIcon height={20} />
                <Typography size="body-xl" className="">
                  {
                    candyMachine?.guardsAndEligibility?.[0]?.payment?.sol
                      ?.amount
                  }
                  {/* //battle?.battlePrice || */}
                  {/* {solUsdPrice && (
                <span className="ml-2 text-sm text-neutral-content">
                (
                  {(
                    solUsdPrice *
                    (candyMachine?.guardsAndEligibility?.[0]?.payment?.sol
                      ?.amount || 0)
                  ).toFixed(2)}{" "}
                  usd)
                </span>
              )} */}
                </Typography>
              </>
            )}
            {candyMachine?.guardsAndEligibility?.[0]?.payment?.token && (
              <div className="flex items-center space-x-1 ">
                {/* <UsdcIcon className="h-11 w-11" /> */}
                <span className="text-xl">$</span>
                <Typography size="body-xl" className="">
                  {
                    candyMachine?.guardsAndEligibility?.[0]?.payment?.token
                      ?.amount
                  }
                  <span className="ml-2 text-xs text-neutral-content">
                    (USD)
                  </span>
                </Typography>
              </div>
            )}
          </div>
          {publicKey || session ? (
            <>
              <div className="flex flex-col sm:flex-row">
                <Coinflow
                  candyMachineId={candyMachineId}
                  quantityString={mintAmount}
                  label={candyMachine?.guardsAndEligibility?.[0]?.label || ""}
                  refetchTheseIds={
                    competitorCandyId ? [competitorCandyId] : undefined
                  }
                />
              </div>
            </>
          ) : (
            <>You need to sign in to buy</>
          )}
        </div>

        {/* <div className=" ">
          {publicKey || session ? (
            <>
              <div className="mt-4 items-center justify-between space-x-4 space-y-3 rounded-md border border-border-gray p-4 sm:flex sm:flex-wrap sm:space-y-0">
                <div>
                  <Typography
                    size="body"
                    className="text-center text-neutral-content"
                  >
                    Use your credit card
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <Coinflow
                    candyMachineId={candyMachineId}
                    quantityString={mintAmount}
                    label={candyMachine?.guardsAndEligibility?.[0]?.label || ""}
                    refetchTheseIds={
                      competitorCandyId ? [competitorCandyId] : undefined
                    }
                  />
                </div>
              </div>
              <div className="mt-6 rounded-md border border-border-gray p-4">
                {(publicKey || session) &&
                  candyMachine &&
                  !candyMachine?.guardsAndEligibility?.[0]?.isEligible && (
                    <div className="mt-3 flex items-center justify-between space-x-2">
                      <Typography size="body-xs" color="neutral-gray">
                        {
                          candyMachine?.guardsAndEligibility?.[0]
                            ?.inEligibleReasons?.[0]
                        }
                      </Typography>
                    </div>
                  )}
                <div className="mt-2 flex flex-col flex-wrap justify-between space-x-3 sm:flex-row sm:items-center ">
                  <div className="mt-2">
                    <Typography size="body" className="text-neutral-content">
                      Use your wallet
                    </Typography>
                  </div>
                  <div className="sm:flex ">
                    <div className="mt-3 flex items-center space-x-3 sm:mt-0 sm:justify-between">
                      <Button
                        className="!p-1"
                        color="neutral"
                        size="sm"
                        // rounded="full"
                        onClick={handleIncrease}
                        variant="outlined"
                      >
                        <PlusIcon
                          className="h-4 w-4 text-neutral-content"
                          aria-hidden="true"
                        />
                      </Button>
                      <div id="custom-canvas" className="flex w-16">
                        <Input
                          type="number"
                          // onChange={(e) =>
                          //   setMintAmount(Number(e.target.value))
                          // }
                          inputProps={{
                            onChange: (e) =>
                              setMintAmount(Number(e.target.value)),
                          }}
                          className="w-10"
                          value={mintAmount.toString()}
                        />
                      </div>
                      <Button
                        className="!p-1"
                        color="neutral"
                        disabled={mintAmount === 1}
                        size="sm"
                        variant="outlined"
                        onClick={handleDecrease}
                      >
                        <MinusIcon
                          className="h-4 w-4 text-neutral-content"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-col space-y-2 sm:ml-4 sm:mt-0">
                      <Button
                        disabled={
                          !candyMachine?.guardsAndEligibility?.[0]?.isEligible
                        }
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={handleMint}
                        loading={isMinting}
                      >
                        Buy with wallet
                      {isMinting ? 'Minting...' : 'Mint'} 
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>You need to sign in to buy</>
          )}
        </div> */}
        {/* {candyMachine?.guardsAndEligibility?.[0]?.maxPurchaseQuantity && (
          <Typography color="neutral-gray">
            You can buy up to{" "}
            {candyMachine?.guardsAndEligibility?.[0]?.maxPurchaseQuantity}. Buy
            more sol to purchase more
          </Typography>
        )} */}
      </div>
    </>
  );
}

export default Buy;
