/**
 * In-app tip presets — GBP-canonical amounts, display via market formatter.
 */

import type { MarketId } from "@/lib/market";

/** Suggested tip amounts in GBP. */
export function tipPresetsGbp(marketId: MarketId): number[] {
  if (marketId === "lagos") {
    // ~₦2k / ₦5k / ₦10k at mock FX 2100
    return [1, 2.5, 5];
  }
  return [3, 5, 10];
}

export function tipLabel(
  amountGbp: number,
  formatMoney: (n: number) => string
): string {
  return formatMoney(amountGbp);
}
