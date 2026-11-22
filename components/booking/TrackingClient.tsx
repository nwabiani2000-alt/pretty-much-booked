"use client";

import {
  LAGOS_DEST,
  LAGOS_START,
  LONDON_DEST,
  LONDON_START,
  TrackingMap,
} from "@/components/booking/TrackingMap";
import { useMarket } from "@/components/market/MarketProvider";
import { Button, TextLink } from "@/components/ui/Button";
import {
  cancelBooking,
  loadBooking,
  saveBooking,
  setTrackingStatus,
  updateBooking,
  TIMELINE_STEPS,
  TRACKING_STATUSES,
  timelineIndex,
  type StoredBooking,
  type TrackingStatus,
} from "@/lib/booking-storage";
import { maskPhone } from "@/lib/security/privacy";
import { formatDuration } from "@/lib/services";
import { tipPresetsGbp } from "@/lib/tips";
import { ensureDemoBooking } from "@/lib/tracking-demo";
import { cn } from "@/lib/utils";
import { joinWaitlist } from "@/lib/waitlist";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type TrackingClientProps = {
  bookingId: string;
};

const INITIAL_ETA = 12;

function statusTitle(status: TrackingStatus, booking: StoredBooking): string {
  const time = new Date(booking.scheduledAt).toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });
  switch (status) {
    case "pending":
      return "Waiting for pro";
    case "confirmed":
      return `See you at ${time}`;
    case "on_the_way":
      return "On the way";
    case "in_progress":
      return "In progress";
    case "completed":
      return "How was it?";
  }
}

export function TrackingClient({ bookingId }: TrackingClientProps) {
  const router = useRouter();
  const { formatMoney, marketId } = useMarket();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(0);
  const [etaMins, setEtaMins] = useState(INITIAL_ETA);
  const [progress, setProgress] = useState(0.08);
  const [toast, setToast] = useState<string | null>(null);
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [postTip, setPostTip] = useState(0);

  const queryStatus = searchParams.get("status") as TrackingStatus | null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let data = loadBooking(bookingId);
      if (!data && bookingId === "bk_demo_track") {
        data = ensureDemoBooking(bookingId);
      }

      // IDOR defense: if we don't have a local session booking, try API with
      // access_token from query — without token the API returns 403.
      if (!data) {
        const token = searchParams.get("access_token");
        if (token) {
          try {
            const res = await fetch(
              `/api/bookings/${encodeURIComponent(bookingId)}?access_token=${encodeURIComponent(token)}`
            );
            if (res.status === 403 || res.status === 401) {
              if (!cancelled) {
                setBooking(null);
                setLoaded(true);
              }
              return;
            }
            if (res.ok) {
              const json = (await res.json()) as {
                booking?: {
                  id: string;
                  address_text: string;
                  total_price: number;
                  deposit_amount: number;
                  scheduled_at: string;
                  pro_id: string;
                  service_id: string;
                  is_emergency: boolean;
                  status: string;
                };
              };
              if (json.booking) {
                data = {
                  id: json.booking.id,
                  proId: json.booking.pro_id,
                  serviceId: json.booking.service_id,
                  proName: "Your pro",
                  serviceName: "Service",
                  scheduledAt: json.booking.scheduled_at,
                  address: json.booking.address_text,
                  isEmergency: json.booking.is_emergency,
                  servicePrice: json.booking.total_price,
                  emergencyFee: 0,
                  durationMins: 60,
                  totalPrice: json.booking.total_price,
                  depositAmount: json.booking.deposit_amount,
                  accessToken: token,
                  trackingStatus: "pending",
                };
                saveBooking(data);
              }
            }
          } catch {
            /* keep null */
          }
        }
      }

      const valid = TRACKING_STATUSES.some((s) => s.id === queryStatus);
      if (data && valid && queryStatus) {
        data = setTrackingStatus(bookingId, queryStatus) ?? data;
      }
      if (!cancelled) {
        setBooking(data);
        setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [bookingId, queryStatus, searchParams]);

  const status: TrackingStatus = booking?.trackingStatus ?? "pending";

  // Mock location updates while on the way
  useEffect(() => {
    if (status !== "on_the_way") {
      setEtaMins(INITIAL_ETA);
      setProgress(0.08);
      return;
    }
    setEtaMins(INITIAL_ETA);
    setProgress(0.08);
    const tick = window.setInterval(() => {
      setEtaMins((m) => {
        if (m <= 1) {
          window.clearInterval(tick);
          return 1;
        }
        return m - 1;
      });
      setProgress((p) => Math.min(0.92, p + 0.07));
    }, 2500);
    return () => window.clearInterval(tick);
  }, [status]);

  useEffect(() => {
    if (status !== "in_progress") {
      setElapsed(0);
      return;
    }
    const tick = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(tick);
  }, [status]);

  const step = timelineIndex(status);
  const title = useMemo(
    () => (booking ? statusTitle(status, booking) : ""),
    [booking, status]
  );

  function flipStatus(next: TrackingStatus) {
    let updated = setTrackingStatus(bookingId, next);
    if (updated && next === "completed" && updated.escrowStatus === "held") {
      updated = updateBooking(bookingId, { escrowStatus: "released" });
      showToast("Escrow released (mock)");
    }
    if (updated) {
      setBooking(updated);
      router.replace(`/bookings/${bookingId}?status=${next}`, { scroll: false });
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-56 w-full rounded" />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto max-w-md px-6 py-12">
        <p className="text-sm text-brand-muted">Booking not found.</p>
        <TextLink
          className="mt-4"
          onClick={() => {
            ensureDemoBooking();
            router.push("/bookings/bk_demo_track?status=on_the_way");
          }}
        >
          Open demo tracking
        </TextLink>
        <Link href="/book" className="mt-4 block text-sm text-brand-muted">
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
    <main className="mx-auto min-h-screen w-full max-w-md bg-white pb-16">
      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}

      <div className="px-6 pt-5">
        <div className="flex items-center justify-between">
          <Link
            href={`/booking/${bookingId}/confirmation`}
            className="text-sm text-brand-muted"
          >
            Back
          </Link>
          <Image
            src="/images/logo-icon-purple.png"
            alt=""
            width={24}
            height={24}
          />
        </div>

        <p className="mt-8 text-sm text-brand-purple">
          {TRACKING_STATUSES.find((s) => s.id === status)?.label}
        </p>
        <h1 className="mt-1 font-display text-[2rem] font-bold text-black">
          {title}
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          {booking.proName} · {booking.serviceName}
        </p>
      </div>

      {/* Map — primary for on_the_way */}
      {(status === "on_the_way" || status === "confirmed") && (
        <section className="mt-6">
          <TrackingMap
            progress={status === "on_the_way" ? progress : 0.05}
            etaMins={status === "on_the_way" ? etaMins : INITIAL_ETA}
            proLabel={booking.proInitials ?? booking.proName}
            address={booking.address}
            destLngLat={marketId === "lagos" ? LAGOS_DEST : LONDON_DEST}
            startLngLat={marketId === "lagos" ? LAGOS_START : LONDON_START}
          />
          {status === "on_the_way" && (
            <div className="px-6 pt-4">
              <p className="text-3xl font-bold text-black">{etaMins} min</p>
              <p className="mt-1 text-sm text-brand-muted">
                ETA · updates every few seconds
              </p>
            </div>
          )}
          {status === "confirmed" && (
            <p className="px-6 pt-4 text-sm text-brand-muted">
              Map ready when they leave
            </p>
          )}
        </section>
      )}

      {/* Timeline */}
      <ol className="mt-8 flex justify-between px-6">
        {TIMELINE_STEPS.map((label, i) => {
          const done = i <= step;
          return (
            <li key={label} className="flex flex-1 flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                  done
                    ? "bg-brand-purple text-white"
                    : "bg-brand-purple-light text-brand-muted"
                )}
              >
                {done && i < step ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "mt-1.5 text-center text-[9px] font-medium",
                  done ? "text-black" : "text-brand-muted"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Details */}
      <section className="mt-10 px-6">
        <p className="text-sm text-brand-muted">When</p>
        <p className="mt-1 text-base text-black">{whenLabel}</p>
        <p className="mt-4 text-sm text-brand-muted">Where</p>
        <p className="mt-1 text-base text-black">{booking.address}</p>
        {status === "pending" && booking.proPhone && (
          <p className="mt-6 text-sm text-brand-muted">
            Pro phone {maskPhone(booking.proPhone)} (shown after confirm)
          </p>
        )}
        {status !== "pending" && booking.proPhone && (
          <a
            href={`tel:${booking.proPhone}`}
            className="mt-6 inline-block text-sm font-medium text-brand-purple"
          >
            Call {booking.proName.split(" ")[0]}
          </a>
        )}
        {status === "pending" && !booking.cancelledAt && (
          <TextLink
            className="mt-6"
            onClick={() => {
              cancelBooking(bookingId);
              const next = loadBooking(bookingId);
              setBooking(next);
              showToast("Cancelled");
            }}
          >
            Cancel booking
          </TextLink>
        )}
        {booking.cancelledAt && (
          <div className="mt-6">
            <p className="text-sm text-brand-muted">Booking cancelled</p>
            {!waitlistJoined && !booking.waitlistJoined ? (
              <Button
                type="button"
                className="mt-3"
                onClick={() => {
                  joinWaitlist({
                    bookingId,
                    serviceId: booking.serviceId,
                    serviceName: booking.serviceName,
                    scheduledAt: booking.scheduledAt,
                    address: booking.address,
                  });
                  updateBooking(bookingId, { waitlistJoined: true });
                  setWaitlistJoined(true);
                  setBooking(loadBooking(bookingId));
                  showToast("On the waitlist");
                }}
              >
                Join waitlist for this slot
              </Button>
            ) : (
              <p className="mt-2 text-sm text-brand-purple">
                You’re on the waitlist — we’ll notify if a pro opens up (mock).
              </p>
            )}
          </div>
        )}
      </section>

      {status === "in_progress" && (
        <section className="mt-10 px-6 text-center">
          <p className="text-sm text-brand-muted">Timer</p>
          <p className="mt-2 font-mono text-4xl font-bold text-black">
            {Math.floor(elapsed / 60)
              .toString()
              .padStart(2, "0")}
            :{(elapsed % 60).toString().padStart(2, "0")}
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            {formatDuration(booking.durationMins || 60)} booked
          </p>
          <div className="mt-8">
            <Button type="button" onClick={() => flipStatus("completed")}>
              Done
            </Button>
          </div>
        </section>
      )}

      {status === "completed" && (
        <section className="mt-10 px-6">
          {booking.escrow ? (
            <p className="mb-6 rounded-button bg-brand-purple/10 px-3 py-3 text-sm text-brand-purple">
              Escrow{" "}
              {booking.escrowStatus === "released" ? "released" : "held"}{" "}
              (Paystack stub)
            </p>
          ) : null}
          <p className="text-sm text-brand-muted">Rate</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={cn(
                  "text-3xl transition active:scale-[0.98]",
                  star <= rating ? "text-brand-gold" : "text-black/15"
                )}
                aria-label={`${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-brand-muted">Tip (100% to pro)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tipPresetsGbp(marketId).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setPostTip(t);
                  updateBooking(bookingId, {
                    tipAmount: (booking.tipAmount ?? 0) + t,
                    totalPrice: booking.totalPrice + t,
                  });
                  setBooking(loadBooking(bookingId));
                  showToast(`Tip ${formatMoney(t)} added`);
                }}
                className={cn(
                  "rounded-button px-3 py-2 text-sm font-medium",
                  postTip === t
                    ? "bg-brand-purple text-white"
                    : "bg-brand-gray text-brand-muted"
                )}
              >
                {formatMoney(t)}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={`/booking/${booking.proId}/${booking.serviceId}?step=when`}
              className="block"
            >
              <Button type="button">
                Rebook {booking.proName.split(" ")[0]}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-brand-muted">
            Deposit {formatMoney(booking.depositAmount)}
            {booking.tipAmount
              ? ` · tip ${formatMoney(booking.tipAmount)}`
              : ""}
          </p>
        </section>
      )}

      {/* Demo — status + accelerate ETA */}
      <section className="mt-14 border-t border-black/5 px-6 pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
          Demo
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRACKING_STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => flipStatus(s.id)}
              className={cn(
                "text-sm font-medium transition active:scale-[0.98]",
                status === s.id ? "text-brand-purple" : "text-brand-muted"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {status === "on_the_way" && (
          <TextLink
            className="mt-4"
            onClick={() => {
              setEtaMins(1);
              setProgress(0.9);
            }}
          >
            Jump ETA to 1 min
          </TextLink>
        )}
      </section>
    </main>
  );
}
