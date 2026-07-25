import type { EIP1193Provider } from "viem";
import { isProvider, ProviderLike, selectWalletProvider, WalletKind } from "@/lib/walletProviderCore";

export type { WalletKind } from "@/lib/walletProviderCore";

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: ProviderLike;
    okxWallet?: ProviderLike;
  }
}

const eip6963Providers = new Map<string, ProviderLike>();
let eip6963Listening = false;

function getProviderId(provider: ProviderLike, index: number): string {
  const rdns = (provider as { info?: { rdns?: string } }).info?.rdns;
  const uuid = (provider as { info?: { uuid?: string } }).info?.uuid;
  return `${rdns ?? "provider"}:${uuid ?? index}`;
}

export function setupEip6963Discovery() {
  if (typeof window === "undefined" || eip6963Listening) return;

  window.addEventListener("eip6963:announceProvider", (event) => {
    const detail = (event as CustomEvent<{ provider?: ProviderLike; info?: { rdns?: string; uuid?: string } }>).detail;
    if (detail?.provider && isProvider(detail.provider)) {
      const enriched = Object.assign(detail.provider, { info: detail.info });
      eip6963Providers.set(getProviderId(enriched, eip6963Providers.size), enriched);
    }
  });

  eip6963Listening = true;
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

function collectProviders(): ProviderLike[] {
  if (typeof window === "undefined") return [];
  setupEip6963Discovery();

  const candidates: unknown[] = [
    window.okxwallet,
    window.okxwallet?.ethereum,
    window.okxWallet,
    window.okxWallet?.ethereum,
    ...(window.ethereum?.providers ?? []),
    window.ethereum,
    ...Array.from(eip6963Providers.values())
  ];

  const seen = new Set<ProviderLike>();
  return candidates.filter((candidate): candidate is ProviderLike => {
    if (!isProvider(candidate) || seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });
}

export function findWalletProvider(kind: WalletKind): EIP1193Provider | undefined {
  return selectWalletProvider(collectProviders(), kind);
}

export function isWalletDetected(kind: WalletKind): boolean {
  return Boolean(findWalletProvider(kind));
}

export const okxTarget = {
  id: "okx-wallet",
  name: "OKX Wallet",
  provider: () => findWalletProvider("okx")
};

export const metaMaskTarget = {
  id: "metamask",
  name: "MetaMask",
  provider: () => findWalletProvider("metamask")
};
