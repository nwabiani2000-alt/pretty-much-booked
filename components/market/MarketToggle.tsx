"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { MARKETS, type MarketId } from "@/lib/market";
import { cn } from "@/lib/utils";

type MarketToggleProps = {
  className?: string;
  /** compact = segmented control for headers */
  size?: "compact" | "default";
};

/** London ↔ Lagos — one control, Hick’s-friendly. */
export function MarketToggle({
  className,
  size = "compact",
}: MarketToggleProps) {
  const { marketId, setMarketId } = useMarket();
  const ids = Object.keys(MARKETS) as MarketId[];

  return (
    <div
      role="group"
      aria-label="Market"
      className={cn(
        "inline-flex rounded-button bg-neutral-bg p-0.5",
        className
      )}
    >
      {ids.map((id) => {
        const active = marketId === id;
        const m = MARKETS[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => setMarketId(id)}
            className={cn(
              "pressable no-select min-h-touch px-3 font-medium transition",
              size === "compact" ? "text-caption py-1.5" : "text-small py-2",
              active
                ? "rounded-button bg-neutral-card text-pmb-700 shadow-card"
                : "text-neutral-secondary"
            )}
          >
            {m.city}
            <span className="ml-1 text-neutral-muted">{m.symbol}</span>
          </button>
        );
      })}
    </div>
  );
}
