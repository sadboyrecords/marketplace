/* eslint-disable @typescript-eslint/ban-ts-comment */
/*  ts-ignore */

import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CoinflowPurchase } from "@coinflowlabs/react";
import { XMarkIcon as XIcon } from "@heroicons/react/24/solid";

import type { CoinflowEnvs } from "@coinflowlabs/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { toast } from "react-toastify";

function CoinflowContent({
  candyMachineId,
  quantityString,
  label,
  refetchTheseIds,
}: MintType) {
  const { metaplex, mint, createLookupTable, extendLookupTable } =
    useMetaplex();
  const { connection } = useConnection();
  const wallet = useWallet();
  // console.log({ wallet });
  // console.log({ candyMachineId });
  const [isOpen, setIsOpen] = useState(false);
  const [transaction, setTransaction] = useState<
    Transaction | VersionedTransaction | undefined
  >(undefined);

  const amount = 10;

  const handleMint = async () => {
    try {
      const tx = (await mint({
        candyMachineId,
        quantityString,
        label,
        refetchTheseIds,
        onlySign: true,
      })) as Transaction[] | VersionedTransaction[];
      console.log({ txCoin: tx });

      setTransaction(tx[0]);
      setIsOpen(true);
    } catch (error) {
      console.log({ errorcoin: error });
      toast.error("There was an error purchasing your Collectable");
    }
  };

  const handleCreateLookup = async () => {
    try {
      const lookup = await createLookupTable();
      console.log({ lookup });
    } catch (error) {
      console.log({ error });
      toast.error("Can't create table");
    }
  };

  //   useEffect(() => {
  //     async function createTx() {
  //       if (!wallet.publicKey) return;

  //       const usdcMint = new PublicKey(
  //         "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
  //       );
  //       const decimals = 6;

  //       const senderAta = getAssociatedTokenAddressSync(
  //         usdcMint,
  //         wallet.publicKey,
  //         true
  //       );

  //       const receiver = new PublicKey(
  //         "63zH5fKvSubyforhkAJEWwaeEUoLe8R864bETRLMrX1t"
  //       );
  //       const receiverAta = getAssociatedTokenAddressSync(
  //         usdcMint,
  //         receiver,
  //         true
  //       );

  //       const transferAmount = Number(amount) * Math.pow(10, decimals);
  //       const transferIx = createTransferCheckedInstruction(
  //         senderAta,
  //         usdcMint,
  //         receiverAta,
  //         wallet.publicKey,
  //         transferAmount,
  //         decimals
  //       );
  //       const tx = new Transaction();
  //       tx.add(transferIx);
  //       tx.feePayer = wallet.publicKey;
  //       const { blockhash } = await connection.getLatestBlockhash("finalized");
  //       tx.recentBlockhash = blockhash;
  //       setTransaction(tx);
  //     }

  //     void createTx();
  //   }, [amount, wallet.publicKey]);

  return (
    <>
      {/* <button onClick={handleMint}>test coin</button> */}
      {/* <button onClick={handleCreateLookup}>create lookup</button> */}
      {/* <button onClick={extendLookupTable}> extend</button> */}
      <Transition key="on-ramp" show={isOpen} as={Fragment}>
        <Dialog
          id="on-ramp-modal"
          as="div"
          className="relative z-40"
          onClose={() => null}
          // onClose={() => dispatch(closeOnramp())}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className={`relative w-full max-w-[40rem] transform overflow-hidden rounded-lg  bg-base-100 p-2 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 `}
                >
                  <div>
                    <div className="mt-3  text-center">
                      <div className="flex items-center">
                        <Dialog.Title
                          as="div"
                          className="flex-1 text-base font-semibold leading-6 text-base-content"
                        >
                          Buy with Credit Card
                          {/* {description && (
                            <Typography
                              color="neutral-gray"
                              className="font-normal"
                              size="body-sm"
                            >
                              {description}
                            </Typography>
                          )} */}
                        </Dialog.Title>

                        <button
                          onClick={() => setIsOpen(false)}
                          className=" text-gray-neutral"
                        >
                          <XIcon className={`mr-6 h-5 w-5`} />
                        </button>
                      </div>

                      <div className="mt-2 h-[20rem]">
                        <CoinflowPurchase
                          wallet={wallet}
                          merchantId={"niftytunes"} //process.env.REACT_APP_MERCHANT_ID as string
                          env={"sandbox"} //process.env.REACT_APP_ENV as CoinflowEnvs
                          connection={connection}
                          onSuccess={() => {
                            console.log("Purchase Success");
                          }}
                          debugTx
                          blockchain={"solana"}
                          webhookInfo={{ item: "sword" }}
                          email={"nyramuzik@gmail.com"}
                          transaction={transaction}
                          amount={amount}
                        />
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default CoinflowContent;
