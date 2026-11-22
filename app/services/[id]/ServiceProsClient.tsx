"use client";

import { ProCard } from "@/components/booking/ProCard";
import { MarketToggle } from "@/components/market/MarketToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button, TextLink } from "@/components/ui/Button";
import { StepProgress } from "@/components/ui/StepProgress";
import { getProsForService } from "@/lib/mock-pros";
import type { Service } from "@/types/booking";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type SortKey = "recommended" | "price" | "rating" | "nearest";
type Mode = "match" | "pick";

type ServiceProsClientProps = {
  service: Service;
};

const INITIAL_VISIBLE = 3;

export function ServiceProsClient({ service }: ServiceProsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emergencyDefault =
    searchParams.get("asap") === "1" || searchParams.get("emergency") === "1";
  const [mode, setMode] = useState<Mode>(
    emergencyDefault ? "match" : "pick"
  );
  const [sort, setSort] = useState<SortKey>("recommended");
  const [availableNow, setAvailableNow] = useState(emergencyDefault);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const pros = useMemo(() => {
    let list = getProsForService(service.id);
    if (availableNow) list = list.filter((p) => p.is_available_now);
    const sorted = [...list];
    switch (sort) {
      case "price":
        sorted.sort(
          (a, b) =>
            (a.offerings[service.id]?.price ?? 0) -
            (b.offerings[service.id]?.price ?? 0)
        );
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "nearest":
        sorted.sort((a, b) => a.distance_miles - b.distance_miles);
        break;
      default:
        sorted.sort((a, b) => b.pro_score - a.pro_score);
    }
    return sorted;
  }, [service.id, sort, availableNow]);

  const visible = showAll ? pros : pros.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, pros.length - INITIAL_VISIBLE);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-28 pt-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/book/${service.category}`}
          className="btn-secondary no-underline"
        >
          Back
        </Link>
        <MarketToggle className="ml-auto" />
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
        <div className="relative">
          <button
            type="button"
            aria-label="More"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-touch w-touch items-center justify-center text-heading text-neutral-secondary"
          >
            …
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-40 rounded-button bg-neutral-card py-2 shadow-card">
              {(
                [
                  ["recommended", "Best match"],
                  ["price", "Price"],
                  ["rating", "Rating"],
                  ["nearest", "Nearest"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className="block min-h-touch w-full px-3 py-2 text-left text-small text-neutral-text"
                  onClick={() => {
                    setSort(key);
                    setMenuOpen(false);
                  }}
                >
                  {label}
                  {sort === key ? " ·" : ""}
                </button>
              ))}
              <button
                type="button"
                className="block min-h-touch w-full px-3 py-2 text-left text-small text-neutral-text"
                onClick={() => {
                  setAvailableNow((v) => !v);
                  setMenuOpen(false);
                }}
              >
                Available now{availableNow ? " ·" : ""}
              </button>
            </div>
          )}
        </div>
      </div>

      <StepProgress
        className="mt-4"
        step={1}
        total={3}
        fraction={0.33}
        label="Step 1 of 3"
      />

      <h1 className="mt-8 text-display text-neutral-text">{service.name}</h1>

      <div
        role="group"
        aria-label="How to book"
        className="mt-4 inline-flex rounded-button bg-neutral-card p-0.5 shadow-card"
      >
        {(
          [
            { id: "match" as const, label: "Match me" },
            { id: "pick" as const, label: "Pick a pro" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "pressable min-h-touch px-4 py-2 text-small font-medium transition",
              mode === m.id
                ? "rounded-button bg-pmb-700 text-white"
                : "text-neutral-secondary"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-small text-neutral-secondary">
        {mode === "match"
          ? "We’ll assign the best available pro"
          : `${pros.length} pros · tap to book`}
      </p>

      {mode === "match" ? (
        <div className="card mt-6">
          <p className="text-body-bold text-neutral-text">Matched booking</p>
          <p className="mt-2 text-small text-neutral-secondary">
            Same-day and ASAP default to Match. You still see price and deposit
            before pay.
          </p>
          <div className="mt-6">
            <Button
              type="button"
              onClick={() => {
                const top = pros[0];
                if (!top) return;
                router.push(
                  `/booking/${top.id}/${service.id}?step=when&match=1`
                );
              }}
            >
              Continue
            </Button>
          </div>
          <TextLink
            className="mt-4 block text-center no-underline"
            onClick={() => setMode("pick")}
          >
            Pick a pro instead
          </TextLink>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-card-gap">
            {visible.map((pro, i) => (
              <ProCard
                key={pro.id}
                pro={pro}
                serviceId={service.id}
                index={i}
              />
            ))}
            {pros.length === 0 && (
              <div className="card">
                <p className="text-small text-neutral-secondary">
                  None match.{" "}
                  <TextLink onClick={() => setAvailableNow(false)}>
                    Clear
                  </TextLink>
                </p>
              </div>
            )}
          </div>

          {!showAll && hiddenCount > 0 && (
            <div className="mt-4 flex justify-center">
              <TextLink onClick={() => setShowAll(true)}>
                Show more ({hiddenCount})
              </TextLink>
            </div>
          )}
        </>
      )}

      <BottomNav showBook={false} />
    </main>
  );
}
