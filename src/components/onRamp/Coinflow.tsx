/* eslint-disable @typescript-eslint/ban-ts-comment */
/*  ts-ignore */

import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CoinflowPurchase } from "@coinflowlabs/react";
import { XMarkIcon as XIcon } from "@heroicons/react/24/solid";
import type { Signer } from "@solana/web3.js";

import type { CoinflowEnvs } from "@coinflowlabs/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, type VersionedTransaction } from "@solana/web3.js";
import type { Transaction } from "@solana/web3.js";
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
  const [partialSigners, setPartialSigners] = useState<Signer[]>([]);
  const [transaction, setTransaction] = useState<
    Transaction | VersionedTransaction | undefined
  >(undefined);

  const amount = 1;

  const keys1 = [
    "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf", // user wallet
    "FGyDJ3ix4KxDqymho6YGqr1dvpf8G3vuyJYWZcDD8yEq",
    "G2dJ68YQzYJMP5QX7cz97J5HjEESBYepGTpnMyJEisz2",
    "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
    "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
    "D9majTvDEG8Jk3fxnSj4tEPiHPPsavzCee1eALaN2TqJ",
    "GkohCPBdZ84fM7E8bhYHTZrAA27jXwNxRYTDu1gR57iX",
    "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
    "AtQsn356fQK9d5wBkVw9eCwuVGoevz9stQEKmrnPVqZj",
    "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
    "11111111111111111111111111111111",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
    "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
    "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
    "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
    "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
    "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  ];

  const keys2 = [
    "dyDL1t85cjLwkww3jnooxWx7iNQ8b4hXWM5FnriaZML",
    "44Lxuqx8niPHUxksiJTYVoNoeFw3VH5GwW9Z46VkKKMw",
    "6da5tBfDmuWTkgAzULFDK334szK6pS8P7P9qDSCGMFpw",
    "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
    "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
    "2JygnvGJdoFtJAs1Rbddj8Y56YDmG1K1XJ9PSHKNJNLw",
    "F4FFQJZqnik2HXB8oWvTPR3gxS3Ymsx19Tdi8MpCHuZG",
    "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
    "DW7ynofpTQJMnxDR7TNa9soV19ieb2SKxG9p3SCUzsj4",
    "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
    "11111111111111111111111111111111",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
    "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
    "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
    "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
    "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
    "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  ];

  const keysphantom = [
    "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
    "FTBShpTydhcDyb32ppiLdC7izaCRoiy4uAk7JEJQkqf2",
    "EMGMYmguqJugQUnano1MhTU34cVZox3uBWr9xBfBK3xG",
    "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
    "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
    "9oQWVbgD4imm4bBzCVggmfigukp5NHxXB1wDDPCg41AR",
    "GPLCSm3dNBwC9DZwEMA21GVyAYzM3DNzwGpZkEqTjeCK",
    "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
    "5vW4djb9sLy2u5Ua7AVWGNZBKTp1mH9z1coPLrRNEjLG",
    "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
    "11111111111111111111111111111111",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
    "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
    "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
    "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
    "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
    "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  ];

  const unique = [
    "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
    "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
    "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
    "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
    "11111111111111111111111111111111",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
    "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
    "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
    "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
    "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
    "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  ];

  const handleMint = async () => {
    try {
      const tx = (await mint({
        candyMachineId,
        quantityString,
        label,
        refetchTheseIds,
        onlySign: true,
      })) as {
        tx: VersionedTransaction;
        signers: Signer[] | undefined;
      };
      console.log({ txCoin: tx, signerKey: tx.signers });
      const accountKeys = tx.tx.message.staticAccountKeys.map((key) =>
        key.toBase58()
      );
      console.log({ accountKeys });
      const uniquekeys = [];
      // for (let i = 0; i < keys1.length; i++) {
      //   keys2.forEach((key) => {
      //     if (accountKeys.includes(key)) {
      //       console.log({ key });
      //     }
      //   });
      //   // if (!uniquekeys.includes(accountKeys[i])) {
      //   //   uniquekeys.push(accountKeys[i]);
      //   // }
      // }

      keysphantom.forEach((key) => {
        if (keys1.includes(key)) {
          console.log({ key });
          uniquekeys.push(key);
        }
      });
      console.log({ uniquekeys });

      setTransaction(tx.tx);
      setPartialSigners(tx.signers || []);
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
      <button onClick={handleMint}>test coin</button>
      {/* <button onClick={handleCreateLookup}>create lookup</button> */}
      <button onClick={extendLookupTable}> extend</button>
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
                          partialSigners={partialSigners}
                          // debugTx
                          blockchain={"solana"}
                          webhookInfo={{ item: "sword" }}
                          email={"nyramuzik@gmail.com"}
                          transaction={transaction}
                          amount={amount}
                          // token={"So11111111111111111111111111111111111111112"}
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
