/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* @ts-ignore */
import React from "react";
import { useTheme } from "next-themes";
import { type StripeOnramp } from "@stripe/crypto";

// ReactContext to simplify access of StripeOnramp object
const CryptoElementsContext = React.createContext(null);
CryptoElementsContext.displayName = "CryptoElementsContext";

type CryptoElementsContextType = {
  stripeOnramp: Promise<StripeOnramp | null>;
  children: React.ReactNode;
};

export const CryptoElements = ({
  stripeOnramp,
  children,
}: CryptoElementsContextType) => {
  const [ctx, setContext] = React.useState(() => ({
    onramp: null,
  }));

  React.useEffect(() => {
    let isMounted = true;

    void Promise.resolve(stripeOnramp).then((onramp) => {
      if (onramp && isMounted) {
        // @ts-ignore
        setContext((ctx) => (ctx.onramp ? ctx : { onramp }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripeOnramp]);

  return (
    // @ts-ignore
    <CryptoElementsContext.Provider value={ctx}>
      {children}
    </CryptoElementsContext.Provider>
  );
};

// React hook to get StripeOnramp from context
export const useStripeOnramp = () => {
  const context = React.useContext(CryptoElementsContext);
  // @ts-ignore
  return context?.onramp;
};

// React element to render Onramp UI
const useOnrampSessionListener = (
  type: unknown,
  session: unknown,
  callback: unknown
) => {
  React.useEffect(() => {
    if (session && callback) {
      // @ts-ignore
      const listener = (e: { payload: any }) => callback(e.payload);
      // @ts-ignore
      session.addEventListener(type, listener);
      return () => {
        // @ts-ignore
        session.removeEventListener(type, listener);
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, [session, callback, type]);
};

export const OnrampElement = ({
  // @ts-ignore
  clientSecret,
  // @ts-ignore
  onReady,
  // @ts-ignore
  onChange,
  ...props
}) => {
  const stripeOnramp = useStripeOnramp();
  const onrampElementRef = React.useRef(null);
  const [session, setSession] = React.useState();
  const { theme } = useTheme();

  // const appearanceJSON = JSON.stringify(appearance);
  React.useEffect(() => {
    const containerRef = onrampElementRef.current;
    if (containerRef) {
      // NB: ideally we want to be able to hot swap/update onramp iframe
      // This currently results a flash if one needs to mint a new session when they need to udpate fixed transaction details
      // containerRef.innerHTML = "";

      if (clientSecret && stripeOnramp) {
        setSession(
          stripeOnramp
            .createSession({
              clientSecret,
              appearance: {
                theme: theme === "dark" ? "dark" : "light",
              },
              // appearance: appearanceJSON ? JSON.parse(appearanceJSON) : {},
            })
            .mount(containerRef)
        );
      }
    }
  }, [clientSecret, stripeOnramp]);

  useOnrampSessionListener("onramp_ui_loaded", session, onReady);
  useOnrampSessionListener("onramp_session_updated", session, onChange);

  return <div {...props} ref={onrampElementRef}></div>;
};
