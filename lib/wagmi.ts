"use client";

import { coinbaseWallet, injected } from "wagmi/connectors";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";
import { metaMaskTarget, okxTarget } from "@/lib/walletProviders";

export const okxConnector = injected({
  target: okxTarget,
  shimDisconnect: true
});

export const metaMaskConnector = injected({
  target: metaMaskTarget,
  shimDisconnect: true
});

export const coinbaseConnector = coinbaseWallet({
  appName: "BaseRank",
  preference: { options: "eoaOnly" }
});

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [okxConnector, metaMaskConnector, coinbaseConnector],
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [base.id]: http()
  }
});
