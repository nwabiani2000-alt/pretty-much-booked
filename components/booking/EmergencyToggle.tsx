"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { cn } from "@/lib/utils";

type EmergencyToggleProps = {
  enabled: boolean;
  onToggle: (value: boolean) => void;
};

export function EmergencyToggle({ enabled, onToggle }: EmergencyToggleProps) {
  const { emergencyLabel } = useMarket();
  return (
    <div
      className={cn(
        "rounded-button px-4 py-3.5 transition",
        enabled ? "glass" : "border border-neutral-border bg-neutral-card"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-body-bold text-neutral-text">
            Need this ASAP
            {enabled && (
              <span className="ml-2 text-caption font-semibold text-gold-500">
                {emergencyLabel}
              </span>
            )}
          </p>
          <p className="mt-0.5 text-caption text-neutral-secondary">
            {enabled ? "Pro in next 3 hours" : "Turn on for next 3 hours"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Emergency ASAP toggle"
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative h-8 w-14 shrink-0 rounded-full transition",
            enabled ? "bg-pmb-700" : "bg-neutral-input"
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
              enabled ? "left-7" : "left-1"
            )}
          />
        </button>
      </div>
    </div>
  );
}
