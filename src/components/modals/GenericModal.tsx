import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon as XIcon } from "@heroicons/react/24/solid";
import Typography from "../typography";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  // openModal: () => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  noPadding?: boolean;
}

export default function MyModal({
  isOpen,
  closeModal,
  children,
  title,
  noPadding,
  description,
}: Props) {
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                  className={`relative w-full transform overflow-hidden rounded-lg bg-base-100  pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 md:max-w-xl ${
                    noPadding ? "p-0" : "px-4 sm:p-6"
                  } `}
                >
                  <div>
                    <div className="mt-3  text-center">
                      <div className="flex items-center">
                        <Dialog.Title
                          as="div"
                          className="flex-1 text-base font-semibold leading-6 text-base-content"
                        >
                          {title}
                          {description && (
                            <Typography
                              color="neutral-gray"
                              className="font-normal"
                              size="body-sm"
                            >
                              {description}
                            </Typography>
                          )}
                        </Dialog.Title>

                        <button
                          onClick={closeModal}
                          className=" text-gray-neutral"
                        >
                          <XIcon
                            className={`h-5 w-5 ${noPadding ? "mr-6" : ""}`}
                          />
                        </button>
                      </div>

                      <div className="mt-2">{children}</div>
                    </div>
                  </div>
                  {/* <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                     
                    >
                      Go back to dashboard
                    </button>
                  </div> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
