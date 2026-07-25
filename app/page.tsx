"use client";

import { readContract, sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { Activity, Award, Crown, ExternalLink, Medal, RefreshCw, Send, TrendingUp, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { concatHex, encodeFunctionData } from "viem";
import { useAccount, useChainId } from "wagmi";
import { baseRankAbi } from "@/lib/baseRankAbi";
import { builderCode, chainId, contractAddress, emptyAddress, shortAddress } from "@/lib/config";
import { getErrorMessage, getTransactionErrorMessage } from "@/lib/errors";
import { attributionStatusText, attributionVersion, dataSuffix, dataSuffixTail, isDataSuffixEnabled } from "@/lib/attribution";
import { wagmiConfig } from "@/lib/wagmi";
import { LeaderboardEntry, normalizePlayers, normalizeUser, toSafeNumber, UserStats } from "@/lib/normalize";
import { ErrorNotice } from "@/components/ErrorNotice";
import { WalletButtons } from "@/components/WalletButtons";

const demoEntries: LeaderboardEntry[] = [
  { address: "0x1111111111111111111111111111111111111111", actions: 17n, points: 230n, rank: 1 },
  { address: "0x2222222222222222222222222222222222222222", actions: 14n, points: 185n, rank: 2 },
  { address: "0x3333333333333333333333333333333333333333", actions: 10n, points: 140n, rank: 3 }
];

const emptyUser: UserStats = {
  actions: 0n,
  points: 0n,
  referrer: emptyAddress,
  joined: false
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const activeChainId = useChainId();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(emptyUser);
  const [totalActions, setTotalActions] = useState<bigint>(0n);
  const [readError, setReadError] = useState("");
  const [walletError, setWalletError] = useState("");
  const [txError, setTxError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEarning, setIsEarning] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const networkError = activeChainId && activeChainId !== chainId ? `Wrong network. Please switch to Base (Chain ID ${chainId}).` : "";
  const contractError = contractAddress ? "" : "Contract address is missing. Set NEXT_PUBLIC_CONTRACT_ADDRESS before deploying.";

  const refreshStats = useCallback(async () => {
    if (!contractAddress) {
      setReadError(contractError);
      return;
    }
    const addressForRead = contractAddress;

    setIsRefreshing(true);
    setReadError("");

    try {
      const [playersValue, totalValue] = await Promise.all([
        readContract(wagmiConfig, {
          address: addressForRead,
          abi: baseRankAbi,
          functionName: "getPlayers"
        }),
        readContract(wagmiConfig, {
          address: addressForRead,
          abi: baseRankAbi,
          functionName: "totalActions"
        })
      ]);

      const players = normalizePlayers(playersValue);
      const users = await Promise.all(
        players.map(async (player) => {
          const value = await readContract(wagmiConfig, {
            address: addressForRead,
            abi: baseRankAbi,
            functionName: "getUser",
            args: [player]
          });
          const stats = normalizeUser(value);
          return { address: player, actions: stats.actions, points: stats.points };
        })
      );

      const ranked = users
        .sort((a, b) => {
          if (a.points === b.points) return Number(b.actions - a.actions);
          return a.points > b.points ? -1 : 1;
        })
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
        .slice(0, 20);

      let nextUserStats = emptyUser;
      if (address) {
        const userValue = await readContract(wagmiConfig, {
          address: addressForRead,
          abi: baseRankAbi,
          functionName: "getUser",
          args: [address]
        });
        nextUserStats = normalizeUser(userValue);
      }

      if (!mountedRef.current) return;
      setLeaderboard(ranked);
      setUserStats(nextUserStats);
      setTotalActions(typeof totalValue === "bigint" ? totalValue : 0n);
    } catch (error) {
      if (!mountedRef.current) return;
      setReadError(getErrorMessage(error, "Contract read failed."));
    } finally {
      if (mountedRef.current) setIsRefreshing(false);
    }
  }, [address, contractError]);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  const myRank = useMemo(() => {
    if (!address) return undefined;
    return leaderboard.find((entry) => entry.address.toLowerCase() === address.toLowerCase())?.rank;
  }, [address, leaderboard]);

  const visibleEntries = leaderboard.length ? leaderboard : demoEntries;
  const topThree = visibleEntries.slice(0, 3);
  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined" || !address) return "";
    const url = new URL(window.location.href);
    url.searchParams.set("ref", address);
    return url.toString();
  }, [address]);

  async function earnPoints() {
    setTxError("");
    setWalletError("");

    if (!isConnected || !address) {
      setWalletError("Connect a wallet before earning points.");
      return;
    }
    if (!contractAddress) {
      setTxError(contractError);
      return;
    }
    const addressForWrite = contractAddress;
    if (networkError) {
      setTxError(networkError);
      return;
    }

    setIsEarning(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      const referrer = ref && /^0x[a-fA-F0-9]{40}$/.test(ref) ? (ref as `0x${string}`) : emptyAddress;
      const callData = encodeFunctionData({
        abi: baseRankAbi,
        functionName: "earnPoints",
        args: [referrer]
      });
      const data = concatHex([callData, dataSuffix]);
      const hash = await sendTransaction(wagmiConfig, {
        to: addressForWrite,
        data,
        value: 0n
      });

      await waitForTransactionReceipt(wagmiConfig, { hash });
      await refreshStats();
    } catch (error) {
      setTxError(getTransactionErrorMessage(error));
    } finally {
      if (mountedRef.current) setIsEarning(false);
    }
  }

  const mainButtonText = !isConnected ? "Connect Wallet" : isEarning ? "Earning..." : userStats.actions > 0n ? "Earn Again" : "Earn Points";

  return (
    <main className="min-h-screen pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 rounded-lg border border-line/80 bg-[#17191f]/90 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">BaseRank</p>
            <h1 className="mt-1 text-2xl font-bold text-[#fffaf0] sm:text-3xl">Climb the Base leaderboard.</h1>
          </div>
          <WalletButtons onError={setWalletError} />
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-line bg-panel p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-silver">Earn points. Rise ranks.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Score label="My Points" value={toSafeNumber(userStats.points).toLocaleString()} />
                  <Score label="Total Actions" value={toSafeNumber(totalActions).toLocaleString()} />
                  <Score label="Rank Position" value={myRank ? `#${myRank}` : "-"} />
                </div>
              </div>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-black text-[#141414] shadow-[0_14px_32px_rgba(243,200,95,0.18)] hover:bg-[#ffd875] disabled:opacity-60"
                disabled={isEarning || (!isConnected && false)}
                onClick={isConnected ? earnPoints : () => setWalletError("Choose OKX Wallet, MetaMask, or Coinbase Wallet above.")}
              >
                {isEarning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                {mainButtonText}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold">Contract Info</h2>
              <button className="rounded-md border border-line p-2 text-silver hover:bg-white/5" aria-label="Refresh stats" onClick={() => void refreshStats()}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <Info label="Contract address" value={contractAddress ?? "Not configured"} />
              <Info label="Network" value="Base" />
              <Info label="Chain ID" value={String(chainId)} />
              <Info label="Builder code" value={builderCode} />
              <Info label="Onchain attribution" value={attributionStatusText} />
              <Info label="Attribution version" value={attributionVersion} />
              <Info label="dataSuffix tail" value={isDataSuffixEnabled ? dataSuffixTail : "Not configured"} />
            </dl>
          </div>
        </section>

        <ErrorNotice message={walletError || networkError || contractError || readError || txError} onDismiss={() => {
          setWalletError("");
          setReadError("");
          setTxError("");
        }} />

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-line bg-panel p-5">
            <div className="mb-5 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-bold">Top 3 Podium</h2>
            </div>
            <div className="grid grid-cols-3 items-end gap-3">
              {[topThree[1], topThree[0], topThree[2]].map((entry, index) => (
                <Podium key={entry?.address ?? index} entry={entry} place={entry?.rank ?? index + 1} tall={index === 1} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-mint" />
                <h2 className="text-lg font-bold">My Rank</h2>
              </div>
              <span className="rounded bg-white/5 px-2 py-1 text-xs text-silver">{userStats.joined ? "Joined" : "Ready"}</span>
            </div>
            <div className="rounded-lg border border-gold/30 bg-[#17191f] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-silver">{shortAddress(address)}</p>
                  <p className="mt-1 text-3xl font-black text-gold">{myRank ? `#${myRank}` : "Unranked"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-silver">Actions</p>
                  <p className="text-2xl font-bold">{toSafeNumber(userStats.actions)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-line bg-white/5 px-3 py-2 text-xs text-silver">
                <Send className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{inviteUrl || "Connect to create invite link"}</span>
                {inviteUrl ? <ExternalLink className="h-4 w-4 shrink-0" /> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Medal className="h-5 w-5 text-silver" />
            <h2 className="text-lg font-bold">Leaderboard</h2>
          </div>
          <div className="space-y-2">
            {visibleEntries.map((entry) => (
              <RankRow key={entry.address} entry={entry} active={Boolean(address && entry.address.toLowerCase() === address.toLowerCase())} />
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-[#101114]/95 px-4 py-2 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-4 text-xs text-silver">
          <NavItem icon={<Trophy className="h-4 w-4" />} label="Rank" />
          <NavItem icon={<TrendingUp className="h-4 w-4" />} label="Earn" />
          <NavItem icon={<Activity className="h-4 w-4" />} label="Activity" />
          <NavItem icon={<Send className="h-4 w-4" />} label="Invite" />
        </div>
      </nav>
    </main>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-[#17191f] p-3">
      <p className="text-[11px] uppercase tracking-wide text-silver">{label}</p>
      <p className="mt-2 text-xl font-black text-[#fffaf0]">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-white/5 px-3 py-2">
      <dt className="text-silver">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-[#fffaf0]">{value}</dd>
    </div>
  );
}

function Podium({ entry, place, tall }: { entry?: LeaderboardEntry; place: number; tall?: boolean }) {
  const color = place === 1 ? "text-gold border-gold/40" : place === 2 ? "text-silver border-silver/30" : "text-bronze border-bronze/40";
  return (
    <div className={`flex flex-col justify-end rounded-lg border bg-[#17191f] p-3 ${color} ${tall ? "min-h-56" : "min-h-44"}`}>
      <Crown className="mb-3 h-5 w-5" />
      <p className="text-3xl font-black">#{place}</p>
      <p className="mt-3 truncate text-sm text-[#fffaf0]">{shortAddress(entry?.address)}</p>
      <p className="mt-1 text-xs text-silver">{toSafeNumber(entry?.points).toLocaleString()} pts</p>
    </div>
  );
}

function RankRow({ entry, active }: { entry: LeaderboardEntry; active: boolean }) {
  return (
    <div className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-lg border px-3 py-3 ${active ? "border-gold/60 bg-gold/10" : "border-line bg-[#17191f]"}`}>
      <div className="text-lg font-black text-gold">#{entry.rank}</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{shortAddress(entry.address)}</p>
        <p className="text-xs text-silver">{toSafeNumber(entry.actions)} actions</p>
      </div>
      <div className="text-right text-lg font-black">{toSafeNumber(entry.points).toLocaleString()}</div>
    </div>
  );
}

function NavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 hover:bg-white/5">
      {icon}
      <span>{label}</span>
    </button>
  );
}
