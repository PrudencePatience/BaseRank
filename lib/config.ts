import { isAddress, zeroAddress } from "viem";

export const chainId = Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "8453", 10);
export const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID || "6a641b2d281b6db318994b35";
export const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE || "";
export const configuredDataSuffix = process.env.NEXT_PUBLIC_DATA_SUFFIX || "";

const rawContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xa08EAd22DDa99A87C99E3DE84E13A6556079DE62";
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
