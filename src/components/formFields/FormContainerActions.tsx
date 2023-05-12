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
      <div className="mt-4 flex-shrink-0 border-t border-gray-200 bg-base-100 px-4  py-5  sm:px-6">
        <div className="flex justify-end space-x-3">
          <Button variant="outlined" color="neutral" onClick={handleCancel}>
            Cancel
          </Button>
          <Button loading={submitLoading}>
            {submitButtonLabel || "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
}
