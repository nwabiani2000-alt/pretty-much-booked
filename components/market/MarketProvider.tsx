"use client";

import {
  DEFAULT_MARKET,
  emergencyFeeLabel,
  formatFromPriceGbp,
  formatMoneyGbp,
  getGbpToNgnRate,
  getMarket,
  isMarketId,
  readStoredMarket,
  setClientFxRate,
  writeStoredMarket,
  type MarketConfig,
  type MarketId,
} from "@/lib/market";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MarketContextValue = {
  marketId: MarketId;
  market: MarketConfig;
  setMarketId: (id: MarketId) => void;
  /** Format a GBP-canonical amount in the active market. */
  formatMoney: (amountGbp: number) => string;
  formatFromPrice: (amountGbp: number) => string;
  emergencyLabel: string;
  /** Live FX used for NGN display */
  fxGbpToNgn: number;
  setFxGbpToNgn: (rate: number) => void;
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [marketId, setMarketIdState] = useState<MarketId>(DEFAULT_MARKET);
  const [fxGbpToNgn, setFxState] = useState(2100);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMarketIdState(readStoredMarket());
    setFxState(getGbpToNgnRate());
    setReady(true);
  }, []);

  const setMarketId = useCallback((id: MarketId) => {
    if (!isMarketId(id)) return;
    setMarketIdState(id);
    writeStoredMarket(id);
  }, []);

  const setFxGbpToNgn = useCallback((rate: number) => {
    setClientFxRate(rate);
    setFxState(getGbpToNgnRate());
  }, []);

  const value = useMemo<MarketContextValue>(() => {
    const market = getMarket(marketId);
    return {
      marketId,
      market,
      setMarketId,
      formatMoney: (amountGbp: number) => formatMoneyGbp(amountGbp, marketId),
      formatFromPrice: (amountGbp: number) =>
        formatFromPriceGbp(amountGbp, marketId),
      emergencyLabel: emergencyFeeLabel(marketId),
      fxGbpToNgn,
      setFxGbpToNgn,
    };
  }, [marketId, setMarketId, fxGbpToNgn, setFxGbpToNgn]);

  // Avoid flash of wrong currency before localStorage hydrate
  if (!ready) {
    return (
      <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
    );
  }

  return (
    <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
  );
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    // Safe SSR / outside provider fallback — London
    const market = getMarket(DEFAULT_MARKET);
    return {
      marketId: DEFAULT_MARKET,
      market,
      setMarketId: () => {},
      formatMoney: (n) => formatMoneyGbp(n, DEFAULT_MARKET),
      formatFromPrice: (n) => formatFromPriceGbp(n, DEFAULT_MARKET),
      emergencyLabel: emergencyFeeLabel(DEFAULT_MARKET),
      fxGbpToNgn: getGbpToNgnRate(),
      setFxGbpToNgn: () => {},
    };
  }
  return ctx;
}
