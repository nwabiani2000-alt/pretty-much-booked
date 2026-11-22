import {
  getGbpToNgnRate,
  getMarket,
  moneyPayload,
  resolveMarketFromRequest,
  type MarketId,
  type MoneyPayload,
} from "@/lib/market";
import type { ApiBooking, ApiPro, ApiService } from "@/lib/api-catalog";

export type MarketMeta = {
  market: MarketId;
  currency: string;
  symbol: string;
  city: string;
  locale: string;
  /** Mock FX: 1 GBP = this many NGN */
  fx_gbp_to_ngn: number;
  default_coords: { lat: number; lng: number };
};

export function marketMeta(marketId: MarketId): MarketMeta {
  const m = getMarket(marketId);
  return {
    market: m.id,
    currency: m.currency,
    symbol: m.symbol,
    city: m.city,
    locale: m.locale,
    fx_gbp_to_ngn: getGbpToNgnRate(),
    default_coords: m.coords,
  };
}

export function resolveMarketQuery(searchParams: URLSearchParams): MarketId {
  return resolveMarketFromRequest({
    market: searchParams.get("market"),
    currency: searchParams.get("currency"),
  });
}

export type PricedService = ApiService & {
  price: MoneyPayload;
  base_price_gbp: number;
};

export type PricedPro = Omit<ApiPro, "offerings"> & {
  offerings?: Record<
    string,
    { price: number; duration_mins: number; money: MoneyPayload }
  >;
};

export type PricedBooking = ApiBooking & {
  total: MoneyPayload;
  deposit: MoneyPayload;
  total_price_gbp: number;
  deposit_amount_gbp: number;
};

export function priceServices(
  services: ApiService[],
  marketId: MarketId
): PricedService[] {
  return services.map((s) => ({
    ...s,
    base_price_gbp: s.base_price,
    price: moneyPayload(s.base_price, marketId),
  }));
}

export function pricePros(pros: ApiPro[], marketId: MarketId): PricedPro[] {
  return pros.map((p): PricedPro => {
    if (!p.offerings) {
      return { ...p, offerings: undefined };
    }
    const offerings: NonNullable<PricedPro["offerings"]> = {};
    for (const [sid, o] of Object.entries(p.offerings)) {
      offerings[sid] = {
        price: o.price,
        duration_mins: o.duration_mins,
        money: moneyPayload(o.price, marketId),
      };
    }
    return { ...p, offerings };
  });
}

export function priceBookings(
  bookings: ApiBooking[],
  marketId: MarketId
): PricedBooking[] {
  return bookings.map((b) => ({
    ...b,
    total_price_gbp: b.total_price,
    deposit_amount_gbp: b.deposit_amount,
    total: moneyPayload(b.total_price, marketId),
    deposit: moneyPayload(b.deposit_amount, marketId),
  }));
}
