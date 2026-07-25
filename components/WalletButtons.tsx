"use client";

import { Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { coinbaseConnector, metaMaskConnector, okxConnector } from "@/lib/wagmi";
import { findWalletProvider, setupEip6963Discovery } from "@/lib/walletProviders";
import { shortAddress } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";

type WalletButtonsProps = {
  onError: (message: string) => void;
};

export function WalletButtons({ onError }: WalletButtonsProps) {
  const { address, isConnected } = useAccount();
  const { connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setupEip6963Discovery();
    const refresh = () => setTick((value) => value + 1);
    window.addEventListener("eip6963:announceProvider", refresh);
    const timer = window.setTimeout(refresh, 400);
    return () => {
      window.removeEventListener("eip6963:announceProvider", refresh);
      window.clearTimeout(timer);
    };
  }, []);

  const okxDetected = Boolean(findWalletProvider("okx"));
  const metaMaskDetected = Boolean(findWalletProvider("metamask"));
  void tick;

  async function connectWallet(kind: "okx" | "metamask" | "coinbase") {
    try {
      if (kind === "okx") {
        if (!findWalletProvider("okx")) {
          onError("OKX Wallet not detected.");
          return;
        }
        await connectAsync({ connector: okxConnector });
        return;
      }

      if (kind === "metamask") {
        if (!findWalletProvider("metamask")) {
          onError("MetaMask not detected.");
          return;
        }
        await connectAsync({ connector: metaMaskConnector });
        return;
      }

      await connectAsync({ connector: coinbaseConnector });
    } catch (error) {
      onError(getErrorMessage(error, "Wallet connection failed."));
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-silver">{shortAddress(address)}</div>
        <button
          aria-label="Disconnect wallet"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white/5 text-silver hover:bg-white/10"
          onClick={() => disconnect()}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <button
        className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-3 text-sm font-semibold text-[#f7f2e8] hover:border-gold/60 disabled:opacity-60"
        disabled={isPending}
        onClick={() => connectWallet("okx")}
      >
        <Wallet className="h-4 w-4 text-gold" />
        OKX Wallet
      </button>
      <button
        className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-3 text-sm font-semibold text-[#f7f2e8] hover:border-silver/70 disabled:opacity-60"
        disabled={isPending}
        onClick={() => connectWallet("metamask")}
      >
        <Wallet className="h-4 w-4 text-silver" />
        MetaMask
      </button>
      <button
        className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-3 text-sm font-semibold text-[#f7f2e8] hover:border-mint/70 disabled:opacity-60"
        disabled={isPending}
        onClick={() => connectWallet("coinbase")}
      >
        <Wallet className="h-4 w-4 text-mint" />
        Coinbase Wallet
      </button>
      <span className="sr-only">OKX detected: {String(okxDetected)}. MetaMask detected: {String(metaMaskDetected)}.</span>
    </div>
  );
}
