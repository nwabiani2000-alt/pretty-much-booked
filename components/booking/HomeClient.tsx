"use client";

import { MarketToggle } from "@/components/market/MarketToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { loadSavedLook, type SavedLook } from "@/lib/saved-looks";
import { HOME_CATEGORIES } from "@/lib/services";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function HomeClient() {
  const router = useRouter();
  const [scrollPct, setScrollPct] = useState(0);
  const [parallax, setParallax] = useState(0);
  const [catalogMode, setCatalogMode] = useState<"live" | "mock" | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [savedLook, setSavedLook] = useState<SavedLook | null>(null);

  useEffect(() => {
    setSavedLook(loadSavedLook());
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      setScrollPct(Math.min(100, (window.scrollY / max) * 100));
      setParallax(Math.min(24, window.scrollY * 0.25));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(
        (data: {
          mode?: "live" | "mock";
          services?: { category: string }[];
        }) => {
          setCatalogMode(data.mode ?? "mock");
          const next: Record<string, number> = {};
          for (const s of data.services ?? []) {
            next[s.category] = (next[s.category] ?? 0) + 1;
          }
          setCounts(next);
        }
      )
      .catch(() => setCatalogMode("mock"));
  }, []);

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-28">
      <div className="fixed inset-x-0 top-0 z-50 mx-auto h-0.5 max-w-md">
        <div
          className="progress-fill h-full"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      <div className="card mt-6">
        <div
          style={{ transform: `translateY(${parallax * 0.15}px)` }}
          className="will-change-transform"
        >
          <div className="flex items-center justify-between gap-3">
            <Image
              src="/images/logo-icon-purple.png"
              alt="Pretty Much Booked"
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />
            <MarketToggle />
          </div>
          <p className="mt-3 text-caption font-medium uppercase tracking-wide text-neutral-muted">
            Catalog · {catalogMode ?? "…"}
          </p>
          <h1 className="mt-section text-display text-neutral-text">
            What do you need?
          </h1>
        </div>

        {savedLook ? (
          <div className="mt-8 border-t border-neutral-border pt-6">
            <p className="text-caption text-neutral-muted">Book again</p>
            <p className="mt-1 text-body-bold text-neutral-text">
              {savedLook.serviceName} · {savedLook.proName}
            </p>
            <div className="mt-4">
              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/booking/${savedLook.proId}/${savedLook.serviceId}?step=when`
                  )
                }
              >
                Rebook
              </Button>
            </div>
          </div>
        ) : null}

        <nav className="mt-section flex flex-col">
          {HOME_CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => router.push(`/book/${cat.id}`)}
              className={`animate-fade-up stagger-${i + 1} pressable no-select min-h-touch w-full border-b border-neutral-border py-5 text-left last:border-0 active:text-pmb-700`}
            >
              <span className="block text-title text-neutral-text">
                {cat.label}
              </span>
              {counts[cat.id] != null ? (
                <span className="mt-0.5 block text-small text-neutral-secondary">
                  {counts[cat.id]} services
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <p className="mt-10 pb-2 text-center text-caption text-neutral-muted">
        <Link href="/pro/join" className="text-neutral-secondary no-underline">
          Are you a pro?
        </Link>
      </p>

      <BottomNav showBook bookHref="/" />
    </main>
  );
}
