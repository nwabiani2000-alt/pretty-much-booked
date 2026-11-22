"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { MarketToggle } from "@/components/market/MarketToggle";
import { Button } from "@/components/ui/Button";
import {
  getServiceById,
  proBadge,
  type MockProListing,
} from "@/lib/mock-pros";
import { formatDuration } from "@/lib/services";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type ProProfileClientProps = {
  pro: MockProListing;
  preferredServiceId?: string;
};

export function ProProfileClient({
  pro,
  preferredServiceId,
}: ProProfileClientProps) {
  const { formatMoney } = useMarket();
  const badge = proBadge(pro.pro_score);
  const offeringIds = Object.keys(pro.offerings);
  const bookServiceId =
    preferredServiceId && pro.offerings[preferredServiceId]
      ? preferredServiceId
      : offeringIds[0];
  const bookOffering = bookServiceId ? pro.offerings[bookServiceId] : null;
  const bookService = bookServiceId ? getServiceById(bookServiceId) : null;

  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      <div className="bg-gradient-to-br from-brand-purple to-brand-purple-dark px-4 pb-8 pt-5 text-white">
        <div className="mx-auto max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={bookServiceId ? `/services/${bookServiceId}` : "/"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"
              aria-label="Back"
            >
              ←
            </Link>
            <MarketToggle className="bg-white/15 [&_button[aria-pressed=true]]:bg-white [&_button[aria-pressed=true]]:text-pmb-700 [&_button]:text-white/80" />
          </div>

          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-brand-purple-dark ring-4 ring-white/20",
                pro.avatar_tone
              )}
            >
              {pro.initials}
            </div>
            <h1 className="font-display text-2xl font-bold">
              {pro.display_name}{" "}
              {pro.is_verified && (
                <span className="text-sm font-semibold text-brand-gold">
                  ✓ Verified
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {pro.specialties.join(" · ")}
            </p>
            <span
              className={cn(
                "mt-3 rounded-full px-3 py-1 text-xs font-bold",
                badge.tone === "gold" && "bg-brand-gold text-brand-dark",
                badge.tone === "purple" && "bg-white text-brand-purple",
                badge.tone === "muted" && "bg-white/20 text-white"
              )}
            >
              Pro Score {pro.pro_score} · {badge.label}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto -mt-5 max-w-md px-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: pro.rating.toFixed(1), label: `${pro.reviews} reviews` },
            {
              value: String(pro.completed_bookings ?? 0),
              label: "completed",
            },
            {
              value: `${pro.response_time_mins}m`,
              label: "avg reply",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white px-2 py-3 text-center shadow-md shadow-brand-purple/10"
            >
              <p className="text-lg font-bold text-brand-dark">{stat.value}</p>
              <p className="text-[10px] text-brand-dark/55">{stat.label}</p>
            </div>
          ))}
        </div>

        <section className="mt-6">
          <h2 className="font-display text-lg font-bold text-brand-dark">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-dark/70">
            {pro.bio}
          </p>
          <p className="mt-2 text-xs text-brand-dark/45">
            Pro Score blends rating, response time, cancellations, and completed
            bookings.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-display text-lg font-bold text-brand-dark">
            Services
          </h2>
          <ul className="mt-3 space-y-2">
            {offeringIds.map((sid) => {
              const s = getServiceById(sid);
              const o = pro.offerings[sid];
              if (!s || !o) return null;
              return (
                <li
                  key={sid}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-brand-purple/8"
                >
                  <span className="text-sm font-medium text-brand-dark">
                    {s.icon} {s.name}
                  </span>
                  <span className="text-sm text-brand-purple">
                    {formatMoney(o.price)} · {formatDuration(o.duration_mins)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6 mb-8">
          <h2 className="font-display text-lg font-bold text-brand-dark">
            Portfolio
          </h2>
          <p className="mt-1 text-xs text-brand-dark/55">
            Real client work only — stock / salon stock photos are rejected.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(pro.portfolio_images ?? Array.from({ length: 6 })).map((key, i) => (
              <div
                key={`${key}-${i}`}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br",
                  i % 3 === 0 && "from-brand-purple/40 to-brand-purple-light",
                  i % 3 === 1 && "from-brand-gold/50 to-brand-purple/20",
                  i % 3 === 2 && "from-brand-purple-dark/30 to-brand-gold/30"
                )}
              >
                <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                  Real work
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-brand-dark/45">
            Pros attest each upload is their finished work on a real client.
          </p>
        </section>
      </div>

      {bookServiceId && bookOffering && bookService && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-brand-purple/10 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-dark">
                Book {pro.display_name}
              </p>
              <p className="truncate text-xs text-brand-dark/55">
                From {formatMoney(bookOffering.price)} · {pro.next_available}
              </p>
            </div>
            <Link href={`/booking/${pro.id}/${bookServiceId}`}>
              <Button type="button">Book {pro.display_name.split(" ")[0]}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
