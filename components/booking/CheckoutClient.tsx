"use client";

import { StripeDepositForm } from "@/components/booking/StripeDepositForm";
import { useMarket } from "@/components/market/MarketProvider";
import { MarketToggle } from "@/components/market/MarketToggle";
import { Button, TextLink } from "@/components/ui/Button";
import { StepProgress } from "@/components/ui/StepProgress";
import { UnderlineField } from "@/components/ui/UnderlineField";
import {
  loadBooking,
  markDepositPaid,
  saveBooking,
  type StoredBooking,
} from "@/lib/booking-storage";
import { cancelPolicyLines } from "@/lib/cancel-policy";
import { DEPOSIT_RATE } from "@/lib/mock-pros";
import { tipPresetsGbp } from "@/lib/tips";
import {
  clubDiscountGbp,
  getClubPoints,
  isClubMember,
  joinClub,
  setClubPoints,
} from "@/lib/loyalty";
import { saveLook } from "@/lib/saved-looks";
import { zoneLabel } from "@/lib/travel-zones";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CheckoutClientProps = {
  bookingId: string;
};

type PaymentsConfig = {
  publishableKey: string | null;
  stripeEnabled: boolean;
  mode: "live" | "mock";
};

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CheckoutClient({ bookingId }: CheckoutClientProps) {
  const router = useRouter();
  const { formatMoney, marketId } = useMarket();
  const cancellationPolicy = useMemo(
    () => cancelPolicyLines(marketId, formatMoney),
    [formatMoney, marketId]
  );
  const tipPresets = useMemo(() => tipPresetsGbp(marketId), [marketId]);
  const [tipGbp, setTipGbp] = useState(0);
  const [escrowHold, setEscrowHold] = useState(false);
  const [clubOn, setClubOn] = useState(false);
  const [clubPts, setClubPts] = useState(0);
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [config, setConfig] = useState<PaymentsConfig | null>(null);
  const [forceMock, setForceMock] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);

  const [showCard, setShowCard] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    setBooking(loadBooking(bookingId));
    setLoaded(true);
    setClubPts(getClubPoints());
    setClubOn(isClubMember());
  }, [bookingId]);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((data: PaymentsConfig) => setConfig(data))
      .catch(() =>
        setConfig({ publishableKey: null, stripeEnabled: false, mode: "mock" })
      );
  }, []);

  const useStripeElement = Boolean(
    config?.stripeEnabled && config.publishableKey && !forceMock
  );

  useEffect(() => {
    if (!booking || !useStripeElement || clientSecret) return;
    let cancelled = false;
    setIntentLoading(true);
    fetch("/api/payments/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: booking.id,
        amountGbp: booking.depositAmount,
        market: marketId,
        tipGbp: 0,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError(data.error || "Could not start payment");
      })
      .catch(() => {
        if (!cancelled) setError("Could not start payment");
      })
      .finally(() => {
        if (!cancelled) setIntentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booking, useStripeElement, clientSecret, marketId]);

  const whenLabel = useMemo(() => {
    if (!booking) return "";
    return new Date(booking.scheduledAt).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [booking]);

  const clubDisc =
    booking && clubOn
      ? clubDiscountGbp(clubPts || getClubPoints(), booking.servicePrice)
      : 0;

  async function finishPaid() {
    const current = loadBooking(bookingId);
    if (current) {
      const tip = tipGbp;
      const disc =
        clubOn
          ? clubDiscountGbp(getClubPoints(), current.servicePrice)
          : 0;
      const total = Math.max(
        0,
        current.servicePrice +
          current.emergencyFee +
          (current.travelFee ?? 0) +
          tip -
          disc
      );
      const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;
      if (disc > 0) {
        setClubPoints(Math.max(0, getClubPoints() - Math.round(disc * 100)));
      }
      saveBooking({
        ...current,
        tipAmount: tip,
        clubDiscountGbp: disc || undefined,
        escrow: marketId === "lagos" ? escrowHold : false,
        escrowStatus:
          marketId === "lagos" && escrowHold ? "held" : "none",
        totalPrice: total,
        depositAmount: deposit,
        depositPaid: true,
        trackingStatus: current.trackingStatus ?? "pending",
      });
      saveLook({
        proId: current.proId,
        proName: current.proName,
        serviceId: current.serviceId,
        serviceName: current.serviceName,
        styleNotes: current.styleNotes,
        inspirationLabels: current.inspirationLabels,
      });
    } else {
      markDepositPaid(bookingId);
    }
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));
    router.push(`/booking/${bookingId}/confirmation`);
  }

  const displayTotal =
    booking
      ? Math.max(
          0,
          booking.servicePrice +
            booking.emergencyFee +
            (booking.travelFee ?? 0) +
            tipGbp -
            clubDisc
        )
      : 0;
  const displayDeposit = Math.round(displayTotal * DEPOSIT_RATE * 100) / 100;

  async function mockPay() {
    if (!booking || paying || success) return;

    if (showCard) {
      const digits = cardNumber.replace(/\s/g, "");
      if (digits.length < 16) {
        setFieldError("card");
        setError("Card number");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        setFieldError("expiry");
        setError("Expiry");
        return;
      }
      if (cvc.replace(/\D/g, "").length < 3) {
        setFieldError("cvc");
        setError("CVC");
        return;
      }
      if (!cardName.trim()) {
        setFieldError("name");
        setError("Name");
        return;
      }
    }

    setError(null);
    setFieldError(null);
    setPaying(true);

    try {
      await fetch("/api/payments/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amountGbp: displayDeposit,
          market: marketId,
          tipGbp: 0,
        }),
      });
    } catch {
      /* ignore */
    }

    await new Promise((r) => setTimeout(r, 700));
    setPaying(false);
    await finishPaid();
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-md space-y-4 bg-neutral-bg px-5 pt-20">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-24 w-full rounded-card" />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto max-w-md bg-neutral-bg px-5 py-12">
        <p className="text-small text-neutral-secondary">Booking not found.</p>
        <Link href="/" className="btn-secondary mt-4 no-underline">
          Home
        </Link>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-12 pt-5">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-card">
          <div className="flex h-20 w-20 animate-check-pop items-center justify-center rounded-full bg-pmb-700 text-3xl text-white">
            ✓
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/booking/${booking.proId}/${booking.serviceId}?step=where&dir=back`}
          className="btn-secondary no-underline"
        >
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

      <StepProgress
        className="mt-4"
        step={3}
        total={3}
        fraction={0.92}
        label="Almost done!"
      />

      <div className="card animate-slide-forward mt-6">
        <h1 className="text-display text-neutral-text">
          Pay {formatMoney(displayDeposit)}
        </h1>
        <p className="mt-2 text-small text-neutral-secondary">
          {booking.proName} · {booking.serviceName}
          {booking.matchMode === "match" ? " · Matched" : ""}
        </p>
        <p className="mt-1 text-small text-neutral-secondary">{whenLabel}</p>
        <p className="mt-1 text-small text-neutral-secondary">
          {booking.address}
        </p>
        {(booking.guestCount ?? 1) > 1 ? (
          <p className="mt-1 text-small text-neutral-secondary">
            {booking.guestCount} guests
            {booking.guestNames?.length
              ? ` · ${booking.guestNames.join(", ")}`
              : ""}
          </p>
        ) : null}
        {booking.isEmergency && (
          <span className="badge-gold mt-3 inline-flex">ASAP</span>
        )}
        <p className="mt-3 text-caption text-neutral-muted">
          Payment · {useStripeElement ? "Stripe" : "Mock"}
        </p>

        <div className="mt-8 flex items-baseline gap-2">
          <p className="text-price text-neutral-text">
            {formatMoney(displayTotal)}
          </p>
          <button
            type="button"
            aria-label="Price breakdown"
            onClick={() => setBreakdownOpen((v) => !v)}
            className="flex h-touch w-touch items-center justify-center text-small font-semibold text-neutral-secondary"
          >
            ?
          </button>
        </div>
        <p className="mt-1 text-small text-neutral-secondary">
          Deposit due {formatMoney(displayDeposit)}
        </p>

        {breakdownOpen && (
          <dl className="animate-fade-in mt-4 space-y-2 text-small">
            <div className="flex justify-between text-neutral-secondary">
              <dt>Service</dt>
              <dd className="text-neutral-text">
                {formatMoney(booking.servicePrice)}
              </dd>
            </div>
            {booking.isEmergency && booking.emergencyFee > 0 && (
              <div className="flex justify-between text-neutral-secondary">
                <dt>Emergency</dt>
                <dd className="text-neutral-text">
                  {formatMoney(booking.emergencyFee)}
                </dd>
              </div>
            )}
            {(booking.travelFee ?? 0) > 0 && (
              <div className="flex justify-between text-neutral-secondary">
                <dt>
                  Travel
                  {booking.travelZone
                    ? ` · ${zoneLabel(marketId, booking.travelZone)}`
                    : ""}
                </dt>
                <dd className="text-neutral-text">
                  {formatMoney(booking.travelFee ?? 0)}
                </dd>
              </div>
            )}
            {clubDisc > 0 && (
              <div className="flex justify-between text-neutral-secondary">
                <dt>PMB Club</dt>
                <dd className="text-neutral-text">−{formatMoney(clubDisc)}</dd>
              </div>
            )}
            {tipGbp > 0 && (
              <div className="flex justify-between text-neutral-secondary">
                <dt>Tip</dt>
                <dd className="text-neutral-text">{formatMoney(tipGbp)}</dd>
              </div>
            )}
            {escrowHold && marketId === "lagos" ? (
              <div className="flex justify-between text-neutral-secondary">
                <dt>Escrow</dt>
                <dd className="text-neutral-text">Held until complete</dd>
              </div>
            ) : null}
            <div className="flex justify-between text-neutral-secondary">
              <dt>Pay later</dt>
              <dd className="text-neutral-text">
                {formatMoney(displayTotal - displayDeposit)}
              </dd>
            </div>
          </dl>
        )}

        {marketId === "lagos" ? (
          <button
            type="button"
            role="switch"
            aria-checked={escrowHold}
            onClick={() => setEscrowHold((v) => !v)}
            className={`mt-6 flex w-full items-center justify-between rounded-button px-3 py-3 text-left ${
              escrowHold ? "bg-pmb-50 text-pmb-700" : "bg-neutral-bg text-neutral-secondary"
            }`}
          >
            <span>
              <span className="block text-small font-semibold">
                Hold until complete
              </span>
              <span className="text-caption">
                Paystack escrow stub · release when done
              </span>
            </span>
            <span className="text-small font-medium">
              {escrowHold ? "On" : "Off"}
            </span>
          </button>
        ) : null}

        <div className="mt-6">
          <p className="text-caption text-neutral-secondary">PMB Club</p>
          {!clubOn ? (
            <button
              type="button"
              className="btn-secondary mt-2 w-full no-underline"
              onClick={() => {
                const pts = joinClub();
                setClubPts(pts);
                setClubOn(true);
              }}
            >
              Join · 250 pts
            </button>
          ) : (
            <button
              type="button"
              aria-pressed={clubDisc > 0}
              onClick={() => setClubOn((v) => !v)}
              className={`mt-2 flex w-full items-center justify-between rounded-button px-3 py-3 text-left ${
                clubDisc > 0 ? "bg-pmb-50 text-pmb-700" : "bg-neutral-bg"
              }`}
            >
              <span className="text-small font-medium">
                Apply points ({clubPts || getClubPoints()})
              </span>
              <span className="text-small">
                {clubDisc > 0 ? `−${formatMoney(clubDisc)}` : "Off"}
              </span>
            </button>
          )}
        </div>

        <div className="mt-8">
          <p className="text-caption text-neutral-secondary">Tip (100% to pro)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={tipGbp === 0}
              onClick={() => setTipGbp(0)}
              className={`pressable rounded-button px-3 py-2 text-small font-medium ${
                tipGbp === 0
                  ? "bg-pmb-700 text-white"
                  : "bg-neutral-bg text-neutral-secondary"
              }`}
            >
              None
            </button>
            {tipPresets.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tipGbp === t}
                onClick={() => setTipGbp(t)}
                className={`pressable rounded-button px-3 py-2 text-small font-medium ${
                  tipGbp === t
                    ? "bg-pmb-700 text-white"
                    : "bg-neutral-bg text-neutral-secondary"
                }`}
              >
                {formatMoney(t)}
              </button>
            ))}
          </div>
        </div>

        {useStripeElement ? (
          intentLoading || !clientSecret || !config?.publishableKey ? (
            <div className="mt-10 space-y-3">
              <div className="skeleton h-btn-primary w-full rounded-button" />
              <div className="skeleton h-24 w-full rounded-button" />
            </div>
          ) : (
            <StripeDepositForm
              clientSecret={clientSecret}
              publishableKey={config.publishableKey}
              depositAmount={displayDeposit}
              onSuccess={() => {
                void finishPaid();
              }}
              onError={(message) => setError(message)}
              onUseMock={() => {
                setForceMock(true);
                setClientSecret(null);
                setError(null);
              }}
            />
          )
        ) : (
          <>
            <div className="mt-10 space-y-3">
              <Button
                type="button"
                variant="pay"
                disabled={paying}
                onClick={mockPay}
              >
                {paying ? "…" : "Apple Pay"}
              </Button>
              <Button
                type="button"
                className="bg-[#4285F4] active:bg-[#3367D6]"
                disabled={paying}
                onClick={mockPay}
              >
                Google Pay
              </Button>
            </div>

            {!showCard ? (
              <TextLink
                className="mt-4 w-full justify-center no-underline"
                onClick={() => setShowCard(true)}
              >
                Pay with card
              </TextLink>
            ) : (
              <div className="animate-fade-in mt-8 space-y-2">
                <UnderlineField
                  label="Card number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  state={fieldError === "card" ? "error" : "default"}
                />
                <div className="grid grid-cols-2 gap-6">
                  <UnderlineField
                    label="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    state={fieldError === "expiry" ? "error" : "default"}
                  />
                  <UnderlineField
                    label="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cvc}
                    onChange={(e) =>
                      setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    state={fieldError === "cvc" ? "error" : "default"}
                  />
                </div>
                <UnderlineField
                  label="Name"
                  autoComplete="cc-name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  state={fieldError === "name" ? "error" : "default"}
                />
                <Button
                  type="button"
                  className="mt-6"
                  disabled={paying}
                  onClick={mockPay}
                >
                  {paying
                    ? "…"
                    : `Pay ${formatMoney(displayDeposit)}`}
                </Button>
              </div>
            )}
          </>
        )}

        {error && (
          <p className="mt-3 animate-shake text-small text-error">{error}</p>
        )}

        <div className="mt-6">
          <TextLink
            className="no-underline"
            onClick={() => setPolicyOpen((v) => !v)}
          >
            Cancellation policy
          </TextLink>
          {policyOpen && (
            <ul className="animate-fade-in mt-3 space-y-1 text-small text-neutral-secondary">
              {cancellationPolicy.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <TextLink
            className="no-underline"
            onClick={() =>
              router.push(
                `/booking/${booking.proId}/${booking.serviceId}?step=where&dir=back`
              )
            }
          >
            Cancel
          </TextLink>
        </div>
      </div>
    </main>
  );
}
