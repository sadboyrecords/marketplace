import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { type AppSession } from "@/utils/types";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/errorHandling/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import MainLayout from "@/components/layouts/MainLayout";
import Web3Provider from "@/components/providers/WalletProvider";
import { MetaplexProvider } from "@/components/providers/MetaplexProvider";
import "react-toastify/dist/ReactToastify.css";

import { api } from "@/utils/api";

import "@/styles/globals.css";

const MyApp: AppType<{ session: AppSession | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <ThemeProvider defaultTheme="dark">
          <Web3Provider>
            <MainLayout>
              <MetaplexProvider>
                <Component {...pageProps} />
              </MetaplexProvider>
            </MainLayout>
          </Web3Provider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default api.withTRPC(MyApp);
