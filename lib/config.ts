import { isAddress, zeroAddress } from "viem";

function envValue(name: string, fallback = "") {
  return (process.env[name] || fallback).trim();
}

export const chainId = Number.parseInt(envValue("NEXT_PUBLIC_CHAIN_ID", "8453"), 10);
export const baseAppId = envValue("NEXT_PUBLIC_BASE_APP_ID", "6a641b2d281b6db318994b35");
export const builderCode = envValue("NEXT_PUBLIC_BUILDER_CODE", "bc_unphxn50");
export const configuredDataSuffix = envValue("NEXT_PUBLIC_DATA_SUFFIX");
export const talentProjectVerification = "1024dc2e348330d45cc91aa500afe52a7a0f92cfe6da5e233cefe9325ee485750eb1de3957637c5757b6b1ea8bf451e850e3167ab852f5933eb37a570add8389";

const rawContractAddress = envValue("NEXT_PUBLIC_CONTRACT_ADDRESS", "0xa08EAd22DDa99A87C99E3DE84E13A6556079DE62");
export const contractAddress = isAddress(rawContractAddress) ? rawContractAddress : undefined;
export const emptyAddress = zeroAddress;

export function shortAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function tail(value?: string, chars = 10) {
  if (!value) return "Not configured";
  return value.length > chars ? value.slice(-chars) : value;
}
