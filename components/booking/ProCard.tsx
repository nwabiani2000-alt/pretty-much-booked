"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { proBadge, type MockProListing } from "@/lib/mock-pros";
import { formatDuration } from "@/lib/services";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProCardProps = {
  pro: MockProListing;
  serviceId: string;
  index?: number;
};

export function ProCard({ pro, serviceId, index = 0 }: ProCardProps) {
  const { formatMoney } = useMarket();
  const offering = pro.offerings[serviceId];
  if (!offering) return null;
  const firstName = pro.display_name.split(" ")[0];
  const badge = proBadge(pro.pro_score);

  return (
    <Link
      href={`/booking/${pro.id}/${serviceId}?step=when`}
      className={cn(
        "pro-card animate-stagger-in block no-select",
        `stagger-${Math.min(6, index + 1)}`
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-avatar bg-pmb-50 text-small font-bold text-pmb-700">
          {pro.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-body-bold text-neutral-text">
              {pro.display_name}
            </h3>
            {pro.is_verified ? (
              <span className="text-pmb-700">✓</span>
            ) : null}
          </div>
          <p className="text-small text-neutral-secondary">
            {pro.rating.toFixed(1)} · {pro.reviews} reviews ·{" "}
            {pro.distance_miles} mi
          </p>
        </div>
        {badge.tone === "gold" && (
          <span className="badge-gold">Elite {pro.pro_score}</span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-price text-neutral-text">
          {formatMoney(offering.price)}
        </span>
        <span className="text-small text-neutral-secondary">
          {formatDuration(offering.duration_mins)}
        </span>
      </div>

      <div className="btn-primary mt-5 pointer-events-none">{`Book ${firstName}`}</div>
    </Link>
  );
}
