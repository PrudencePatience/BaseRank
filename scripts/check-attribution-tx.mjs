import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { Attribution } from "ox/erc8021";

const hash = process.argv[2];
if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
  console.error("Usage: node scripts/check-attribution-tx.mjs <base-tx-hash>");
  process.exit(1);
}

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xa08EAd22DDa99A87C99E3DE84E13A6556079DE62").trim().toLowerCase();
const builderCode = (process.env.NEXT_PUBLIC_BUILDER_CODE || "bc_unphxn50").trim();
const configuredSuffix = (process.env.NEXT_PUBLIC_DATA_SUFFIX || "").trim();
const dataSuffix = configuredSuffix || Attribution.toDataSuffix({ codes: [builderCode] });
const entryPoint = "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789";

const client = createPublicClient({
  chain: base,
  transport: http()
});

const tx = await client.getTransaction({ hash });
const input = tx.input || "0x";
const to = tx.to?.toLowerCase() ?? null;

console.log(
  JSON.stringify(
    {
      hash,
      chainId: `0x${tx.chainId.toString(16)}`,
      to,
      isContractTo: to === contractAddress,
      isEntryPoint: to === entryPoint,
      dataSuffix,
      containsSuffix: input.toLowerCase().includes(dataSuffix.toLowerCase().slice(2)),
      endsWithSuffix: input.toLowerCase().endsWith(dataSuffix.toLowerCase().slice(2)),
      inputTail: input.length > 82 ? `...${input.slice(-80)}` : input
    },
    null,
    2
  )
);
