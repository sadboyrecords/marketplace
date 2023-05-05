import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import HomeIcon from "@heroicons/react/24/outline/HomeIcon";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import MusicalNoteIcon from "@heroicons/react/24/outline/MusicalNoteIcon";
import NewspaperIcon from "@heroicons/react/24/outline/NewspaperIcon";
import HeartIcon from "@heroicons/react/24/outline/HeartIcon";
import FireIcon from "@heroicons/react/24/outline/FireIcon";
import DeviceTabletIcon from "@heroicons/react/24/outline/DeviceTabletIcon";
import QueueListIcon from "@heroicons/react/24/solid/QueueListIcon";
import InformationCircleIcon from "@heroicons/react/24/solid/InformationCircleIcon";
import ShieldCheckIcon from "@heroicons/react/24/solid/ShieldCheckIcon";
import { ToastContainer } from "react-toastify";
import Image from "next/image";
import Header from "@/components/headersNav/Header";
import Typography from "@/components/typography";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  routes,
  hashRoutes,
  tabMenuRoutes,
  addresses,
} from "@/utils/constants";
import { useTheme } from "next-themes";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
// import { useWallet } from '@solana/wallet-adapter-react';
// import { trpc } from 'utils/trpc';
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navigation = [
  {
    name: "Home",
    href: routes.home,
    icon: HomeIcon,
    current: false,
    hidden: false,
  },
  {
    name: "Creators",
    href: routes.artists,
    icon: UsersIcon,
    current: false,
    hidden: false,
  },
  {
    name: "Playlists",
    href: routes.playlists,
    icon: NewspaperIcon,
    current: false,
    hidden: false,
  },
  {
    name: "Songs",
    href: routes.songs,
    icon: MusicalNoteIcon,
    current: false,
    hidden: false,
  },
  //   { name: 'Collections', href: '#', icon: FolderIcon, current: false },
  {
    name: "Drops",
    href: routes.drops,
    icon: FireIcon,
    current: false,
    // hidden: process.env.NEXT_PUBLIC_ENV === 'prod',
  },
  {
    name: "Listings",
    href: routes.listings,
    icon: QueueListIcon,
    current: false,
    // hidden: process.env.NEXT_PUBLIC_ENV === 'prod',
  },
  // { name: 'Favourites', href: '#', icon: StarIcon, current: false },
];

interface LayoutProps {
  children: React.ReactNode;
}

const user = null;
const publicKey = null;

function NavSection() {
  const router = useRouter();
  const { publicKey } = useWallet();
  //   const { data: user } = trpc.user.adminUser.useQuery();
  //   console.log({ user });
  const userLibrary = [
    {
      name: "Created Playlists",
      href: `${routes.userProfile(publicKey?.toBase58() || "")}#${
        hashRoutes.userProfilesHashRouteNames[
          tabMenuRoutes.userProfileTabPages.CREATED_PLAYLISTS
        ]
      }`,
      icon: NewspaperIcon,
      current: false,
    },
    {
      name: "Liked Playlists",
      href: `${routes.userProfile(publicKey?.toBase58() || "")}#${
        hashRoutes.userProfilesHashRouteNames[
          tabMenuRoutes.userProfileTabPages.LIKED_PLAYLISTS
        ]
      }`,
      icon: HeartIcon,
      current: false,
    },
    {
      name: "Liked Songs",
      href: `${routes.userProfile(publicKey?.toBase58() || "")}#${
        hashRoutes.userProfilesHashRouteNames[
          tabMenuRoutes.userProfileTabPages.LIKED_TRACKS
        ]
      }`,
      icon: MusicalNoteIcon,
      current: false,
    },
    {
      name: "Owned Nfts",
      href: `${routes.userTokens(publicKey?.toBase58() || "")}`,
      icon: DeviceTabletIcon,
      current: false,
    },
    {
      name: "Drafts",
      href: `${routes.userDrafts(publicKey?.toBase58() || "")}`,
      icon: InformationCircleIcon,
      current: false,
      hidden: !addresses.allowedWallets.find(
        (a) => a === publicKey?.toBase58()
      ),
    },
    {
      name: "Admin",
      href: `${routes.admin}`,
      icon: ShieldCheckIcon,
      current: false,
      hidden: !user?.isAdmin,
    },
  ];

  const adminSection = [
    {
      name: "Admin Home",
      href: `${routes.admin}`,
      icon: ShieldCheckIcon,
      current: false,
      hidden: !user?.isAdmin,
    },
  ];
  {
    /* Your Library - Likes, playlist 
                Discover - Creators, Playlists, Songs, Collections, Drops  
                Launch new drop
                - 
              Home, artstis, playlists, songs, tokens, drops, Launch drop */
  }
  return (
    <nav className=" flex-1 space-y-2 px-2 pb-4">
      {/* mx-auto */}
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={classNames(
            router.asPath === item.href
              ? "text-primary-500"
              : "text-neutral-content hover:text-primary-800",
            "group flex items-center rounded-md px-2 py-3 text-sm font-medium"
          )}
        >
          <item.icon
            className={`mr-4 h-5 w-5 flex-shrink-0  ${
              router.asPath === item.href
                ? "text-primary"
                : "text-neutral-content"
            }`}
            aria-hidden="true"
          />
          <Typography
            color={`${
              router.asPath === item.href ? "primary" : "neutral-content"
            }`}
            size="body-sm"
            className="hidden xl:block"
          >
            {item.name}
          </Typography>
        </Link>
      ))}
      {publicKey && (
        <div>
          <Typography size="body-sm" className="mt-5 font-extrabold">
            Your Library
          </Typography>
          <div className="mb-20">
            {userLibrary
              .filter((f) => !f.hidden)
              .map((item) => (
                <Link
                  key={item.name}
                  href={`${item.href}`}
                  className={classNames(
                    router.asPath === item.href
                      ? "text-primary"
                      : "text-neutral-content hover:text-primary",
                    "group flex items-center rounded-md px-2 py-3 text-sm font-medium"
                  )}
                >
                  <item.icon
                    className={`mr-4 h-5 w-5 flex-shrink-0  ${
                      router.asPath === item.href
                        ? "text-primary"
                        : "text-neutral-content"
                    }`}
                    aria-hidden="true"
                  />
                  <Typography
                    color={`${
                      router.asPath === item.href
                        ? "primary"
                        : "neutral-content"
                    }`}
                    size="body-sm"
                  >
                    {item.name}
                  </Typography>
                </Link>
              ))}
          </div>
        </div>
      )}
      {user && user?.isAdmin && (
        <div>
          <Typography size="body-sm" className="mt-5 font-extrabold">
            Admin Section
          </Typography>
          <div className="mb-20">
            {adminSection
              .filter((f) => !f.hidden)
              .map((item) => (
                <Link key={item.name} href={`${item.href}`}>
                  <a
                    className={classNames(
                      router.asPath === item.href
                        ? "text-primary"
                        : "text-neutral-content hover:text-primary",
                      "group flex items-center rounded-md px-2 py-3 text-sm font-medium"
                    )}
                  >
                    <item.icon
                      className={`mr-4 h-5 w-5 flex-shrink-0  ${
                        router.asPath === item.href
                          ? "text-primary"
                          : "text-neutral-content"
                      }`}
                      aria-hidden="true"
                    />
                    <Typography
                      color={`${
                        router.asPath === item.href
                          ? "primary"
                          : "neutral-content"
                      }`}
                      size="body-sm"
                    >
                      {item.name}
                    </Typography>
                  </a>
                </Link>
              ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function MainLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}

      <ToastContainer theme={theme as "dark" | "light"} />
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-base-100 pb-4 pt-5">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute right-0 top-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-content"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-5 w-5 text-neutral-content"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <Link href="/">
                      <Image
                        alt="logo"
                        priority
                        src={
                          theme === "dark"
                            ? "/logo/icon_no_bg_white_1000.png"
                            : "/logo/icon_no_bg_black_1000.png"
                        }
                        width={60}
                        height={60}
                      />
                    </Link>
                  </div>
                  <div className="mx-auto mt-5 h-0 flex-1 overflow-y-auto">
                    <NavSection />
                    {/* <nav className="flex-1 space-y-1 px-2">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-primary text-white'
                              : 'text-indigo-100 hover:bg-indigo-600',
                            'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                          )}
                        >
                          <item.icon
                            className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300"
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </nav> */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="z-40  hidden md:fixed md:inset-y-0 md:flex md:w-14 xl:w-60 xl:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-grow flex-col overflow-y-auto border-r-2 border-base-300/60 border-opacity-20 bg-base-100 pt-5">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/">
                <Image
                  alt="logo"
                  src={
                    theme === "dark"
                      ? "/logo/icon_no_bg_white_1000.png"
                      : "/logo/icon_no_bg_black_1000.png"
                  }
                  width={60}
                  height={60}
                />
              </Link>
            </div>
            <div className="mt-5 flex flex-1 flex-col">
              <NavSection />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col md:pl-14  xl:pl-60">
          {/* header */}
          <Header setSidebarOpen={setSidebarOpen} />

          <main>
            <div className="mx-auto mb-28  max-w-7xl px-4 py-6 sm:px-6 md:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
