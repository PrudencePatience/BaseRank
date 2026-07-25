import type { EIP1193Provider } from "viem";

export type WalletKind = "okx" | "metamask";

export type ProviderLike = EIP1193Provider & {
  providers?: ProviderLike[];
  ethereum?: ProviderLike;
  isMetaMask?: boolean;
  isOkxWallet?: boolean;
  isOKExWallet?: boolean;
  isCoinbaseWallet?: boolean;
  info?: { name?: string; rdns?: string; uuid?: string };
};

export function isProvider(value: unknown): value is ProviderLike {
  return Boolean(value && typeof value === "object" && "request" in value);
}

export function hasOkxSignal(provider: ProviderLike): boolean {
  const name = provider.info?.name?.toLowerCase() ?? "";
  const rdns = provider.info?.rdns?.toLowerCase() ?? "";
  return Boolean(provider.isOkxWallet || provider.isOKExWallet || name.includes("okx") || name.includes("okex") || rdns.includes("okx") || rdns.includes("okex"));
}

export function hasMetaMaskSignal(provider: ProviderLike): boolean {
  const rdns = provider.info?.rdns?.toLowerCase() ?? "";
  return Boolean(provider.isMetaMask && !hasOkxSignal(provider) && !provider.isCoinbaseWallet && !rdns.includes("okx") && !rdns.includes("coinbase"));
}

export function selectWalletProvider(providers: ProviderLike[], kind: WalletKind): EIP1193Provider | undefined {
  const matcher = kind === "okx" ? hasOkxSignal : hasMetaMaskSignal;
  return providers.find(matcher);
}
