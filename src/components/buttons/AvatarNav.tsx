/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Avatar from "@/components/avatar/Avatar";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { api } from "@/utils/api";
import Typography from "@/components/typography";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { useMetaplex } from "../providers/MetaplexProvider";
import { SolIcon, UsdcIcon } from "../iconComponents";
import { DocumentDuplicateIcon as CopyIcon } from "@heroicons/react/24/outline";
import { magic } from "@/lib/magic";
import { selectPublicAddress } from "@/lib/slices/appSlice";
import { useSelector } from "react-redux";
// import dynamic from "next/dynamic";

// const AddFunds = dynamic(() => import("@/components/onRamp/AddFunds"), {
//   ssr: false,
// });

// import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon";

function AvatarNav() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { disconnect } = useWallet();
  const { walletBalance, usdcInfo } = useMetaplex();
  const [copied, setCopied] = useState<boolean>();
  const [copiedUsdc, setCopiedUsdc] = useState<boolean>();

  const { data, isLoading } = api.user.myProfile.useQuery(undefined, {
    enabled: !!session,
    staleTime: 1000 * 10,
  });
  const publicAddress = useSelector(selectPublicAddress);

  const handleCopy = (address: string) => {
    if (!address) return;
    navigator.clipboard
      .writeText(address)
      .then(() => {
        if (address === publicAddress) setCopied(true);
        if (address !== publicAddress) setCopiedUsdc(true);

        setTimeout(() => {
          setCopied(false);
        }, 1000); // Set timeout for 3 seconds (3000 milliseconds)
      })
      .catch((error) => {
        console.error("Error copying text to clipboard:", error);
      });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1000); // Set timeout for 3 seconds (3000 milliseconds)

      return () => {
        clearTimeout(timer);
      };
    }
  }, [copied]);

  const handleLogout = async () => {
    void disconnect();
    await signOut();
    if (magic) await magic.user.logout();
    // await magic.user.logout();
    return;
  };
  return (
    <Menu id="avatar-nav" as="div" className="relative inline-block text-left">
      {/* <div> */}
      <Menu.Button
        className="inline-flex w-full"
        // onClick={() => setIsOpen(true)}
      >
        <Avatar
          src={data?.profilePictureImage || undefined}
          username={(data?.walletAddress as string) || "user"}
          alt="User profile menu dropdown"
          widthNumber={50}
          heightNumber={50}
          fill
          loading={isLoading}
          type="squircle"
          imageHash={data?.profilePictureHash || undefined}
          path={data?.pinnedProfilePicture?.path}
          sizes="50px"
          pinnedStatus={data?.pinnedProfilePicture?.status}
        />
      </Menu.Button>
      {/* </div> */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        // show={isOpen}
        key="avatar-nav"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 max-w-xs origin-top-right divide-y divide-border-gray rounded-md bg-base-100 shadow-lg ring-1 ring-border-gray ring-opacity-5 focus:outline-none ">
          <div className="flex flex-col space-y-2 px-2 py-4">
            <div className="flex items-center space-x-3  ">
              <Avatar
                src={data?.profilePictureImage || undefined}
                username={(data?.walletAddress as string) || "user"}
                alt="User profile menu dropdown"
                widthNumber={40}
                heightNumber={40}
                fill
                loading={isLoading}
                type="circle"
                imageHash={data?.profilePictureHash || undefined}
                path={data?.pinnedProfilePicture?.path}
                sizes="50px"
                pinnedStatus={data?.pinnedProfilePicture?.status}
              />
              {!publicAddress && <div className="loading btn-ghost btn" />}
              {publicAddress && (
                <div className="items-center">
                  <Typography size="body" className=" font-semibold">
                    {data?.name ||
                      data?.firstName ||
                      (publicAddress &&
                        `${publicAddress?.slice(0, 5)}...${publicAddress?.slice(
                          -4
                        )}`) ||
                      ""}
                  </Typography>
                  <div
                    className={`${
                      copied ? "tooltip-open tooltip tooltip-bottom" : ""
                    }  cursor-pointer`}
                    data-tip="Copied"
                    onClick={() => handleCopy(publicAddress)}
                  >
                    <Typography
                      type="div"
                      size="body-xs"
                      color="neutral-gray"
                      className="flex"
                    >
                      {publicAddress &&
                        `${publicAddress?.slice(0, 5)}...${publicAddress.slice(
                          -4
                        )}`}
                      <CopyIcon className="ml-1 h-4 w-7" />
                    </Typography>
                  </div>
                  <div
                    className={`${
                      copiedUsdc ? "tooltip-open tooltip tooltip-bottom" : ""
                    }  cursor-pointer`}
                    data-tip="Copied"
                    onClick={
                      usdcInfo?.address
                        ? () => handleCopy(usdcInfo?.address)
                        : undefined
                    }
                  >
                    {usdcInfo && (
                      <Typography
                        type="div"
                        size="body-xs"
                        color="neutral-gray"
                        className="flex"
                      >
                        {publicAddress &&
                          `${usdcInfo?.address?.slice(
                            0,
                            5
                          )}...${usdcInfo?.address.slice(-4)} `}
                        (USDC)
                        <CopyIcon className="ml-1 h-4 w-7" />
                      </Typography>
                    )}
                  </div>
                  {data?.email && (
                    <Typography
                      type="div"
                      size="body-xs"
                      color="neutral-gray"
                      className="flex"
                    >
                      {data?.email}
                    </Typography>
                  )}
                </div>
              )}
            </div>
            <Menu.Item>
              {({}) => (
                <div className="flex items-start justify-between">
                  <div className="flex flex-col justify-between px-1 py-1">
                    <Typography color="neutral-content" size="body-xs">
                      SOL Wallet Balance
                    </Typography>
                    <div className="flex items-center  justify-between">
                      <div className="flex items-center space-x-1">
                        <SolIcon className="h-4 w-4" />
                        <Typography size="body-lg" className="font-bold">
                          {walletBalance?.toFixed(2)} SOL
                        </Typography>
                      </div>
                      {/* <div>
                      <AddFunds close={close} />
                    </div> */}
                    </div>
                  </div>
                  {usdcInfo && (
                    <div className="flex flex-col justify-between px-1 py-1">
                      <Typography color="neutral-content" size="body-xs">
                        USDC Balance
                      </Typography>
                      <div className="flex items-center  justify-between">
                        <div className="flex items-center space-x-1">
                          <UsdcIcon className="h-8 w-8" />
                          <Typography size="body-lg" className="font-bold">
                            {usdcInfo?.balance?.toFixed(2)} USDC
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Menu.Item>
          </div>

          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={routes.userProfile(data?.walletAddress || "")}
                  className={`${
                    active ? "bg-primary-500 text-white" : "text-base-content"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  {/* {active ? (
                      <EditActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <EditInactiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    )} */}
                  Profile
                </Link>
              )}
            </Menu.Item>
          </div>
          {session?.user?.isAdmin && (
            <div className="px-1 py-1 ">
              <Typography
                size="body-xs"
                className="px-2 py-2 font-bold tracking-wide"
              >
                Admin Panel
              </Typography>
              {/* <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={routes.admin}
                      className={`${
                        active
                          ? "bg-primary-500 text-white"
                          : "text-base-content"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      // onClick={handleLogout}
                    >
                      Admin Home
                    </Link>
                  )}
                </Menu.Item> */}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={routes.allBattlesAdminView}
                    className={`${
                      active ? "bg-primary-500 text-white" : "text-base-content"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    // onClick={handleLogout}
                  >
                    View All Battles
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={routes.createBattle}
                    className={`${
                      active ? "bg-primary-500 text-white" : "text-base-content"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    // onClick={handleLogout}
                  >
                    Create a new battle
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={routes.lookupTable}
                    className={`${
                      active ? "bg-primary-500 text-white" : "text-base-content"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    // onClick={handleLogout}
                  >
                    Lookup table
                  </Link>
                )}
              </Menu.Item>
            </div>
          )}
          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-primary-500 text-white" : "text-base-content"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default AvatarNav;
