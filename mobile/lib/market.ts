/**
 * London / Lagos market model (mirrors web `/lib/market.ts`).
 * Catalog prices are GBP-canonical; display converts with mock FX.
 *
 * Mock FX: 1 GBP = 2,100 NGN (not live — replace when FX provider is wired).
 */

export type MarketId = 'london' | 'lagos';
export type CurrencyCode = 'GBP' | 'NGN';

export type MarketConfig = {
  id: MarketId;
  label: string;
  city: string;
  currency: CurrencyCode;
  symbol: string;
  locale: string;
  coords: { lat: number; lng: number };
  defaultAddress: string;
  emergencyFeeGbp: number;
};

/** Default until env / AsyncStorage override. */
export const MOCK_GBP_TO_NGN_DEFAULT = 2100;
/** @deprecated use getGbpToNgnRate() */
export const MOCK_GBP_TO_NGN = MOCK_GBP_TO_NGN_DEFAULT;

const FX_STORAGE_KEY = 'pmb_fx_gbp_ngn';

export function getGbpToNgnRate(): number {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(FX_STORAGE_KEY);
      const n = raw ? Number(raw) : NaN;
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    /* ignore */
  }
  return MOCK_GBP_TO_NGN_DEFAULT;
}

export function setClientFxRate(rate: number): void {
  if (!Number.isFinite(rate) || rate <= 0) return;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FX_STORAGE_KEY, String(rate));
    }
  } catch {
    /* ignore */
  }
}

export const MARKETS: Record<MarketId, MarketConfig> = {
  london: {
    id: 'london',
    label: 'London',
    city: 'London',
    currency: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    coords: { lat: 51.5246, lng: -0.0805 },
    defaultAddress: '42 Curtain Road, Shoreditch, London EC2A 3NH',
    emergencyFeeGbp: 15,
  },
  lagos: {
    id: 'lagos',
    label: 'Lagos',
    city: 'Lagos',
    currency: 'NGN',
    symbol: '₦',
    locale: 'en-NG',
    coords: { lat: 6.4541, lng: 3.3947 },
    defaultAddress: '15 Admiralty Way, Lekki Phase 1, Lagos',
    emergencyFeeGbp: 15,
  },
};

export const DEFAULT_MARKET: MarketId = 'london';
export const MARKET_STORAGE_KEY = 'pmb_market';

export function isMarketId(value: unknown): value is MarketId {
  return value === 'london' || value === 'lagos';
}

export function getMarket(id: MarketId = DEFAULT_MARKET): MarketConfig {
  return MARKETS[id] ?? MARKETS[DEFAULT_MARKET];
}

export function convertFromGbp(
  amountGbp: number,
  marketId: MarketId,
  rate = getGbpToNgnRate()
): number {
  if (marketId === 'lagos') {
    return Math.round(amountGbp * rate);
  }
  return amountGbp;
}

export function formatMoneyGbp(
  amountGbp: number,
  marketId: MarketId = DEFAULT_MARKET,
  rate = getGbpToNgnRate()
): string {
  const market = getMarket(marketId);
  const value = convertFromGbp(amountGbp, marketId, rate);
  if (market.currency === 'NGN') {
    return `${market.symbol}${Math.round(value).toLocaleString(market.locale)}`;
  }
  const fixed = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return `${market.symbol}${fixed}`;
}

export function formatFromPriceGbp(
  amountGbp: number,
  marketId: MarketId = DEFAULT_MARKET,
  rate = getGbpToNgnRate()
): string {
  return `from ${formatMoneyGbp(amountGbp, marketId, rate)}`;
}

export function emergencyFeeLabel(
  marketId: MarketId = DEFAULT_MARKET,
  rate = getGbpToNgnRate()
): string {
  return `+${formatMoneyGbp(getMarket(marketId).emergencyFeeGbp, marketId, rate)}`;
}

function storageGet(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(MARKET_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function storageSet(id: MarketId): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MARKET_STORAGE_KEY, id);
    }
  } catch {
    /* ignore */
  }
}

export function readStoredMarket(): MarketId {
  const raw = storageGet();
  if (isMarketId(raw)) return raw;
  return DEFAULT_MARKET;
}

export function writeStoredMarket(id: MarketId): void {
  storageSet(id);
}
