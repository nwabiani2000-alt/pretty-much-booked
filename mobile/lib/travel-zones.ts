/**
 * Travel / zone fees (GBP-canonical). Shown before pay.
 * Mock — not live maps. Replace with distance/routing later.
 */

import type { MarketId } from "@/lib/market";

export type LondonZone = "z1" | "z2" | "z3_outer";
export type LagosZone = "island" | "mainland";

export type TravelZoneId = LondonZone | LagosZone;

export type TravelZoneOption = {
  id: TravelZoneId;
  label: string;
  hint: string;
  /** Fee in GBP (canonical) */
  feeGbp: number;
};

export const LONDON_ZONES: TravelZoneOption[] = [
  {
    id: "z1",
    label: "Zone 1–2",
    hint: "Central / inner",
    feeGbp: 0,
  },
  {
    id: "z2",
    label: "Zone 3–4",
    hint: "Outer London",
    feeGbp: 8,
  },
  {
    id: "z3_outer",
    label: "Zone 5+",
    hint: "Greater London",
    feeGbp: 15,
  },
];

export const LAGOS_ZONES: TravelZoneOption[] = [
  {
    id: "island",
    label: "Island",
    hint: "VI, Lekki, Ikoyi",
    feeGbp: 0,
  },
  {
    id: "mainland",
    label: "Mainland",
    hint: "Ikeja, Surulere, Yaba…",
    feeGbp: 12,
  },
];

export function zonesForMarket(marketId: MarketId): TravelZoneOption[] {
  return marketId === "lagos" ? LAGOS_ZONES : LONDON_ZONES;
}

export function defaultZone(marketId: MarketId): TravelZoneId {
  return marketId === "lagos" ? "island" : "z1";
}

export function travelFeeGbp(
  marketId: MarketId,
  zoneId: TravelZoneId | null | undefined
): number {
  const zones = zonesForMarket(marketId);
  const z = zones.find((o) => o.id === zoneId) ?? zones[0];
  return z?.feeGbp ?? 0;
}

export function zoneLabel(
  marketId: MarketId,
  zoneId: TravelZoneId | null | undefined
): string {
  const zones = zonesForMarket(marketId);
  return zones.find((o) => o.id === zoneId)?.label ?? zones[0]?.label ?? "";
}
