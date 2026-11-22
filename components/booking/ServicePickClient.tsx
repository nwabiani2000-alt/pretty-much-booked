"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { MarketToggle } from "@/components/market/MarketToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { formatDuration, getPopularServices } from "@/lib/services";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/types/booking";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ServicePickClientProps = {
  category: Extract<ServiceCategory, "hair" | "nails" | "makeup">;
  label: string;
};

export function ServicePickClient({ category, label }: ServicePickClientProps) {
  const router = useRouter();
  const { formatFromPrice } = useMarket();
  const fallback = getPopularServices(category);
  const [services, setServices] = useState<Service[]>(fallback);
  const [mode, setMode] = useState<"live" | "mock" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/services?category=${category}`)
      .then((r) => r.json())
      .then((data: { mode?: "live" | "mock"; services?: Service[] }) => {
        if (cancelled) return;
        if (data.services && data.services.length > 0) {
          setServices(data.services);
          setMode(data.mode ?? "mock");
        } else {
          setMode("mock");
        }
      })
      .catch(() => {
        if (!cancelled) setMode("mock");
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-bg px-5 pb-28 pt-5">
      <div className="flex items-center justify-between gap-2">
        <Link href="/book" className="btn-secondary no-underline">
          Back
        </Link>
        <MarketToggle />
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <div className="card mt-8">
        <p className="text-caption font-medium uppercase tracking-wide text-neutral-muted">
          Catalog · {mode ?? "…"}
        </p>
        <h1 className="mt-2 text-display text-neutral-text">{label}</h1>
        <p className="mt-2 text-small text-neutral-secondary">Pick one</p>

        <ul className="mt-6 flex flex-col">
          {services.map((service, i) => {
            const active = service.id === selectedId;
            return (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(service.id);
                    window.setTimeout(() => {
                      router.push(`/services/${service.id}`);
                    }, 180);
                  }}
                  className={cn(
                    "animate-fade-up pressable no-select w-full border-b border-neutral-border py-4 text-left last:border-0",
                    `stagger-${Math.min(6, i + 1)}`,
                    active ? "text-pmb-700" : "text-neutral-text"
                  )}
                >
                  <span className="block text-heading">{service.name}</span>
                  <span className="mt-0.5 block text-small text-neutral-secondary">
                    {formatFromPrice(service.base_price)} ·{" "}
                    {formatDuration(service.duration_mins)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <BottomNav showBook={false} />
    </main>
  );
}
