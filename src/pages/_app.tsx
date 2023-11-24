import { type AppType } from "next/app";
import { type AppSession, type NextPageWithLayout } from "@/utils/types";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/errorHandling/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { store } from "@/lib/store";
import { Provider } from "react-redux";
import MarginLayout from "@/components/layouts/MarginLayout";
import dynamic from "next/dynamic";
import SeoHead from "@/components/SeoHead";
import { api } from "@/utils/api";
// import { env } from "../env.mjs";
import { GoogleAnalytics } from "nextjs-google-analytics";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";

const MainLayout = dynamic(() => import("@/components/layouts/MainLayout"), {
  ssr: false,
});

const Web3Provider = dynamic(
  () => import("@/components/providers/WalletProvider"),
  {
    ssr: false,
  }
);

const MetaplexProvider = dynamic(
  () => import("@/components/providers/MetaplexProvider"),
  {
    ssr: false,
  }
);

const PlayerBar = dynamic(() => import("@/components/player/PlayerBar"), {
  ssr: false,
});

const JoinBattleFansModal = dynamic(
  () => import("@/components/battleDrops/JoinBattleFansModal"),
  {
    ssr: false,
  }
);

const TopFansModal = dynamic(
  () => import("@/components/battleDrops/TopFansModal"),
  {
    ssr: false,
  }
);

const OnrampModal = dynamic(() => import("@/components/modals/OnrampModal"), {
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
                  <SeoHead />
                  <JoinBattleFansModal />
                  <TopFansModal />
                  <OnrampModal />
                  {getLayout(<Component {...pageProps} />)}
                </MainLayout>
                <PlayerBar />
                <Script
                  async
                  defer
                  src="https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js"
                />
                <GoogleAnalytics trackPageViews />
                {/* <Script
                  strategy="lazyOnload"
                  src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
                />
                <Script strategy="lazyOnload" id="google-script">
                  {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}'); `}
                </Script> */}
                <Script id="tawk">
                  {`
                  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                  (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/6560f4d9ba9fcf18a80ea124/1hg1bot06';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                  })();
                  <!--End of Tawk.to Script-->
                  `}
                </Script>
              </MetaplexProvider>
            </Provider>
          </Web3Provider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default api.withTRPC(MyApp);
