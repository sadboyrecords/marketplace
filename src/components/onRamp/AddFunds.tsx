/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import MoneyIcon from "@heroicons/react/24/outline/BanknotesIcon";

import { loadStripeOnramp } from "@stripe/crypto";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/components/iconComponents";
import { useSession } from "next-auth/react";
import { selectPublicAddress } from "@/lib/slices/appSlice";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import { useTheme } from "next-themes";
import { useSelector, useDispatch } from "react-redux";
import {
  selectOnrampModal,
  openOnramp,
  closeOnramp,
} from "@/lib/slices/appSlice";

const OnrampModal = dynamic(() => import("@/components/modals/OnrampModal"), {
  ssr: false,
});

type Props = {
  close?: () => void;
};

function AddFunds({ close }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const { candyMachines, fetchCandyMachineById, getUserBalance } =
    useMetaplex();
  const [open, setOpen] = useState(false);

  const { data: session } = useSession();
  // const [message, setMessage] = useState("");
  const [loading, setIsLoading] = useState(false);

  return (
    <div className="flex w-fit flex-col items-center space-x-3 space-y-2">
      <div
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={() => dispatch(openOnramp())}
        className="flex cursor-pointer items-center rounded-md border border-border-gray   px-2 py-1 text-xs text-primary-500 hover:text-primary-700"
      >
        <MoneyIcon className="mr-2 h-4 w-4" />
        Add Funds
      </div>
    </div>
  );
}

export default AddFunds;
