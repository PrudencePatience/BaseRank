"use client";

import { coinbaseWallet, injected } from "wagmi/connectors";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { metaMaskTarget, okxTarget } from "@/lib/walletProviders";

const rawDataSuffix = process.env.NEXT_PUBLIC_DATA_SUFFIX;
export const dataSuffix = rawDataSuffix?.startsWith("0x") ? (rawDataSuffix as `0x${string}`) : undefined;

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
  transports: {
    [base.id]: http()
  }
});
