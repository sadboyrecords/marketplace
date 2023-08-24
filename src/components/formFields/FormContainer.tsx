/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import React from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import Button from "@/components/buttons/Button";

// import Typog

type FormContainerProps = {
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  overlayTitle: string;
  overlayDescription?: string;
  submitButtonLabel?: string;
  submitLoading?: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  //   DOMAttributes<HTMLFormElement>.onSubmit?: React.FormEventHandler<HTMLFormElement> | undefined
};

export default function FormContainer({
  setOpen,
  children,
  overlayTitle,
  overlayDescription,
  handleSubmit,
  submitButtonLabel,
  submitLoading,
}: FormContainerProps) {
  const handleCancel = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <div className="flex-1">
        {/* Header */}
        <div className="bg-base-200 px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between space-x-3">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                {overlayTitle}
              </Dialog.Title>
              <p className="text-sm text-gray-500">{overlayDescription}</p>
            </div>
            <div className="flex h-7 items-center">
              <button
                type="button"
                title="Close panel"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider container */}
        <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
          {children}
        </div>
      </div>

      {/* Action buttons */}
      {/* bottom-0 left-0 w-screen max-w-2xl absolute*/}
      <div className="mt-4 flex-shrink-0 border-t border-gray-200 bg-base-100 px-4  py-5  sm:px-6">
        <div className="flex justify-end space-x-3">
          <Button
            title="cancel"
            variant="outlined"
            color="neutral"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button title="create" loading={submitLoading}>
            {submitButtonLabel || "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
}
