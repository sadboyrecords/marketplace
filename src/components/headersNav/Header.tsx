import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
// import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
// import Avatar from "components/Avatar";
// import SearchBar from 'components/SearchBar';
import dynamic from "next/dynamic";
import { routes } from "@/utils/constants";
import Link from "next/link";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
// import { useDarkMode } from "providers/DarkMode";
import { useWallet } from "@solana/wallet-adapter-react";
// import { trpc } from "utils/trpc";
// import useHandleAuth from "hooks/useHandleAuth";
// import { ipfsUrl } from 'utils/helpers';
import { useTheme } from "next-themes";

import { useRouter } from "next/router";
import React from "react";
import WalletAdaptor from "@/components/buttons/WalletAdaptor";

// const WalletButton = dynamic(() => import("components/WalletButton"), {
//   ssr: false,
// });

function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (arg0: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useMemo(() => setMounted(true), []);

  //   const { connectingWallet } = useHandleAuth();
  //   const { publicKey, disconnect } = useWallet();

  //   const { data: userTRPC } = trpc.user.getUser.useQuery(
  //     {
  //       publicKey: publicKey?.toBase58() || "",
  //     },
  //     {
  //       enabled: !!publicKey,
  //     }
  //   );

  //   const handleModeChange = () => {
  //     setDarkMode(!darkMode);
  //   };

  const router = useRouter();
  //   const handleLogout = async () => {
  //     await fetch(`/api/auth`);
  //     await disconnect();
  //     router.reload();
  //   };

  //   const userNavigation = [
  //     {
  //       name: "Your Profile",
  //       href: routes.userProfile(publicKey?.toBase58() || ""),
  //     },
  //     //   { name: 'Settings', href: '#' },
  //     { name: "Sign out", href: "#", onClick: handleLogout },
  //   ];

  return (
    <>
      {/* sticky top-0  */}
      <div className="sticky top-0 z-10  bg-gradient-to-b from-black px-4">
        {/* bg-base-100 */}
        <div className="mx-auto flex h-20 max-w-7xl">
          {/* */}
          <button
            type="button"
            className=" px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              {/* <form className="flex w-full lg:ml-0" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <MagnifyingGlassIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="search-field"
                    className="block bg-base-100 h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="Search"
                    type="search"
                    name="search"
                  />
                </div>
              </form> */}
            </div>
            <div className="ml-4 flex items-center space-x-2 lg:ml-6">
              {/* <button
              type="button"
              className="rounded-full bg-base-100 p-3 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            > */}
              {/* <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" /> */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  type="button"
                  className="rounded-full  p-1 text-gray-600  backdrop-blur hover:text-gray-800/60 "
                  // bg-white/20
                >
                  {theme === "light" ? (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              )}
              <WalletAdaptor />
              {/* {publicKey && userTRPC ? (
                <>
                  Profile dropdown or wallet connect
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex max-w-xs items-center rounded-full bg-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <Avatar
                          width="32px"
                          height="32px"
                          widthNumber={32}
                          heightNumber={32}
                          layout="fixed"
                          src={userTRPC?.profilePictureImage || ""}
                          imageHash={userTRPC?.profilePictureHash || ""}
                          alt={userTRPC?.firstName || ""}
                          path={userTRPC?.pinnedProfilePicture?.path || ""}
                          pinnedStatus={userTRPC?.pinnedProfilePicture?.status}
                          username={
                            userTRPC?.firstName ||
                            userTRPC?.walletAddress ||
                            "unknown"
                          }
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-base-100 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <>
                                {item.onClick ? (
                                  <>
                                    <button
                                      onClick={item.onClick}
                                      className={classNames(
                                        active
                                          ? "bg-primary text-primary-content"
                                          : "",
                                        "block px-4 py-2 text-sm text-neutral-content"
                                      )}
                                    >
                                      {item.name}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <Link href={item.href}>
                                      <a
                                        className={classNames(
                                          active
                                            ? "bg-primary text-primary-content"
                                            : "",
                                          "block px-4 py-2 text-sm text-neutral-content"
                                        )}
                                      >
                                        {item.name}
                                      </a>
                                    </Link>
                                  </>
                                )}
                              </>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </>
              ) : (
                <>
                  <div>
                    <WalletButton loading={connectingWallet} />
                  </div>
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
