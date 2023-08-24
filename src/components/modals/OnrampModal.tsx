import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon as XIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import { useSelector, useDispatch } from "react-redux";
import {
  selectOnrampModal,
  closeOnramp,
  selectPublicAddress,
} from "@/lib/slices/appSlice";

export default function OnrampModal() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isOpen = useSelector(selectOnrampModal);
  const publicAddress = useSelector(selectPublicAddress);
  return (
    <>
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
                  className={`relative w-full max-w-[420px] transform overflow-hidden rounded-lg  bg-base-100 p-2 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 `}
                >
                  <div>
                    <div className="mt-3  text-center">
                      <div className="flex items-center">
                        <Dialog.Title
                          as="div"
                          className="flex-1 text-base font-semibold leading-6 text-base-content"
                        >
                          Add Funds
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
                          title="Close panel"
                          onClick={() => dispatch(closeOnramp())}
                          className=" text-gray-neutral"
                        >
                          <XIcon className={`mr-6 h-5 w-5`} />
                        </button>
                      </div>

                      <div className="mt-2">
                        <iframe
                          src={`https://buy.onramper.com/?themeName=${
                            theme === "dark" ? "dark" : "light"
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          }&primaryColor=9945FF&borderRadius=0.5&wgBorderRadius=1&defaultCrypto=SOL&onlyCryptos=SOL&apiKey=${process
                            .env.NEXT_PUBLIC_ONRAMPER_PK!}${
                            publicAddress
                              ? `&networkWallets=SOLANA:${publicAddress}`
                              : ""
                          }`}
                          title="Onramper Widget"
                          height="630px"
                          width="100%" //"420px"
                          allow="accelerometer; autoplay; camera; gyroscope; payment"
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
