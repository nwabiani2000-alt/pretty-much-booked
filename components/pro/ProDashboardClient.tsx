"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { MarketToggle } from "@/components/market/MarketToggle";
import { Button, TextLink } from "@/components/ui/Button";
import {
  computeEarnings,
  formatBookingWhen,
  loadAvailability,
  loadProBookings,
  saveAvailability,
  setProBookingStatus,
  statusLabel,
  type ProAvailabilityState,
  type ProBooking,
  type ProEarnings,
} from "@/lib/pro-dashboard";
import { loadProDraft, type ProOnboardingDraft } from "@/lib/pro-onboarding";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function ProDashboardClient() {
  const router = useRouter();
  const { formatMoney, market } = useMarket();
  const [name, setName] = useState("Pro");
  const [profile, setProfile] = useState<ProOnboardingDraft | null>(null);
  const [bookings, setBookings] = useState<ProBooking[]>([]);
  const [avail, setAvail] = useState<ProAvailabilityState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadProDraft();
    setProfile(draft);
    setName(draft.displayName || "Pro");
    setBookings(loadProBookings());
    setAvail(loadAvailability());
  }, []);

  const earnings: ProEarnings = useMemo(
    () => computeEarnings(bookings),
    [bookings]
  );

  const today = bookings.filter(
    (b) => b.whenLabel === "today" && b.status !== "declined"
  );
  const upcoming = bookings.filter(
    (b) => b.whenLabel === "upcoming" && b.status !== "declined"
  );
  const pendingFirst = bookings.find((b) => b.status === "pending");

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  function accept(id: string) {
    const updated = setProBookingStatus(id, "accepted");
    if (updated) {
      setBookings(loadProBookings());
      showToast("Accepted");
    }
  }

  function decline(id: string) {
    const updated = setProBookingStatus(id, "declined");
    if (updated) {
      setBookings(loadProBookings());
      showToast("Declined");
    }
  }

  function toggleAvailable() {
    if (!avail) return;
    const next = { ...avail, availableNow: !avail.availableNow };
    saveAvailability(next);
    setAvail(next);
  }

  if (!avail) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-24 w-full rounded" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-16 pt-5">
      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Image
          src="/images/logo-icon-purple.png"
          alt="Pretty Much Booked"
          width={28}
          height={28}
        />
        <MarketToggle />
        <Link href="/pro/onboarding?step=services" className="text-sm text-brand-muted">
          Services
        </Link>
      </div>

      <h1 className="mt-10 font-display text-[2rem] font-bold text-black">
        Hi, {name.split(" ")[0]}
      </h1>

      {profile && (profile.displayName || profile.specialties.length > 0) ? (
        <p className="mt-2 text-sm text-brand-muted">
          {[
            profile.city
              ? profile.city === "lagos"
                ? "Lagos"
                : "London"
              : market.city,
            profile.specialties.length
              ? profile.specialties.join(" · ")
              : null,
            profile.phone || null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}

      {/* Available now — primary control on home */}
      <button
        type="button"
        onClick={toggleAvailable}
        className="mt-8 flex w-full items-center justify-between py-2 text-left transition active:scale-[0.98]"
      >
        <span>
          <span className="block text-lg font-semibold text-black">
            Available now
          </span>
          <span className="text-sm text-brand-muted">
            {avail.availableNow ? "Taking new jobs" : "Paused"}
          </span>
        </span>
        <span
          className={cn(
            "relative h-8 w-14 rounded-full transition",
            avail.availableNow ? "bg-brand-purple" : "bg-black/15"
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-6 w-6 rounded-full bg-white transition",
              avail.availableNow ? "left-7" : "left-1"
            )}
          />
        </span>
      </button>
      <div className="mt-1 flex gap-6">
        <TextLink onClick={() => router.push("/pro/dashboard/hours")}>
          Edit hours
        </TextLink>
        <TextLink onClick={() => router.push("/pro/dashboard/payouts")}>
          Payouts
        </TextLink>
        <TextLink onClick={() => router.push("/pro/kyc")}>KYC</TextLink>
      </div>

      {/* Earnings — simple numbers */}
      <section className="mt-12">
        <h2 className="text-sm text-brand-muted">Earnings</h2>
        <div className="mt-4 flex gap-10">
          <div>
            <p className="text-3xl font-bold text-black">
              {formatMoney(earnings.week)}
            </p>
            <p className="mt-1 text-sm text-brand-muted">This week</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-black">
              {formatMoney(earnings.total)}
            </p>
            <p className="mt-1 text-sm text-brand-muted">Total</p>
          </div>
        </div>
      </section>

      {/* Focused pending action — one primary Accept */}
      {pendingFirst && (
        <section className="mt-12">
          <h2 className="text-sm text-brand-muted">Needs reply</h2>
          <p className="mt-3 text-lg font-semibold text-black">
            {pendingFirst.customerName}
          </p>
          <p className="text-sm text-brand-muted">
            {pendingFirst.serviceName} · {formatBookingWhen(pendingFirst.scheduledAt)}
            {pendingFirst.isEmergency ? " · ASAP" : ""}
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            {formatMoney(pendingFirst.price)} · {pendingFirst.address}
          </p>
          <div className="mt-5">
            <Button type="button" onClick={() => accept(pendingFirst.id)}>
              Accept
            </Button>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <TextLink onClick={() => decline(pendingFirst.id)}>Decline</TextLink>
            <TextLink
              onClick={() => router.push(`/pro/bookings/${pendingFirst.id}`)}
            >
              Details
            </TextLink>
          </div>
        </section>
      )}

      {/* Today */}
      <section className="mt-12">
        <h2 className="text-sm text-brand-muted">Today</h2>
        {today.length === 0 ? (
          <p className="mt-4 text-base text-black">Nothing today</p>
        ) : (
          <ul className="mt-2">
            {today.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming */}
      <section className="mt-10">
        <h2 className="text-sm text-brand-muted">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-base text-black">No upcoming</p>
        ) : (
          <ul className="mt-2">
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12 text-center">
        <TextLink onClick={() => (window.location.href = "/")}>
          Customer app
        </TextLink>
      </div>
    </main>
  );
}

function BookingRow({ booking }: { booking: ProBooking }) {
  return (
    <li>
      <Link
        href={`/pro/bookings/${booking.id}`}
        className="flex items-center justify-between gap-3 py-4 transition active:scale-[0.98]"
      >
        <div className="min-w-0">
          <p className="font-semibold text-black">{booking.customerName}</p>
          <p className="text-sm text-brand-muted">
            {booking.serviceName} · {formatBookingWhen(booking.scheduledAt)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs font-medium",
            booking.status === "pending"
              ? "text-brand-purple"
              : "text-brand-muted"
          )}
        >
          {statusLabel(booking.status)}
        </span>
      </Link>
    </li>
  );
}
