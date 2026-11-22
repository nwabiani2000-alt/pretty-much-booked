"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { Button, TextLink } from "@/components/ui/Button";
import {
  loadBooking,
  TIMELINE_STEPS,
  type StoredBooking,
} from "@/lib/booking-storage";
import {
  shouldOfferWhatsApp,
  whatsappConfirmUrl,
} from "@/lib/whatsapp";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ConfirmationClientProps = {
  bookingId: string;
};

const CONFIRM_SECONDS = 10 * 60;

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ConfirmationClient({ bookingId }: ConfirmationClientProps) {
  const { formatMoney, marketId } = useMarket();
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CONFIRM_SECONDS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setBooking(loadBooking(bookingId));
    setLoaded(true);
  }, [bookingId]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  if (!loaded) {
    return (
      <main className="mx-auto max-w-md space-y-4 bg-neutral-bg px-5 pt-20">
        <div className="skeleton mx-auto h-20 w-20 rounded-full" />
        <div className="skeleton mx-auto h-8 w-48" />
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

  const whenLabel = new Date(booking.scheduledAt).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-12 pt-8">
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-badge bg-neutral-text px-4 py-2 text-small text-white">
          {toast}
        </div>
      )}

      <div className="card animate-overshoot">
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
          className="mx-auto"
        />

        <div className="mx-auto mt-8 flex h-20 w-20 animate-check-pop items-center justify-center rounded-full bg-pmb-700 text-3xl text-white">
          ✓
        </div>
        <h1 className="mt-6 text-center text-display text-neutral-text">
          You&apos;re booked!
        </h1>
        <p className="mt-2 text-center text-small text-neutral-secondary">
          Deposit {formatMoney(booking.depositAmount)} · total{" "}
          {formatMoney(booking.totalPrice)}
        </p>
        {booking.isEmergency && (
          <div className="mt-3 flex justify-center">
            <span className="badge-gold">ASAP</span>
          </div>
        )}

        <div className="mt-10">
          <p className="text-heading text-neutral-text">{booking.proName}</p>
          <p className="text-small text-neutral-secondary">
            {booking.serviceName}
          </p>
          <p className="mt-3 text-body text-neutral-text">{whenLabel}</p>
          <p className="text-small text-neutral-secondary">{booking.address}</p>
          {booking.proPhone && (
            <a
              href={`tel:${booking.proPhone}`}
              className="mt-3 inline-flex min-h-touch items-center text-small text-pmb-700"
            >
              {booking.proPhone}
            </a>
          )}
        </div>

        <div className="mt-8">
          <p className="text-body-bold text-neutral-text">
            Waiting for pro to confirm…
          </p>
          <p className="mt-1 font-mono text-title text-pmb-700">
            {formatCountdown(secondsLeft)}
          </p>
        </div>

        <ol className="mt-8 flex justify-between">
          {TIMELINE_STEPS.map((step, i) => (
            <li
              key={step}
              className={`animate-stagger-in stagger-${i + 1} flex flex-1 flex-col items-center`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-caption font-bold ${
                  i === 0
                    ? "bg-pmb-700 text-white"
                    : "bg-pmb-50 text-neutral-secondary"
                }`}
              >
                {i + 1}
              </span>
              <span className="mt-1 text-center text-caption text-neutral-secondary">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-10 space-y-2">
          {shouldOfferWhatsApp(marketId) ? (
            <a
              href={whatsappConfirmUrl({
                bookingId,
                serviceName: booking.serviceName,
                proName: booking.proName,
                whenLabel,
                address: booking.address,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button type="button">Confirm on WhatsApp</Button>
            </a>
          ) : (
            <Link href={`/bookings/${bookingId}`} className="block">
              <Button type="button">View booking</Button>
            </Link>
          )}
          <div className="flex justify-center gap-6">
            {shouldOfferWhatsApp(marketId) ? (
              <Link
                href={`/bookings/${bookingId}`}
                className="btn-secondary no-underline"
              >
                View booking
              </Link>
            ) : null}
            <TextLink
              className="no-underline"
              onClick={() => {
                window.location.href = `/messages?booking=${bookingId}`;
              }}
            >
              Message Pro
            </TextLink>
          </div>
        </div>
      </div>

      <div className="card mt-card-gap">
        <h2 className="text-heading text-neutral-text">What happens next</h2>
        <ol className="mt-4 space-y-3 text-small text-neutral-secondary">
          <li>
            <span className="font-semibold text-neutral-text">1. Pro confirms</span>{" "}
            — within ~10 min
          </li>
          <li>
            <span className="font-semibold text-neutral-text">2. On the way</span>{" "}
            — track ETA
          </li>
          <li>
            <span className="font-semibold text-neutral-text">3. Service</span> —
            rate when done
          </li>
        </ol>
      </div>
    </main>
  );
}
