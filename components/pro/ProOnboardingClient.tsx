"use client";

import { ProStepHeader } from "@/components/pro/ProStepHeader";
import { Button, TextLink } from "@/components/ui/Button";
import {
  loadProDraft,
  ONBOARDING_STEPS,
  parseStep,
  saveProDraft,
  SPECIALTY_OPTIONS,
  TOTAL_STEPS,
  type OnboardingStep,
  type ProOnboardingDraft,
  type ProSpecialty,
} from "@/lib/pro-onboarding";
import { MOCK_SERVICES } from "@/lib/services";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Draft = ProOnboardingDraft;

function stepMeta(step: OnboardingStep) {
  return ONBOARDING_STEPS.find((s) => s.id === step);
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.startsWith("44")) {
    const rest = digits.slice(2);
    return `+44 ${rest}`.trim();
  }
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function ProOnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseStep(searchParams.get("step"));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(loadProDraft());
  }, []);

  function go(next: OnboardingStep) {
    router.replace(`/pro/onboarding?step=${next}`, { scroll: false });
  }

  function update(partial: Partial<Draft>) {
    setDraft((prev) => {
      const base = prev ?? loadProDraft();
      const next = { ...base, ...partial };
      saveProDraft(next);
      return next;
    });
  }

  const meta = stepMeta(step);
  const specialtyServices = useMemo(() => {
    if (!draft) return [];
    if (draft.specialties.length === 0) return MOCK_SERVICES.slice(0, 6);
    return MOCK_SERVICES.filter((s) =>
      draft.specialties.includes(s.category as ProSpecialty)
    );
  }, [draft]);

  if (!draft) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-40 w-full rounded" />
      </main>
    );
  }

  function back() {
    if (step === "verify") router.push("/pro/join");
    else if (step === "profile") go("verify");
    else if (step === "services") go("profile");
    else if (step === "availability") go("services");
    else if (step === "done") go("availability");
  }

  /* ——— VERIFY ——— */
  if (step === "verify") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
        <ProStepHeader
          onBack={back}
          step={meta?.index}
          total={TOTAL_STEPS}
        />
        <div className="animate-slide-in mt-10">
          <h1 className="font-display text-[2rem] font-bold text-black">
            Verify
          </h1>
          <p className="mt-2 text-sm text-brand-muted">Phone number</p>

          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+44 7700 900000"
            value={draft.phone}
            onChange={(e) => {
              setOtpSent(false);
              update({ phone: e.target.value, verified: false });
            }}
            className="input-underline mt-8"
          />

          {!otpSent ? (
            <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
              <div className="mx-auto max-w-md">
                <Button
                  type="button"
                  onClick={() => {
                    if (draft.phone.replace(/\D/g, "").length < 10) {
                      setError("Enter a valid phone");
                      return;
                    }
                    setError(null);
                    setOtpSent(true);
                    setOtp(["1", "2", "3", "", "", ""]);
                  }}
                >
                  Send code
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in mt-10">
              <p className="text-sm text-brand-muted">Enter code</p>
              <div className="mt-4 flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...otp];
                      next[i] = v;
                      setOtp(next);
                      if (v && i < 5) {
                        document.getElementById(`otp-${i + 1}`)?.focus();
                      }
                      if (v) {
                        const el = document.getElementById(`otp-${i}`);
                        el?.classList.add("animate-pop");
                        window.setTimeout(
                          () => el?.classList.remove("animate-pop"),
                          400
                        );
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }}
                    className="h-14 w-11 border-b border-black/15 bg-transparent text-center text-xl font-semibold text-black outline-none focus:border-brand-purple"
                  />
                ))}
              </div>
              <TextLink
                className="mt-6"
                onClick={() => {
                  setOtp(["", "", "", "", "", ""]);
                  setOtpSent(false);
                }}
              >
                Resend
              </TextLink>
              <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
                <div className="mx-auto max-w-md">
                  <Button
                    type="button"
                    onClick={() => {
                      if (otp.join("").length < 6) {
                        setError("Enter the 6-digit code");
                        return;
                      }
                      setError(null);
                      update({
                        phone: draft.phone || formatPhone("447700900000"),
                        verified: true,
                      });
                      go("profile");
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </main>
    );
  }

  /* ——— PROFILE ——— */
  if (step === "profile") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
        <ProStepHeader onBack={back} step={2} total={TOTAL_STEPS} />
        <div className="animate-slide-in mt-10">
          <h1 className="font-display text-[2rem] font-bold text-black">
            Profile
          </h1>

          <button
            type="button"
            onClick={() => update({ photoSet: true })}
            className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-purple-light text-sm font-medium text-brand-purple transition active:scale-[0.98]"
          >
            {draft.photoSet ? "Photo ✓" : "Add photo"}
          </button>

          <input
            type="text"
            autoComplete="name"
            placeholder="Display name"
            value={draft.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            className="input-underline mt-8"
          />

          <p className="mt-10 text-sm text-brand-muted">City</p>
          <div
            role="group"
            aria-label="City"
            className="mt-3 inline-flex rounded-button bg-neutral-bg p-0.5"
          >
            {(
              [
                { id: "london" as const, label: "London" },
                { id: "lagos" as const, label: "Lagos" },
              ]
            ).map((c) => {
              const on = draft.city === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ city: c.id })}
                  className={cn(
                    "pressable min-h-touch px-4 py-2 text-sm font-medium transition",
                    on
                      ? "rounded-button bg-white text-brand-purple shadow-sm"
                      : "text-brand-muted"
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <p className="mt-10 text-sm text-brand-muted">Specialties</p>
          <div className="mt-3 flex flex-col">
            {SPECIALTY_OPTIONS.map((opt) => {
              const on = draft.specialties.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const specialties = on
                      ? draft.specialties.filter((s) => s !== opt.id)
                      : [...draft.specialties, opt.id];
                    update({ specialties });
                  }}
                  className={cn(
                    "py-4 text-left text-xl font-semibold transition active:scale-[0.98]",
                    on ? "text-brand-purple" : "text-black"
                  )}
                >
                  {opt.label}
                  {on ? " ·" : ""}
                </button>
              );
            })}
          </div>

          <label className="mt-8 block">
            <span className="text-sm text-brand-muted">Portfolio links</span>
            <textarea
              value={draft.portfolioUrls.join("\n")}
              onChange={(e) =>
                update({
                  portfolioUrls: e.target.value
                    .split(/[\n,]+/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 8),
                })
              }
              placeholder="Instagram, website — one per line"
              rows={3}
              className="input-underline mt-2 w-full resize-none"
            />
          </label>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
            <div className="mx-auto max-w-md">
              <Button
                type="button"
                onClick={() => {
                  if (!draft.displayName.trim()) {
                    setError("Name required");
                    return;
                  }
                  if (draft.specialties.length === 0) {
                    setError("Pick at least one specialty");
                    return;
                  }
                  setError(null);
                  go("services");
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ——— SERVICES + PRICING ——— */
  if (step === "services") {
    const selectedIds = new Set(draft.offerings.map((o) => o.serviceId));

    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
        <ProStepHeader onBack={back} step={3} total={TOTAL_STEPS} />
        <div className="animate-slide-in mt-10">
          <h1 className="font-display text-[2rem] font-bold text-black">
            Services
          </h1>
          <p className="mt-2 text-sm text-brand-muted">Pick and set prices</p>

          <ul className="mt-8 divide-y divide-black/5">
            {specialtyServices.map((service) => {
              const on = selectedIds.has(service.id);
              const offering = draft.offerings.find(
                (o) => o.serviceId === service.id
              );
              return (
                <li key={service.id} className="py-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (on) {
                        update({
                          offerings: draft.offerings.filter(
                            (o) => o.serviceId !== service.id
                          ),
                        });
                      } else {
                        update({
                          offerings: [
                            ...draft.offerings,
                            {
                              serviceId: service.id,
                              price: service.base_price,
                              durationMins: service.duration_mins,
                            },
                          ],
                        });
                      }
                    }}
                    className={cn(
                      "w-full text-left text-lg font-semibold transition active:scale-[0.98]",
                      on ? "text-brand-purple" : "text-black"
                    )}
                  >
                    {service.name}
                    {on ? " ·" : ""}
                  </button>
                  {on && (
                    <div className="animate-fade-in mt-3 flex items-center gap-3">
                      <span className="text-sm text-brand-muted">£</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={1}
                        value={offering?.price ?? service.base_price}
                        onChange={(e) => {
                          const price = Number(e.target.value) || 0;
                          update({
                            offerings: draft.offerings.map((o) =>
                              o.serviceId === service.id ? { ...o, price } : o
                            ),
                          });
                        }}
                        className="input-underline py-2 text-base"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
            <div className="mx-auto max-w-md">
              <Button
                type="button"
                onClick={() => {
                  if (draft.offerings.length === 0) {
                    setError("Pick at least one service");
                    return;
                  }
                  setError(null);
                  go("availability");
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ——— AVAILABILITY / RADIUS ——— */
  if (step === "availability") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
        <ProStepHeader onBack={back} step={4} total={TOTAL_STEPS} />
        <div className="animate-slide-in mt-10">
          <h1 className="font-display text-[2rem] font-bold text-black">
            Area
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            How far you travel
          </p>

          <p className="mt-10 text-4xl font-bold text-black">
            {draft.radiusKm}
            <span className="ml-1 text-lg font-medium text-brand-muted">km</span>
          </p>
          <input
            type="range"
            min={3}
            max={25}
            value={draft.radiusKm}
            onChange={(e) => update({ radiusKm: Number(e.target.value) })}
            className="mt-6 w-full accent-brand-purple"
          />

          <p className="mt-12 text-sm text-brand-muted">When you work</p>
          <button
            type="button"
            onClick={() =>
              update({ availableWeekdays: !draft.availableWeekdays })
            }
            className={cn(
              "mt-3 block w-full py-4 text-left text-xl font-semibold transition active:scale-[0.98]",
              draft.availableWeekdays ? "text-brand-purple" : "text-black"
            )}
          >
            Weekdays{draft.availableWeekdays ? " ·" : ""}
          </button>
          <button
            type="button"
            onClick={() =>
              update({ availableWeekends: !draft.availableWeekends })
            }
            className={cn(
              "block w-full py-4 text-left text-xl font-semibold transition active:scale-[0.98]",
              draft.availableWeekends ? "text-brand-purple" : "text-black"
            )}
          >
            Weekends{draft.availableWeekends ? " ·" : ""}
          </button>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
            <div className="mx-auto max-w-md">
              <Button
                type="button"
                onClick={() => {
                  if (!draft.availableWeekdays && !draft.availableWeekends) {
                    setError("Pick weekdays or weekends");
                    return;
                  }
                  setError(null);
                  update({ completedAt: new Date().toISOString() });
                  go("done");
                }}
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ——— DONE ——— */
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-6 pb-12 pt-5">
      <ProStepHeader backHref="/pro/join" />
      <div className="animate-slide-in flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 animate-pop items-center justify-center rounded-full bg-brand-purple text-3xl text-white">
          ✓
        </div>
        <h1 className="mt-6 font-display text-[2rem] font-bold text-black">
          You&apos;re in
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          {draft.displayName || "Pro"} · {draft.offerings.length} services ·{" "}
          {draft.radiusKm} km
        </p>
        <div className="mt-12 w-full max-w-xs">
          <Button
            type="button"
            onClick={() => router.push("/pro/dashboard")}
          >
            Open dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
