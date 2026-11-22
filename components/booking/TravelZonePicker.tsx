"use client";

import { useMarket } from "@/components/market/MarketProvider";
import {
  zonesForMarket,
  type TravelZoneId,
} from "@/lib/travel-zones";
import { cn } from "@/lib/utils";

type TravelZonePickerProps = {
  value: TravelZoneId;
  onChange: (id: TravelZoneId) => void;
};

export function TravelZonePicker({ value, onChange }: TravelZonePickerProps) {
  const { marketId, formatMoney } = useMarket();
  const zones = zonesForMarket(marketId);

  return (
    <div className="mt-8">
      <p className="text-caption font-medium uppercase tracking-wide text-neutral-muted">
        Travel zone
      </p>
      <p className="mt-1 text-small text-neutral-secondary">
        Fee is in your quote before pay.
      </p>
      <div className="mt-3 flex flex-col gap-1">
        {zones.map((z) => {
          const on = value === z.id;
          return (
            <button
              key={z.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(z.id)}
              className={cn(
                "pressable flex items-center justify-between rounded-button px-3 py-3 text-left transition",
                on ? "bg-pmb-50 text-pmb-700" : "bg-neutral-bg text-neutral-text"
              )}
            >
              <span>
                <span className="block text-body-bold">{z.label}</span>
                <span className="text-caption text-neutral-secondary">
                  {z.hint}
                </span>
              </span>
              <span className="text-small font-medium">
                {z.feeGbp === 0 ? "Included" : `+${formatMoney(z.feeGbp)}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
