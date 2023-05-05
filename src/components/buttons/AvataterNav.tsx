/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Avatar from "@/components/avatar/Avatar";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { signOut, useSession } from "next-auth/react";
import { api } from "@/utils/api";
import Typography from "@/components/typography";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { routes } from "@/utils/constants";

function AvataterNav() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { disconnect } = useWallet();

  const { data, isLoading } = api.user.myProfile.useQuery(undefined, {
    enabled: !!session,
    staleTime: 1000 * 10,
  });

  const handleLogout = async () => {
    void disconnect();
    await signOut();
    return;
  };
  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full">
            <Avatar
              username={(data?.walletAddress as string) || "user"}
              alt="User profile menu dropdown"
              widthNumber={50}
              heightNumber={50}
              fill
              loading={isLoading}
              type="squircle"
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
                username={(data?.walletAddress as string) || "user"}
                alt="User profile menu dropdown"
                widthNumber={40}
                heightNumber={40}
                // fill
                loading={isLoading}
                type="circle"
              />
              <div className="items-center">
                <Typography size="body" className=" font-semibold">
                  {data?.name ||
                    data?.firstName ||
                    `${data?.walletAddress?.slice(
                      0,
                      5
                    )}...${data?.walletAddress.slice(-4)}`}
                </Typography>
              </div>
            </div>
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <button
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
                    Your Profile
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
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
                    My Favs
                  </button>
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
