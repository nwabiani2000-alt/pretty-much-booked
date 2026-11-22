"use client";

import { InspirationBrief } from "@/components/booking/InspirationBrief";
import { needsConsultForm, consultFields } from "@/lib/consult-forms";
import { PrepChecklistBlock } from "@/components/booking/PrepChecklist";
import { TravelZonePicker } from "@/components/booking/TravelZonePicker";
import { useMarket } from "@/components/market/MarketProvider";
import { MarketToggle } from "@/components/market/MarketToggle";
import { Button, TextLink } from "@/components/ui/Button";
import { StepProgress } from "@/components/ui/StepProgress";
import {
  UnderlineField,
  UnderlineTextarea,
} from "@/components/ui/UnderlineField";
import {
  combineDateAndHour,
  emergencyTimeSlots,
  formatDayLabel,
  formatHourLabel,
  nextFourteenDays,
  sameDay,
  standardTimeSlots,
} from "@/lib/booking-time";
import { saveBooking } from "@/lib/booking-storage";
import {
  DEPOSIT_RATE,
  EMERGENCY_FEE,
  type MockProListing,
} from "@/lib/mock-pros";
import {
  defaultZone,
  travelFeeGbp,
  type TravelZoneId,
} from "@/lib/travel-zones";
import type { Service } from "@/types/booking";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type BookingDetailsClientProps = {
  pro: MockProListing;
  service: Service;
  price: number;
  durationMins: number;
};

type Step = "when" | "where";

export function BookingDetailsClient({
  pro,
  service,
  price,
  durationMins,
}: BookingDetailsClientProps) {
  const router = useRouter();
  const { formatMoney, emergencyLabel, market, marketId } = useMarket();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const step: Step = stepParam === "where" ? "where" : "when";
  const direction = searchParams.get("dir") === "back" ? "back" : "forward";
  const matchMode =
    searchParams.get("match") === "1" || pro.id === "match"
      ? "match"
      : "pick";

  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<Date[]>([]);
  const [emergency, setEmergency] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [styleNotes, setStyleNotes] = useState("");
  const [inspirationLabels, setInspirationLabels] = useState<string[]>([]);
  const [travelZone, setTravelZone] = useState<TravelZoneId>(
    defaultZone("london")
  );
  const [prepOk, setPrepOk] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState("");
  const [consult, setConsult] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeAddress, setShakeAddress] = useState(false);
  const [emergencySlots, setEmergencySlots] = useState<
    { date: Date; hour: number }[]
  >([]);

  useEffect(() => {
    setTravelZone(defaultZone(marketId));
  }, [marketId]);

  useEffect(() => {
    const d = nextFourteenDays();
    setDays(d);
    setSelectedDate(d[0] ?? null);
    setEmergencySlots(emergencyTimeSlots());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSelectedHour(null);
    if (emergency) {
      const first = emergencySlots[0];
      if (first) setSelectedDate(first.date);
    } else if (days[0]) {
      setSelectedDate(days[0]);
    }
  }, [emergency, ready, days, emergencySlots]);

  function go(next: Step, dir: "forward" | "back" = "forward") {
    router.replace(
      `/booking/${pro.id}/${service.id}?step=${next}&dir=${dir}`,
      { scroll: false }
    );
  }

  function onPickTime(date: Date, hour: number) {
    setSelectedDate(date);
    setSelectedHour(hour);
    window.setTimeout(() => go("where", "forward"), 160);
  }

  function onContinueWhere() {
    if (!address.trim()) {
      setError("Address required");
      setShakeAddress(true);
      window.setTimeout(() => setShakeAddress(false), 220);
      return;
    }
    if (!selectedDate || selectedHour === null) {
      setError("Pick a time");
      go("when", "back");
      return;
    }
    if (!prepOk) {
      setError("Confirm you’ll be ready");
      return;
    }
    setError(null);
    setSubmitting(true);
    const scheduledAt = combineDateAndHour(selectedDate, selectedHour);
    const bookingId = `bk_${Date.now().toString(36)}`;
    const travel = travelFeeGbp(marketId, travelZone);
    const emergencyFee = emergency ? EMERGENCY_FEE : 0;
    const guests = Math.max(1, Math.min(6, guestCount));
    const serviceTotal = price * guests;
    const total = serviceTotal + emergencyFee + travel;
    const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;
    const showConsult = needsConsultForm(service.category);
    if (showConsult) {
      const fields = consultFields(service.category);
      const missing = fields.filter((f) => f.type === "yesno" && !consult[f.id]);
      if (missing.length) {
        setError("Complete the consult form");
        setSubmitting(false);
        return;
      }
    }

    try {
      saveBooking({
        id: bookingId,
        proId: pro.id,
        serviceId: service.id,
        proName:
          matchMode === "match" ? "Matched pro" : pro.display_name,
        proInitials: pro.initials,
        proAvatarTone: pro.avatar_tone,
        proPhone: `+44 7700 900${String(pro.id).padStart(2, "0")}`,
        serviceName: service.name,
        serviceIcon: service.icon,
        serviceCategory: service.category,
        scheduledAt: scheduledAt.toISOString(),
        address: address.trim(),
        notes: notes.trim() || null,
        styleNotes: styleNotes.trim() || null,
        inspirationLabels,
        isEmergency: emergency,
        matchMode,
        travelZone,
        travelFee: travel,
        prepAcknowledged: true,
        guestCount: guests,
        guestNames: guestNames
          .split(/[,\n]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, guests),
        consultAnswers: needsConsultForm(service.category) ? consult : undefined,
        servicePrice: serviceTotal,
        emergencyFee,
        durationMins,
        totalPrice: total,
        depositAmount: deposit,
        trackingStatus: "pending",
      });
    } catch {
      /* ignore */
    }
    router.push(`/booking/${bookingId}/checkout`);
  }

  const stepNum = step === "when" ? 2 : 3;
  const fraction = step === "when" ? 0.55 : 0.78;
  const slideClass =
    direction === "back" ? "animate-slide-back" : "animate-slide-forward";

  const travelPreview = travelFeeGbp(marketId, travelZone);
  const guestsPreview = Math.max(1, Math.min(6, guestCount));
  const totalPreview =
    price * guestsPreview + (emergency ? EMERGENCY_FEE : 0) + travelPreview;
  const depositPreview = Math.round(totalPreview * DEPOSIT_RATE * 100) / 100;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-28 pt-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn-secondary no-underline"
          onClick={() => {
            if (step === "where") go("when", "back");
            else router.push(`/services/${service.id}`);
          }}
        >
          Back
        </button>
        <MarketToggle />
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <StepProgress
        className="mt-4"
        step={stepNum}
        total={3}
        fraction={fraction}
      />

      <p className="mt-6 text-small text-neutral-secondary">
        {pro.display_name} · {service.name}
      </p>
      <p className="mt-1 text-body text-neutral-text">
        <span className="text-body-bold">{formatMoney(totalPreview)}</span>
        <span className="text-neutral-secondary">
          {" "}
          · deposit {formatMoney(depositPreview)}
        </span>
        {emergency && <span className="badge-gold ml-2">ASAP</span>}
      </p>

      {step === "when" && (
        <div className={cn("card mt-4", slideClass)}>
          <h1 className="text-display text-neutral-text">When?</h1>

          {!ready && (
            <div className="mt-8 space-y-4">
              <div className="skeleton h-14 w-full" />
              <div className="skeleton h-32 w-full" />
            </div>
          )}

          {ready && !emergency && (
            <>
              <div className="-mx-1 mt-8 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar">
                {days.map((day) => {
                  const active = selectedDate
                    ? sameDay(selectedDate, day)
                    : false;
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedHour(null);
                      }}
                      className={cn(
                        "pressable no-select flex min-h-touch min-w-[3.75rem] shrink-0 flex-col items-center justify-center py-2 text-center",
                        active ? "text-pmb-700" : "text-neutral-text"
                      )}
                    >
                      <span className="block text-caption text-neutral-secondary">
                        {formatDayLabel(day)}
                      </span>
                      <span
                        className={cn(
                          "mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-heading",
                          active && "bg-pmb-700 text-white"
                        )}
                      >
                        {day.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="animate-fade-in mt-8">
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                    {standardTimeSlots().map((hour, i) => {
                      const active = selectedHour === hour;
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => onPickTime(selectedDate, hour)}
                          className={cn(
                            "animate-fade-up pressable no-select min-h-touch py-3 text-center text-body-bold",
                            `stagger-${Math.min(6, i + 1)}`,
                            active ? "text-pmb-700" : "text-neutral-text"
                          )}
                        >
                          {formatHourLabel(hour)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {ready && emergency && (
            <div className="animate-fade-in mt-8 grid grid-cols-3 gap-2">
              {emergencySlots.map((slot) => (
                <button
                  key={slot.date.toISOString()}
                  type="button"
                  onClick={() => onPickTime(slot.date, slot.hour)}
                  className="pressable no-select min-h-touch py-4 text-center"
                >
                  <span className="block text-caption text-neutral-secondary">
                    {formatDayLabel(slot.date)}
                  </span>
                  <span className="text-body-bold text-neutral-text">
                    {formatHourLabel(slot.hour)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {ready && (
            <div className="mt-10">
              <button
                type="button"
                onClick={() => setEmergency((v) => !v)}
                className={cn(
                  "pressable no-select flex min-h-touch w-full items-center justify-between rounded-button px-4 py-3 text-left text-small",
                  emergency ? "glass" : "text-neutral-secondary"
                )}
              >
                <span className="text-neutral-text">
                  {emergency ? "Standard times" : "Need this ASAP?"}
                </span>
                {emergency && (
                  <span className="badge-gold">{emergencyLabel}</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {step === "where" && (
        <div className={cn("card mt-4", slideClass)}>
          <h1 className="text-display text-neutral-text">Where?</h1>

          <div className="mt-8">
            <UnderlineField
              label="Address"
              hintPlaceholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              state={
                shakeAddress ? "error" : address.trim() ? "success" : "default"
              }
              errorText={shakeAddress ? "Address required" : undefined}
              className={shakeAddress ? "animate-shake" : undefined}
            />
            <TextLink
              className="mt-2 no-underline"
              onClick={() => setAddress(market.defaultAddress)}
            >
              Use my location
            </TextLink>
          </div>

          <div className="mt-8">
            <p className="text-caption font-medium uppercase tracking-wide text-neutral-muted">
              Guests
            </p>
            <p className="mt-1 text-small text-neutral-secondary">
              Same address · price × guests
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
              >
                −
              </button>
              <span className="text-body-bold w-8 text-center">{guestCount}</span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setGuestCount((n) => Math.min(6, n + 1))}
              >
                +
              </button>
            </div>
            {guestCount > 1 ? (
              <input
                value={guestNames}
                onChange={(e) => setGuestNames(e.target.value)}
                placeholder="Guest names (optional)"
                className="input-underline mt-4 w-full"
              />
            ) : null}
          </div>

          {needsConsultForm(service.category) ? (
            <div className="mt-8">
              <p className="text-caption font-medium uppercase tracking-wide text-neutral-muted">
                Consult
              </p>
              {consultFields(service.category).map((f) => (
                <div key={f.id} className="mt-4">
                  <p className="text-small text-neutral-text">{f.label}</p>
                  {f.type === "yesno" ? (
                    <div className="mt-2 flex gap-2">
                      {(["yes", "no"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={consult[f.id] === v}
                          onClick={() =>
                            setConsult((c) => ({ ...c, [f.id]: v }))
                          }
                          className={`pressable rounded-button px-3 py-2 text-small font-medium ${
                            consult[f.id] === v
                              ? "bg-pmb-700 text-white"
                              : "bg-neutral-bg text-neutral-secondary"
                          }`}
                        >
                          {v === "yes" ? "Yes" : "No"}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      className="input-underline mt-2 w-full"
                      value={consult[f.id] ?? ""}
                      onChange={(e) =>
                        setConsult((c) => ({ ...c, [f.id]: e.target.value }))
                      }
                      placeholder="Optional"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <TravelZonePicker value={travelZone} onChange={setTravelZone} />

          <InspirationBrief
            styleNotes={styleNotes}
            onStyleNotes={setStyleNotes}
            labels={inspirationLabels}
            onLabels={setInspirationLabels}
          />

          <PrepChecklistBlock
            category={service.category}
            checked={prepOk}
            onChecked={setPrepOk}
          />

          {!showNotes ? (
            <TextLink
              className="mt-6 no-underline"
              onClick={() => setShowNotes(true)}
            >
              Access notes (optional)
            </TextLink>
          ) : (
            <div className="mt-6 animate-fade-in">
              <UnderlineTextarea
                label="Access notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {error && !shakeAddress && (
            <p className="mt-4 animate-shake text-small text-error">{error}</p>
          )}

          <div className="fixed inset-x-0 bottom-0 z-30 bg-neutral-card px-5 py-4 shadow-card">
            <div className="mx-auto max-w-md">
              <Button type="button" disabled={submitting} onClick={onContinueWhere}>
                {submitting ? "…" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
