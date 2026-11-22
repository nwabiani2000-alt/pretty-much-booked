"use client";

import { Button, TextLink } from "@/components/ui/Button";
import {
  loadProDraft,
  parsePortfolioInput,
  saveProDraft,
  SPECIALTY_OPTIONS,
  type ProOnboardingDraft,
  type ProSpecialty,
} from "@/lib/pro-onboarding";
import type { MarketId } from "@/lib/market";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** One-screen apply scaffold — name, phone, services, city, portfolio. */
export function ProApplyClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialties, setSpecialties] = useState<ProSpecialty[]>([]);
  const [city, setCity] = useState<MarketId>("london");
  const [portfolio, setPortfolio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = loadProDraft();
    if (d.displayName) setName(d.displayName);
    if (d.phone) setPhone(d.phone);
    if (d.specialties.length) setSpecialties(d.specialties);
    if (d.city) setCity(d.city);
    if (d.portfolioUrls.length) setPortfolio(d.portfolioUrls.join("\n"));
  }, []);

  function toggleSpecialty(id: ProSpecialty) {
    setSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function onSubmit() {
    setError(null);
    const displayName = name.trim();
    if (!displayName) {
      setError("Name required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone required");
      return;
    }
    if (specialties.length === 0) {
      setError("Pick at least one service");
      return;
    }

    setSaving(true);
    const prev = loadProDraft();
    const next: ProOnboardingDraft = {
      ...prev,
      displayName,
      phone: phone.trim(),
      specialties,
      city,
      portfolioUrls: parsePortfolioInput(portfolio),
      verified: prev.verified || Boolean(phone.trim()),
      completedAt: new Date().toISOString(),
    };
    saveProDraft(next);
    router.push("/pro/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-bg px-5 pb-16 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-small text-neutral-secondary no-underline">
          Customer app
        </Link>
        <Image
          src="/images/logo-icon-purple.png"
          alt="Pretty Much Booked"
          width={28}
          height={28}
        />
      </div>

      <div className="card mt-6">
        <p className="text-caption font-semibold uppercase tracking-wide text-pmb-700">
          Pros
        </p>
        <h1 className="mt-2 text-display text-neutral-text">Become a pro</h1>
        <p className="mt-2 text-small text-neutral-secondary">
          One form. We&apos;ll follow up. Manage jobs from your dashboard.
        </p>

        <label className="mt-8 block">
          <span className="text-caption text-neutral-secondary">Name</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input-underline mt-1 w-full"
          />
        </label>

        <label className="mt-6 block">
          <span className="text-caption text-neutral-secondary">Phone</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 or +234"
            className="input-underline mt-1 w-full"
          />
        </label>

        <fieldset className="mt-8">
          <legend className="text-caption text-neutral-secondary">
            Services
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((opt) => {
              const on = specialties.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSpecialty(opt.id)}
                  className={cn(
                    "pressable rounded-button px-3 py-2 text-small font-medium transition",
                    on
                      ? "bg-pmb-700 text-white"
                      : "bg-neutral-bg text-neutral-secondary"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="text-caption text-neutral-secondary">City</legend>
          <div
            role="group"
            aria-label="City"
            className="mt-3 inline-flex rounded-button bg-neutral-bg p-0.5"
          >
            {(
              [
                { id: "london", label: "London", sym: "£" },
                { id: "lagos", label: "Lagos", sym: "₦" },
              ] as const
            ).map((c) => {
              const on = city === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCity(c.id)}
                  className={cn(
                    "pressable min-h-touch px-4 py-2 text-small font-medium transition",
                    on
                      ? "rounded-button bg-neutral-card text-pmb-700 shadow-card"
                      : "text-neutral-secondary"
                  )}
                >
                  {c.label}
                  <span className="ml-1 text-neutral-muted">{c.sym}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-8 block">
          <span className="text-caption text-neutral-secondary">
            Portfolio links
          </span>
          <textarea
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="Instagram, website — one per line"
            rows={3}
            className="input-underline mt-1 w-full resize-none"
          />
        </label>

        {error ? (
          <p className="mt-4 text-small text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-10">
          <Button type="button" disabled={saving} onClick={onSubmit}>
            {saving ? "…" : "Apply"}
          </Button>
        </div>

        <TextLink
          className="mt-6 block w-full text-center"
          onClick={() => router.push("/pro/dashboard")}
        >
          I already joined
        </TextLink>
        <TextLink
          className="mt-3 block w-full text-center"
          onClick={() => router.push("/pro/onboarding?step=verify")}
        >
          Full setup
        </TextLink>
      </div>
    </main>
  );
}
