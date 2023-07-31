/* eslint-disable @typescript-eslint/ban-ts-comment */
/*  ts-ignore */

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CoinflowPurchase } from "@coinflowlabs/react";
import XIcon from "@heroicons/react/24/solid/XMarkIcon";
import { selectPublicAddress } from "@/lib/slices/appSlice";
import { useSelector } from "react-redux";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import Button from "@/components/buttons/Button";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { toast } from "react-toastify";
import { magic, signTransaction } from "@/lib/magic";
import { env } from "@/utils/constants";
import dynamic from "next/dynamic";
import confetti from "canvas-confetti";
import type { CoinflowResp } from "@/utils/types";
import type { SolanaWallet } from "@coinflowlabs/react";
import type { BlockhashWithExpiryBlockHeight, Signer } from "@solana/web3.js";
import Typography from "../typography";
import Link from "next/link";
import { routes } from "@/utils/constants";

const GenericModal = dynamic(() => import("@/components/modals/GenericModal"), {
  ssr: false,
});

function CoinflowContent({
  candyMachineId,
  quantityString,
  label,
  refetchTheseIds,
}: MintType) {
  const { metaplex, mint, fetchCandyMachineById } = useMetaplex();
  const publicAddress = useSelector(selectPublicAddress);
  const { connection } = useConnection();
  const wallet = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [partialSigners, setPartialSigners] = useState<Signer[]>([]);
  const [transaction, setTransaction] = useState<
    Transaction | VersionedTransaction | undefined
  >(undefined);
  const [nftPrice, setNftPrice] = useState<number>();
  const [ctx, setCtx] = useState<{
    tokenAddress: PublicKey;
    mintSigner: PublicKey;
  }>();

  const [nftData, setNftData] = useState<{
    address: string | undefined;
    name: string | undefined;
  }>();
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const handleCloseModal = () => {
    setModalOpen(false);
    setNftData(undefined);
  };

  const [candymMachinesIds, setCandyMachinesIds] = useState<string[]>([]);
  const [blockhash, setBlockhash] = useState<BlockhashWithExpiryBlockHeight>();

  // const keys1 = [
  //   "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf", // user wallet
  //   "FGyDJ3ix4KxDqymho6YGqr1dvpf8G3vuyJYWZcDD8yEq",
  //   "G2dJ68YQzYJMP5QX7cz97J5HjEESBYepGTpnMyJEisz2",
  //   "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
  //   "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
  //   "D9majTvDEG8Jk3fxnSj4tEPiHPPsavzCee1eALaN2TqJ",
  //   "GkohCPBdZ84fM7E8bhYHTZrAA27jXwNxRYTDu1gR57iX",
  //   "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
  //   "AtQsn356fQK9d5wBkVw9eCwuVGoevz9stQEKmrnPVqZj",
  //   "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
  //   "11111111111111111111111111111111",
  //   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  //   "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  //   "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
  //   "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
  //   "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
  //   "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
  //   "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
  //   "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  // ];

  // const keys2 = [
  //   "dyDL1t85cjLwkww3jnooxWx7iNQ8b4hXWM5FnriaZML",
  //   "44Lxuqx8niPHUxksiJTYVoNoeFw3VH5GwW9Z46VkKKMw",
  //   "6da5tBfDmuWTkgAzULFDK334szK6pS8P7P9qDSCGMFpw",
  //   "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
  //   "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
  //   "2JygnvGJdoFtJAs1Rbddj8Y56YDmG1K1XJ9PSHKNJNLw",
  //   "F4FFQJZqnik2HXB8oWvTPR3gxS3Ymsx19Tdi8MpCHuZG",
  //   "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
  //   "DW7ynofpTQJMnxDR7TNa9soV19ieb2SKxG9p3SCUzsj4",
  //   "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
  //   "11111111111111111111111111111111",
  //   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  //   "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  //   "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
  //   "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
  //   "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
  //   "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
  //   "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
  //   "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  // ];

  // const keysphantom = [
  //   "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
  //   "FTBShpTydhcDyb32ppiLdC7izaCRoiy4uAk7JEJQkqf2",
  //   "EMGMYmguqJugQUnano1MhTU34cVZox3uBWr9xBfBK3xG",
  //   "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
  //   "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
  //   "9oQWVbgD4imm4bBzCVggmfigukp5NHxXB1wDDPCg41AR",
  //   "GPLCSm3dNBwC9DZwEMA21GVyAYzM3DNzwGpZkEqTjeCK",
  //   "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
  //   "5vW4djb9sLy2u5Ua7AVWGNZBKTp1mH9z1coPLrRNEjLG",
  //   "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
  //   "11111111111111111111111111111111",
  //   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  //   "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  //   "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
  //   "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
  //   "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
  //   "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
  //   "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
  //   "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  // ];

  // const unique = [
  //   "26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h",
  //   "J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6",
  //   "2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu",
  //   "4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs",
  //   "11111111111111111111111111111111",
  //   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  //   "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  //   "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
  //   "G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS",
  //   "GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78",
  //   "5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV",
  //   "2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec",
  //   "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  // ];
  // const moreUnique = [
  //   "K2T7FyGh2drq5FtZtxNt9CWxoUjGxqCQXPC5M7VEf3n",
  //   "2Dd4tLC5NmacAZiUyFFgABz67dd3sXz1BYdsAgXq4nVb",
  //   "HxaWVXo7SuTxqWm75exXc5zC2vKwjCScgnC2AqmtXgPB",
  //   "CTyszyCDYuP16rG1iFBdmRAD4SPzB85UHyWgPZX5whJk",
  //   "3Z4qfZVwjbh5c2wer7tqkJyb9u97KCo57864Y7Pi2Dfx",
  //   "5dSW5mkSPpELUhzuk8YsCf9zNPzq3HxqdjgQjXPPy9Mg",
  //   "EyrHktmeBiDxcHq67cXUnQHj2BL8VXG4UBae1TeQy9sr",
  //   "E2grteDrihnAa3UgdmjP2h8jaY5niUi7kFbF35j3MXgj",
  // ];

  // const other = [
  //   "K2T7FyGh2drq5FtZtxNt9CWxoUjGxqCQXPC5M7VEf3n",
  //   "5RJc11HUuKBg8eiBjnLWFKhL5tdEz3VYim3Wjo7QR4iW",
  //   "3JyNPqZn2gAfB6Mu87KhunDLzm7CTDnZDAD6kaDXT95B",
  //   "3sUUq5XSSHSNLF1HjGZUJHjTSHvZWdPffcmSs8nwgKtC",
  //   "2Dd4tLC5NmacAZiUyFFgABz67dd3sXz1BYdsAgXq4nVb",
  //   "HxaWVXo7SuTxqWm75exXc5zC2vKwjCScgnC2AqmtXgPB",
  //   "2SmU5xUuAAmDb7F2p6XJZZRQZCj9D4KYid5Tg223pNjs",
  //   "13ywmjT8yAWdmjrt6J4NL9hgstFAtDFRVzKaPkmL3GXN",
  //   "CTyszyCDYuP16rG1iFBdmRAD4SPzB85UHyWgPZX5whJk",
  //   "582WdoXLMTSrzaQxFk5Kvvz5Pv5r2YPFt3XBQNZiXzCc",
  //   "3Z4qfZVwjbh5c2wer7tqkJyb9u97KCo57864Y7Pi2Dfx",
  //   "5dSW5mkSPpELUhzuk8YsCf9zNPzq3HxqdjgQjXPPy9Mg",
  //   "EyrHktmeBiDxcHq67cXUnQHj2BL8VXG4UBae1TeQy9sr",
  //   "E2grteDrihnAa3UgdmjP2h8jaY5niUi7kFbF35j3MXgj",
  // ];

  const handleMint = async () => {
    try {
      const mintResp = (await mint({
        candyMachineId,
        quantityString,
        label,
        refetchTheseIds,
        onlySign: true,
      })) as CoinflowResp;

      if (!mintResp) return;
      setBlockhash(mintResp.blockhash);
      setCandyMachinesIds(mintResp.candymachineIds);
      setNftPrice(mintResp.amount);
      setCtx({
        tokenAddress: mintResp.tokenAddress,
        mintSigner: mintResp.mintSigner,
      });
      // console.log({ mintResp });
      // const accountKeys = mintResp.tx?.message.staticAccountKeys.map((key) =>
      //   key.toBase58()
      // );
      // console.log({ accountKeys });
      // const uniquekeys = [];
      // const otherKeys = [];
      // accountKeys.forEach((key) => {
      //   if (other.includes(key)) {
      //     uniquekeys.push(key);
      //   } else {
      //     otherKeys.push(key);
      //   }
      // });
      // console.log({ uniquekeys, otherKeys });
      // for (let i = 0; i < accountKeys.length; i++) {
      //   if (){

      //   }
      //   // keys2.forEach((key) => {
      //   //   if (accountKeys.includes(key)) {
      //   //     console.log({ key });
      //   //   }
      //   // });
      //   // if (!uniquekeys.includes(accountKeys[i])) {
      //   //   uniquekeys.push(accountKeys[i]);
      //   // }
      // }

      // keysphantom.forEach((key) => {
      //   if (keys1.includes(key)) {
      //     console.log({ key });
      //     uniquekeys.push(key);
      //   }
      // });
      // console.log({ uniquekeys });

      setTransaction(mintResp.tx);
      setPartialSigners(mintResp.signers || []);
      setIsOpen(true);
    } catch (error) {
      console.log({ errorcoin: error });
      toast.error("There was an error purchasing your Collectable");
    }
  };

  // const handleCreateLookup = async () => {
  //   try {
  //     const lookup = await createLookupTable();
  //     console.log({ lookup });
  //   } catch (error) {
  //     console.log({ error });
  //     toast.error("Can't create table");
  //   }
  // };

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
      <Button
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleMint}
        // loading={isMinting}
        // rounded="lg"
      >
        Buy with credit card
        {/* {isMinting ? 'Minting...' : 'Mint'} */}
      </Button>
      {/* <button onClick={handleCreateLookup}>create lookup</button> */}
      {/* <button onClick={extendLookupTable}> extend</button> */}
      <GenericModal
        title="Congrats on  your purchase!"
        isOpen={modalOpen}
        closeModal={handleCloseModal}
      >
        <Typography size="body-sm" color="neutral-content">
          Select the link below to view your digital collectable
        </Typography>
        <div className="mt-2 flex flex-col space-y-2 text-left text-sm text-primary-500">
          {nftData && (
            <Link
              key={nftData.address}
              className=""
              href={routes.tokenItemDetails(nftData?.address || "")}
              target="_blank"
            >
              {nftData.name}
            </Link>
          )}
        </div>
        <Button onClick={handleCloseModal} color="neutral" variant="outlined">
          Close
        </Button>
      </GenericModal>
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
                          wallet={
                            publicAddress &&
                            publicAddress !== wallet.publicKey?.toBase58()
                              ? ({
                                  publicKey: new PublicKey(publicAddress),
                                  sendTransaction: async (tx) => {
                                    // console.log("sending transaction", {
                                    //   tx,
                                    // });
                                    // // VersionedTransaction

                                    if (tx instanceof Transaction) {
                                      const udpatetx = await signTransaction(
                                        tx
                                      );
                                      console.log({ udpatetx });
                                      const txid = await metaplex
                                        ?.rpc()
                                        .sendTransaction(udpatetx);
                                      // const txid =
                                      //   await connection.sendTransaction(
                                      //     udpatetx,
                                      //     {
                                      //       maxRetries: 5,
                                      //     }
                                      //   );
                                      console.log({ txid });
                                      return txid;
                                    }
                                    if (tx instanceof VersionedTransaction) {
                                      const serilize = tx.message.serialize();
                                      if (!magic) return null;
                                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                      const signedMagic: Uint8Array =
                                        await magic.solana.signMessage(
                                          serilize
                                        );
                                      // magic.wallet.getProvider()
                                      // magic.solana.solanaConfig

                                      tx.addSignature(
                                        new PublicKey(publicAddress),
                                        signedMagic
                                      );
                                      const txid =
                                        await connection.sendTransaction(tx, {
                                          maxRetries: 5,
                                        });
                                      if (blockhash) {
                                        const confirmation =
                                          await connection.confirmTransaction({
                                            signature: txid,
                                            blockhash: blockhash.blockhash,
                                            lastValidBlockHeight:
                                              blockhash.lastValidBlockHeight,
                                          });
                                        console.log({ confirmation });
                                      }
                                      return txid;
                                    }
                                  },
                                } as SolanaWallet)
                              : wallet
                          }
                          merchantId={"niftytunes"} //process.env.REACT_APP_MERCHANT_ID as string
                          env={env === "prod" ? "prod" : "sandbox"} //process.env.REACT_APP_ENV as CoinflowEnvs
                          connection={connection}
                          onSuccess={async () => {
                            console.log("Purchase Success");
                            if (!metaplex || !ctx) return;
                            try {
                              console.log({ ctx });
                              const nft = await metaplex.nfts().findByMint({
                                mintAddress: ctx.mintSigner,
                                tokenAddress: ctx.tokenAddress,
                              });
                              setNftData({
                                address: nft?.address.toBase58(),
                                name: nft?.name,
                              });
                              setModalOpen(true);
                              void confetti({
                                particleCount: 100,
                                angle: 60,
                                spread: 70,
                                origin: { x: 0.2 },
                              });

                              void confetti({
                                particleCount: 100,
                                angle: 120,
                                spread: 70,
                                origin: { x: 0.8 },
                              });
                            } catch (error) {
                              console.log({ error });
                            }
                            if (candymMachinesIds) {
                              console.log("---GETTING CANDY MACHINE---");
                              await Promise.all(
                                candymMachinesIds.map((id) =>
                                  fetchCandyMachineById(id)
                                )
                              );
                            }
                          }}
                          partialSigners={partialSigners}
                          // debugTx
                          blockchain={"solana"}
                          // webhookInfo={{ item: "sword" }}
                          // email={"nyramuzik@gmail.com"}
                          transaction={transaction}
                          amount={nftPrice}
                          // loaderBackground=""
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
