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
import { SolIcon } from "../iconComponents";
import { DocumentDuplicateIcon as CopyIcon } from "@heroicons/react/24/outline";
import { magic } from "@/lib/magic";
import { authProviderNames } from "@/utils/constants";
import { selectPublicAddress, setPublicAddress } from "@/lib/slices/appSlice";
import { useSelector, useDispatch } from "react-redux";

// import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon";

function AvataterNav() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { disconnect } = useWallet();
  const { getUserBalance, walletBalance } = useMetaplex();
  const [copied, setCopied] = useState<boolean>();

  const { data, isLoading } = api.user.myProfile.useQuery(undefined, {
    enabled: !!session,
    staleTime: 1000 * 10,
  });
  const publicAddress = useSelector(selectPublicAddress);
  const dispatch = useDispatch();

  // const testMagic = async () => {
  //   if (!magic) return;
  //   const pubKey = await magic.wallet?.getInfo();
  //   const idToken = await magic.user.getIdToken();
  //   const userinfo = await magic.user.getInfo();
  //   //  magic.user.
  //   console.log({ pubKey, idToken, userinfo });
  // };

  const updateUserMutation = api.user.updateUser.useMutation();

  useEffect(() => {
    if (session) {
      if (data?.magicSolanaAddress) {
        dispatch(setPublicAddress(data?.magicSolanaAddress));
      }
      if (session?.user?.provider === authProviderNames.magic) {
        if (!magic) return;
        void magic?.user.isLoggedIn().then((isLoggedIn) => {
          // console.log({ isLoggedIn });
          if (isLoggedIn) {
            if (!magic) return;
            // testMagic();
            void magic?.user.getInfo().then((user) => {
              // console.log({ user });
              dispatch(setPublicAddress(user?.publicAddress as string));
              void getUserBalance(user?.publicAddress as string);
              if (data && !data?.magicSolanaAddress) {
                // need this because the back end call doesn't provide SOlana wallet. provides eth only wallet. This will be the default wallet but we still need the solana wallet
                updateUserMutation.mutate({
                  magicSolanaAddress: user?.publicAddress as string,
                  walletAddress: session?.user?.walletAddress,
                });
              }
            });
          }
          if (!isLoggedIn) {
            void signOut();
          }
        });
      } else {
        dispatch(setPublicAddress(session.user.walletAddress as string));
        void getUserBalance();
      }
    }
  }, [
    getUserBalance,
    session,
    dispatch,
    data?.magicSolanaAddress,
    updateUserMutation,
  ]);

  const handleCopy = () => {
    if (!publicAddress) return;
    navigator.clipboard
      .writeText(publicAddress)
      .then(() => {
        setCopied(true);
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
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full">
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
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-border-gray rounded-md bg-base-100 shadow-lg ring-1 ring-border-gray ring-opacity-5 focus:outline-none">
            <div className="flex items-center space-x-3 px-2 py-4">
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
                    onClick={handleCopy}
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

                      <CopyIcon className="ml-1 h-4 w-4" />
                      <div className="ml-2 flex items-center space-x-1">
                        {" "}
                        (<SolIcon className="mr-1 h-[0.6rem] w-[0.6rem]" />
                        {walletBalance} )
                      </div>
                    </Typography>
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
                        active
                          ? "bg-primary-500 text-white"
                          : "text-base-content"
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
                        active
                          ? "bg-primary-500 text-white"
                          : "text-base-content"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      // onClick={handleLogout}
                    >
                      Create a new battle
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
    </div>
  );
}

export default AvataterNav;