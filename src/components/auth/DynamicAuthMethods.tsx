import Typography from "@/components/typography";
import { useWallet } from "@solana/wallet-adapter-react";
import Input from "@/components/formFields/Input";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { magic } from "@/lib/magic";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { close } from "@/lib/slices/appSlice";

type FormValues = {
  email: string;
};
function DynamicAuthMethods() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { wallets, select } = useWallet();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const [loading, setLoading] = useState(false);

  const sortedWallets = wallets.sort((a, b) => {
    if (a.readyState === "Installed" && b.readyState !== "Installed") {
      return -1;
    } else if (a.readyState !== "Installed" && b.readyState === "Installed") {
      return 1;
    } else {
      return 0;
    }
  });
  const dispatch = useDispatch();

  const submit = async (data: FormValues) => {
    if (!magic) {
      toast.error("There was an error");
      return;
    }
    console.log({ data });
    try {
      setLoading(true);
      const didToken = await magic.auth.loginWithEmailOTP({
        email: data.email,
        showUI: true,
      });

      console.log({ didToken });
      const resp = await signIn("magic-link", {
        didToken,
        callbackUrl: window.location.href,
        redirect: false,
      });
      console.log({ resp });
      const token = await magic.user.getIdToken();
      console.log({ token });
      const authtokeSet = await magic.auth.setAuthorizationToken(token);
      console.log({ authtokeSet });
      setLoading(false);
      dispatch(close());
    } catch (error) {
      console.log({ error });
      toast.error("There was an error logging in");
      setLoading(false);
    }
  };
  return (
    <div className="flex w-full flex-col space-y-4">
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(submit)}
        className="flex flex-col space-y-3 "
      >
        <Input
          placeholder="Enter your email"
          type="email"
          error={!!errors?.email}
          errorMessage={(errors?.email?.message as string) || ""}
          inputProps={register("email", {
            required: "You must provide a valid email address",
          })}
        />
        <button
          // onClick={() => select(wallet.adapter.name)}
          className=" flex  h-12 w-full items-center justify-center rounded-md bg-base-300 p-4 hover:bg-base-300/70"
        >
          <div className="flex items-center space-x-2">
            {loading && <div className="loading btn-ghost btn p-0" />}

            <Typography type="div" size="body" className=" font-bold ">
              Continue
            </Typography>
          </div>
        </button>
      </form>

      <div className="flex items-center space-x-3">
        <div className="h-[0.08rem] flex-1 bg-border-gray" />
        <Typography size="body-xs" color="neutral-gray" className="font-bold ">
          Or Continue with
        </Typography>
        <div className="h-[0.08rem] flex-1 bg-border-gray" />
      </div>
      <div className="flex flex-col space-y-2 ">
        {sortedWallets.map((wallet) => (
          <button
            onClick={() => select(wallet.adapter.name)}
            key={wallet.adapter.name}
            className="flex h-12 items-center justify-between rounded-md bg-base-300 p-4 text-left hover:bg-base-300/70"
          >
            <div className="flex items-center space-x-2">
              <span className="relative mr-3 h-8 w-8">
                <Image src={wallet.adapter.icon} fill alt="wallet icons" />
                {/* width={20} height={20}  */}
              </span>
              <Typography
                size="body"
                // color="neutral-gray"
                className="font-bold "
              >
                {wallet.adapter.name}
              </Typography>
            </div>
            {wallet.readyState === "Installed" && (
              <div className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-neutral-content ring-1 ring-inset ring-gray-500/10">
                Installed
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DynamicAuthMethods;
