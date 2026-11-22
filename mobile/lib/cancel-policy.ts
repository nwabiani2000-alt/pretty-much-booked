/**
 * Graduated cancel + readiness fee rules (mock copy for checkout).
 * Beyond flat deposit — Glamsquad-style windows.
 */

import { formatMoneyGbp, type MarketId } from "@/lib/market";

export type CancelWindow = {
  id: string;
  title: string;
  detail: string;
};

/** Readiness: pro waits 15–20 min then full charge (mock). */
export const READINESS_FEE_NOTE =
  "Pro waits up to 20 minutes. After that, the visit is charged in full (readiness fee).";

export function cancelPolicyLines(
  marketId: MarketId,
  formatMoney: (gbp: number) => string = (n) => formatMoneyGbp(n, marketId)
): string[] {
  const credit = formatMoney(10);
  if (marketId === "lagos") {
    return [
      "Cancel >12h before: Full deposit refund",
      "Cancel 2–12h before: 50% deposit refund",
      "Cancel <2h or no-show: No refund",
      `Pro cancels: Full refund + ${credit} credit`,
      READINESS_FEE_NOTE,
    ];
  }
  return [
    "Weekday · cancel >24h: Full deposit refund",
    "Weekday · cancel 2–24h: 50% deposit refund",
    "Weekend / evening · cancel >48h: Full deposit refund",
    "Weekend / evening · cancel <48h: 50% deposit (or none if <2h)",
    "Cancel <2h or no-show: No refund",
    `Pro cancels: Full refund + ${credit} credit`,
    READINESS_FEE_NOTE,
  ];
}

export function cancelWindowsSummary(marketId: MarketId): CancelWindow[] {
  const lines = cancelPolicyLines(marketId);
  return lines.map((detail, i) => ({
    id: `w${i}`,
    title: detail.split(":")[0]?.trim() || `Rule ${i + 1}`,
    detail,
  }));
}
