import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/errorHandling/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import MainLayout from "@/components/layouts/MainLayout";
import Web3Provider from "@/components/providers/WalletProvider";
import { MetaplexProvider } from "@/components/providers/MetaplexProvider";
import { store } from "@/lib/store";
import { Provider } from "react-redux";
import MarginLayout from "@/components/layouts/MarginLayout";
import dynamic from "next/dynamic";
import { type AppType } from "next/app";

// import { type Session } from "next-auth";
import { type AppSession, type NextPageWithLayout } from "@/utils/types";

import { api } from "@/utils/api";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";

const PlayerBar = dynamic(() => import("@/components/player/PlayerBar"), {
  ssr: false,
});

const MyApp: AppType<{ session: AppSession | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const getLayout =
    (Component as NextPageWithLayout).getLayout ??
    ((page) => <MarginLayout>{page}</MarginLayout>);

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <ThemeProvider defaultTheme="dark">
          <Web3Provider>
            <Provider store={store}>
              <MetaplexProvider>
                <MainLayout>
                  {getLayout(<Component {...pageProps} />)}
                </MainLayout>
                <PlayerBar />
              </MetaplexProvider>
            </Provider>
          </Web3Provider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default api.withTRPC(MyApp);
