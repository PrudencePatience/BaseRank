import { Attribution } from "ox/erc8021";
import { builderCode, configuredDataSuffix } from "@/lib/config";

export const attributionVersion = "v2";
export const effectiveBuilderCode = builderCode || "bc_unphxn50";

export const dataSuffix = (configuredDataSuffix ||
  Attribution.toDataSuffix({
    codes: [effectiveBuilderCode]
  })) as `0x${string}`;

export const isDataSuffixEnabled = Boolean(dataSuffix && dataSuffix !== "0x");
export const dataSuffixTail = dataSuffix.length > 18 ? dataSuffix.slice(-18) : dataSuffix;
export const attributionStatusText = isDataSuffixEnabled
  ? `suffix enabled · ${attributionVersion} · ...${dataSuffixTail}`
  : `suffix missing · ${attributionVersion}`;
