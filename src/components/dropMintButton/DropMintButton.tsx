import { type GuardsAndEligibilityType } from "@/utils/types";
import Typography from "@/components/typography";
import Button from "@/components/buttons/Button";
import { useWallet } from "@solana/wallet-adapter-react";
import SolIcon from "@/components/iconComponents/SolIcon";
import { useMemo, useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import { getSolUsdPrice } from "@/utils/rpcCalls";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { toast } from "react-toastify";
import ModalContainer from "@/components/modalContainer";
import Link from "next/link";
import { routes } from "@/utils/constants";
import type { MintResponseType } from "@/utils/types";

function DropMintButton({ onlyButton }: { onlyButton?: boolean }) {
  //   console.log({ prices });
  // Things to know
  // label (public, whitelist etc )
  // start/end date - (should be in sequence)
  // pricing - token payment, sol payment, nft burn etc.
  // minting limit/person

  const wallet = useWallet();
  const {
    candyMachineV3: { items, guardsAndEligibility, refresh },
    candyMachineV3,
    mint,
  } = useMetaplex();
  const [solInUsd, setSolInUsd] = useState<number>();
  const [mintAmount, setMintAmount] = useState<number>(1);
  const [startedStates, setStartedStates] =
    useState<GuardsAndEligibilityType[]>();
  const [limitMessage, setLimitMessage] = useState<string>();
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintedNfts, setMintedNfts] = useState<MintResponseType>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleGetPrice = async () => {
    const price = await getSolUsdPrice();
    setSolInUsd(Number(price));
  };

  const handleIncrease = () => {
    if (
      mintAmount <
      ((startedStates && startedStates[0]?.remainingLimit) ||
        items.available - items.redeemed ||
        100)
    ) {
      setMintAmount(mintAmount + 1);
    }
  };

  const handleDecrease = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };

  // const

  const handleMinting = async () => {
    if (startedStates && startedStates[0]?.label) {
      setIsMinting(true);
      try {
        const data = await mint({
          quantityString: mintAmount,
          label: startedStates[0]?.label,
        });

        console.log({ mintedData: data });
        if (data) {
          setMintedNfts(data);
        }

        setIsMinting(false);
        setIsModalOpen(true);
      } catch (error) {
        setIsMinting(false);

        toast.error("There was an error minting your NFT");
      }
    }
  };

  const handleCloseModal = async () => {
    await refresh();
    setIsModalOpen(false);
  };

  useMemo(() => {
    const startedStates = guardsAndEligibility?.filter(
      (state) => state.hasStarted && !state.hasEnded
    );

    const eligibleGuard = startedStates?.filter((state) => state.isEligible);
    if (startedStates && startedStates.length > 0) {
      if (!eligibleGuard || eligibleGuard?.length === 0) {
        setLimitMessage(startedStates[0]?.inEligibleReasons?.join(", "));
      }
    }
    setStartedStates(startedStates);
    // let limit =
    //   startedStates &&
    //   !startedStates[0]?.mintLimitExceeded &&
    //   startedStates[0]?.mintLimit;

    // if (startedStates.length > 0 && startedStates[0]?.mintLimitExceeded) {

    //   setMintAmount(0);
    // } else {
    //   setLimitMessage(undefined);
    //   setMintAmount(1);
    // }
    handleGetPrice();
  }, [candyMachineV3]);
  // guardsAndEligibility, items

  console.log({ mintedNfts });

  return (
    <div className="mt-4 flex flex-col gap-8">
      {/* {guardStates.default?.isS} */}
      <ModalContainer
        open={isModalOpen}
        handleCancel={handleCloseModal}
        title="Congrats"
        body="Your NFT(s) have been successfully minted"
      >
        {mintedNfts &&
          mintedNfts?.nftData.length > 0 &&
          mintedNfts.nftData.map((nft) => (
            <div className="flex">
              <Link
                href={routes.tokenItemDetails(nft.address)}
                key={nft.address}
              >
                <Typography color="primary" size="body-sm">
                  View {nft.name}
                </Typography>
              </Link>
            </div>
          ))}
      </ModalContainer>
      {startedStates && startedStates[0]?.hasStarted ? (
        <div className="mt-4">
          <div className="flex justify-between">
            <div>
              <Typography size="body-sm" className="text-neutral-content">
                Minted
              </Typography>
            </div>
            <div>
              <Typography size="body-sm" className="text-neutral-content">
                {((items.redeemed / items.available) * 100).toFixed(2)}% (
                {items.redeemed}/{items.available})
              </Typography>
            </div>
          </div>
          <div className="w-full">
            <progress
              className="progress progress-primary w-full bg-base-300"
              value={items.redeemed}
              max={items.available}
            ></progress>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 ">
                <SolIcon height={20} />
                <Typography variant={`h6`} className="">
                  {startedStates[0]?.payment?.sol?.amount}
                  {solInUsd && (
                    <span className="ml-2 text-sm text-neutral-content">
                      (
                      {(
                        solInUsd * (startedStates[0]?.payment?.sol?.amount || 0)
                      ).toFixed(2)}{" "}
                      usd)
                    </span>
                  )}
                </Typography>
              </div>
            </div>
            <div className="mt-4 text-center ">
              {wallet.publicKey ? (
                <>
                  {startedStates[0].isEligible && (
                    <>
                      <div className="flex flex-wrap items-center justify-center space-x-3">
                        <div className="flex items-center justify-between space-x-3">
                          <Button
                            disabled={limitMessage ? true : false}
                            //   color=''

                            className=""
                            size="sm"
                            variant="outlined"
                            onClick={handleIncrease}
                          >
                            <PlusIcon className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <div className=" max-w-[100px]">
                            {mintAmount}
                            {/* <Input /> */}
                          </div>
                          <Button
                            //   color=''
                            disabled={limitMessage ? true : false}
                            className=""
                            size="sm"
                            variant="outlined"
                            onClick={handleDecrease}
                          >
                            <MinusIcon className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>

                        <Button
                          disabled={startedStates[0].disableMint ? true : false}
                          onClick={handleMinting}
                          loading={isMinting}
                        >
                          {isMinting ? "Minting..." : "Mint"}
                        </Button>
                      </div>
                    </>
                  )}

                  <Typography color="neutral-content" size="body-sm">
                    {limitMessage}
                  </Typography>
                </>
              ) : (
                <>Connect your wallet</>
              )}
            </div>
          </div>
          {startedStates[0].isEligible &&
            startedStates[0]?.remainingLimit &&
            startedStates[0]?.remainingLimit === 0 && (
              <Typography size="body-sm">
                The mint limit for this phase of the sale has been reached.
              </Typography>
            )}
          {startedStates[0].isEligible &&
            startedStates[0]?.remainingLimit &&
            startedStates[0]?.remainingLimit > 0 && (
              <Typography
                size="body-sm"
                className="mt-4"
                color="neutral-content"
              >
                You have {startedStates[0]?.remainingLimit} NFTs remaining to
                mint.
              </Typography>
            )}
        </div>
      ) : (
        <div className={`mt-4 ${startedStates ? "block" : "hidden"}`}>
          <div className="mt-4 text-center">
            <Button disabled rounded="lg">
              Get Notified (coming soon)
            </Button>
          </div>
        </div>
      )}
      {/* <div className="px-4 py-6 flex flex-col gap-6 border-base-300 border-2 rounded-lg">
        <div className="flex justify-between">
          <div className="badge badge-success">Public Sale</div>
          <div>
            <Typography color="success" size="body-sm">
              {publicState?.isStarted && !publicState?.isEnded && 'In Progress'}
              {publicState?.isEnded && 'Ended'}
              {publicState?.isEnded && 'Ended'}
            </Typography>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col space-y-2">
            <Typography variant="body1" className="">
              Pricing
            </Typography>
            <div className="flex space-x-2 items-center ">
              <SolIcon height={15} />
              <Typography variant="body1" className="">
                {guards.public
                  ? guards.public?.payment?.sol?.parsedAmount
                  : guards.default?.payment?.sol?.parsedAmount}
              </Typography>
            </div>
          </div>
          {(guards.default?.mintLimit || guards.public?.mintLimit) && (
            <div className="text-right">
              <Typography size="body-sm" className="text-neutral-content">
                Limit
              </Typography>
              <Typography size="body-sm" className="text-neutral-content">
                {guards.public?.mintLimit?.settings.limit ||
                  guards.default?.mintLimit?.settings.limit}
              </Typography>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}

export default DropMintButton;
