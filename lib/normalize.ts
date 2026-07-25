import { isAddress, zeroAddress } from "viem";

export type UserStats = {
  actions: bigint;
  points: bigint;
  referrer: `0x${string}`;
  joined: boolean;
};

export type LeaderboardEntry = {
  address: `0x${string}`;
  actions: bigint;
  points: bigint;
  rank: number;
};

function readField(value: unknown, index: number, key: string): unknown {
  if (Array.isArray(value)) return value[index];
  if (value && typeof value === "object" && key in value) {
    return (value as Record<string, unknown>)[key];
  }
  return undefined;
}

export function toSafeBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return BigInt(value);
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  return 0n;
}

export function toSafeNumber(value: unknown): number {
  const normalized = toSafeBigInt(value);
  return normalized > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(normalized);
}

export function toSafeAddress(value: unknown): `0x${string}` {
  return typeof value === "string" && isAddress(value) ? value : zeroAddress;
}

export function normalizeUser(value: unknown): UserStats {
  return {
    actions: toSafeBigInt(readField(value, 0, "actions")),
    points: toSafeBigInt(readField(value, 1, "points")),
    referrer: toSafeAddress(readField(value, 2, "referrer")),
    joined: Boolean(readField(value, 3, "joined"))
  };
}

export function normalizePlayers(value: unknown): `0x${string}`[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is `0x${string}` => typeof item === "string" && isAddress(item));
}
