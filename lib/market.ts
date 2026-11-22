/**
 * London / Lagos market model.
 * Catalog prices are stored in GBP; display converts with a mock FX rate.
 *
 * Mock FX (document for demos): 1 GBP = 2,100 NGN
 * Not a live rate — replace when a FX provider is wired.
 */

export type MarketId = "london" | "lagos";
export type CurrencyCode = "GBP" | "NGN";

export type MarketConfig = {
  id: MarketId;
  label: string;
  city: string;
  currency: CurrencyCode;
  symbol: string;
  locale: string;
  /** Default map / address coords */
  coords: { lat: number; lng: number };
  /** Sample address for “Use my location” stubs */
  defaultAddress: string;
  /** Emergency / ASAP fee in GBP (canonical) */
  emergencyFeeGbp: number;
};

/**
 * Mock / configurable FX: 1 GBP → NGN.
 * Override with env `PMB_FX_GBP_NGN` (server) or localStorage `pmb_fx_gbp_ngn` (client).
 * Default 2100 until a live FX provider is wired.
 */
export const MOCK_GBP_TO_NGN_DEFAULT = 2100;

export function getGbpToNgnRate(): number {
  if (typeof process !== "undefined" && process.env?.PMB_FX_GBP_NGN) {
    const n = Number(process.env.PMB_FX_GBP_NGN);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("pmb_fx_gbp_ngn");
      const n = raw ? Number(raw) : NaN;
      if (Number.isFinite(n) && n > 0) return n;
    } catch {
      /* ignore */
    }
  }
  return MOCK_GBP_TO_NGN_DEFAULT;
}

/** @deprecated use getGbpToNgnRate() — kept for imports */
export const MOCK_GBP_TO_NGN = MOCK_GBP_TO_NGN_DEFAULT;

export const MARKETS: Record<MarketId, MarketConfig> = {
  london: {
    id: "london",
    label: "London",
    city: "London",
    currency: "GBP",
    symbol: "£",
    locale: "en-GB",
    coords: { lat: 51.5246, lng: -0.0805 },
    defaultAddress: "42 Curtain Road, Shoreditch, London EC2A 3NH",
    emergencyFeeGbp: 15,
  },
  lagos: {
    id: "lagos",
    label: "Lagos",
    city: "Lagos",
    currency: "NGN",
    symbol: "₦",
    locale: "en-NG",
    coords: { lat: 6.4541, lng: 3.3947 },
    defaultAddress: "15 Admiralty Way, Lekki Phase 1, Lagos",
    emergencyFeeGbp: 15,
  },
};

export const DEFAULT_MARKET: MarketId = "london";
export const MARKET_STORAGE_KEY = "pmb_market";

export function isMarketId(value: unknown): value is MarketId {
  return value === "london" || value === "lagos";
}

export function parseMarketParam(
  raw: string | null | undefined
): MarketId | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (isMarketId(v)) return v;
  if (v === "gbp" || v === "uk") return "london";
  if (v === "ngn" || v === "nigeria" || v === "ng") return "lagos";
  return null;
}

export function getMarket(id: MarketId = DEFAULT_MARKET): MarketConfig {
  return MARKETS[id] ?? MARKETS[DEFAULT_MARKET];
}

/** Convert canonical GBP amount to display units for the market. */
export function convertFromGbp(amountGbp: number, marketId: MarketId): number {
  if (marketId === "lagos") {
    return Math.round(amountGbp * getGbpToNgnRate());
  }
  return amountGbp;
}

export function setClientFxRate(rate: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(rate) || rate <= 0) return;
  try {
    window.localStorage.setItem("pmb_fx_gbp_ngn", String(rate));
  } catch {
    /* ignore */
  }
}

export function formatMoneyGbp(
  amountGbp: number,
  marketId: MarketId = DEFAULT_MARKET
): string {
  const market = getMarket(marketId);
  const value = convertFromGbp(amountGbp, marketId);
  if (market.currency === "NGN") {
    return `${market.symbol}${Math.round(value).toLocaleString(market.locale)}`;
  }
  const fixed = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return `${market.symbol}${fixed}`;
}

export function formatFromPriceGbp(
  amountGbp: number,
  marketId: MarketId = DEFAULT_MARKET
): string {
  return `from ${formatMoneyGbp(amountGbp, marketId)}`;
}

export function emergencyFeeLabel(marketId: MarketId = DEFAULT_MARKET): string {
  return `+${formatMoneyGbp(getMarket(marketId).emergencyFeeGbp, marketId)}`;
}

/** Dual-currency price payload for APIs (GBP canonical + display). */
export type MoneyPayload = {
  amount_gbp: number;
  amount: number;
  currency: CurrencyCode;
  formatted: string;
  amount_ngn: number;
};

export function moneyPayload(
  amountGbp: number,
  marketId: MarketId = DEFAULT_MARKET
): MoneyPayload {
  const market = getMarket(marketId);
  return {
    amount_gbp: amountGbp,
    amount: convertFromGbp(amountGbp, marketId),
    currency: market.currency,
    formatted: formatMoneyGbp(amountGbp, marketId),
    amount_ngn: convertFromGbp(amountGbp, "lagos"),
  };
}

export function resolveMarketFromRequest(opts: {
  market?: string | null;
  currency?: string | null;
}): MarketId {
  return (
    parseMarketParam(opts.market) ??
    parseMarketParam(opts.currency) ??
    DEFAULT_MARKET
  );
}

/** Read market from localStorage (browser) or default. */
export function readStoredMarket(): MarketId {
  if (typeof window === "undefined") return DEFAULT_MARKET;
  try {
    const raw = window.localStorage.getItem(MARKET_STORAGE_KEY);
    if (isMarketId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_MARKET;
}

export function writeStoredMarket(id: MarketId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MARKET_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
