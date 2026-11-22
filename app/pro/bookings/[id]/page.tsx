"use client";

import { TrackingMap } from "@/components/booking/TrackingMap";
import { useMarket } from "@/components/market/MarketProvider";
import { Button, TextLink } from "@/components/ui/Button";
import {
  formatBookingWhen,
  getProBooking,
  setProBookingStatus,
  statusLabel,
  type ProBooking,
} from "@/lib/pro-dashboard";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { formatMoney } = useMarket();
  const [booking, setBooking] = useState<ProBooking | null | undefined>(
    undefined
  );
  const [navProgress, setNavProgress] = useState(0.2);

  useEffect(() => {
    setBooking(getProBooking(params.id) ?? null);
  }, [params.id]);

  useEffect(() => {
    if (booking?.status !== "on_the_way") {
      setNavProgress(0.2);
      return;
    }
    const tick = window.setInterval(() => {
      setNavProgress((p) => Math.min(0.85, p + 0.08));
    }, 2800);
    return () => window.clearInterval(tick);
  }, [booking?.status]);

  if (booking === undefined) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-32 w-full rounded" />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto max-w-md px-6 py-12">
        <p className="text-sm text-brand-muted">Booking not found.</p>
        <Link href="/pro/dashboard" className="mt-4 inline-block text-sm text-brand-muted">
          Dashboard
        </Link>
      </main>
    );
  }

  const pending = booking.status === "pending";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
      <div className="flex items-center justify-between">
        <Link href="/pro/dashboard" className="text-sm text-brand-muted">
          Back
        </Link>
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <p className="mt-10 text-sm text-brand-purple">
        {statusLabel(booking.status)}
        {booking.isEmergency ? " · ASAP" : ""}
      </p>
      <h1 className="mt-2 font-display text-[2rem] font-bold text-black">
        {booking.customerName}
      </h1>
      <p className="mt-2 text-base text-black">{booking.serviceName}</p>
      <p className="mt-1 text-sm text-brand-muted">
        {formatBookingWhen(booking.scheduledAt)}
      </p>
      <p className="mt-1 text-sm text-brand-muted">{booking.address}</p>

      <div className="mt-10">
        <p className="text-3xl font-bold text-black">
          {formatMoney(booking.price)}
        </p>
        <p className="mt-1 text-sm text-brand-muted">
          Deposit {formatMoney(booking.deposit)} · you keep 85%
        </p>
      </div>

      {booking.status === "on_the_way" && (
        <section className="-mx-6 mt-8">
          <TrackingMap
            progress={navProgress}
            etaMins={Math.max(1, Math.round((1 - navProgress) * 12))}
            proLabel="You"
            address={booking.address}
          />
          <p className="px-6 pt-3 text-sm text-brand-muted">
            Nav preview · live when MAPBOX_ACCESS_TOKEN set
          </p>
        </section>
      )}

      {pending && (
        <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
          <div className="mx-auto max-w-md">
            <Button
              type="button"
              onClick={() => {
                setProBookingStatus(booking.id, "accepted");
                setBooking({ ...booking, status: "accepted" });
              }}
            >
              Accept
            </Button>
            <div className="mt-4 text-center">
              <TextLink
                onClick={() => {
                  setProBookingStatus(booking.id, "declined");
                  router.push("/pro/dashboard");
                }}
              >
                Decline
              </TextLink>
            </div>
          </div>
        </div>
      )}

      {!pending && booking.status === "accepted" && (
        <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
          <div className="mx-auto max-w-md">
            <Button
              type="button"
              onClick={() => {
                setProBookingStatus(booking.id, "on_the_way");
                setBooking({ ...booking, status: "on_the_way" });
              }}
            >
              On the way
            </Button>
            <div className="mt-4 text-center">
              <TextLink
                onClick={() => {
                  setProBookingStatus(booking.id, "completed");
                  setBooking({ ...booking, status: "completed" });
                }}
              >
                Mark done
              </TextLink>
            </div>
          </div>
        </div>
      )}

      {!pending && booking.status === "on_the_way" && (
        <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
          <div className="mx-auto max-w-md">
            <Button
              type="button"
              onClick={() => {
                setProBookingStatus(booking.id, "completed");
                setBooking({ ...booking, status: "completed" });
              }}
            >
              Mark done
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
