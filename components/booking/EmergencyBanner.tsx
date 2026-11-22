"use client";

import { cn } from "@/lib/utils";

type EmergencyBannerProps = {
  enabled: boolean;
  onToggle: (value: boolean) => void;
};

export function EmergencyBanner({ enabled, onToggle }: EmergencyBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-card p-card",
        enabled ? "glass" : "bg-neutral-card shadow-card"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-body-bold text-neutral-text">Need this ASAP?</p>
        <p className="text-small text-neutral-secondary">
          Pros available in &lt;1hr
        </p>
      </div>
      {enabled && <span className="badge-gold">Emergency</span>}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle emergency booking"
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
  );
}
