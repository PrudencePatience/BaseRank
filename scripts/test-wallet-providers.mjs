import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const outDir = ".wallet-test";
if (!existsSync(outDir)) mkdirSync(outDir);

execFileSync(
  process.execPath,
  [
    require.resolve("typescript/bin/tsc"),
    "lib/walletProviderCore.ts",
    "--outDir",
    outDir,
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--target",
    "ES2020",
    "--skipLibCheck",
    "--esModuleInterop"
  ],
  { stdio: "pipe" }
);

const { selectWalletProvider } = await import(pathToFileURL(`${process.cwd()}/${outDir}/walletProviderCore.js`).href);

function provider(id, flags = {}) {
  return { id, request: async () => null, ...flags };
}

function assert(condition, label) {
  if (!condition) throw new Error(label);
}

const okx = provider("okx", { isOkxWallet: true });
const okex = provider("okex", { isOKExWallet: true });
const okxMetaCompat = provider("okx-meta-compatible", { isOkxWallet: true, isMetaMask: true });
const metamask = provider("metamask", { isMetaMask: true });
const baseInjected = provider("base", {});
const eip6963Okx = provider("eip6963-okx", { info: { name: "OKX Wallet", rdns: "com.okx.wallet" } });

assert(selectWalletProvider([okx], "okx") === okx, "only OKX should select OKX");
assert(selectWalletProvider([metamask], "metamask") === metamask, "only MetaMask should select MetaMask");
assert(selectWalletProvider([metamask], "okx") === undefined, "OKX button must not fallback to MetaMask");
assert(selectWalletProvider([okxMetaCompat], "metamask") === undefined, "MetaMask button must exclude OKX compatibility provider");
assert(selectWalletProvider([metamask, okex], "okx") === okex, "OKX and MetaMask installed should select OKX for OKX");
assert(selectWalletProvider([okxMetaCompat, metamask], "metamask") === metamask, "OKX and MetaMask installed should select MetaMask for MetaMask");
assert(selectWalletProvider([baseInjected], "okx") === undefined, "Base injected without OKX signal should not be OKX");
assert(selectWalletProvider([baseInjected], "metamask") === undefined, "Base injected without MetaMask signal should not be MetaMask");
assert(selectWalletProvider([eip6963Okx], "okx") === eip6963Okx, "EIP-6963 OKX announce should be detected");

console.log("Wallet provider detection scenarios passed.");
