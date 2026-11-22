"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button, TextLink } from "@/components/ui/Button";
import {
  loadBooking,
  type StoredBooking,
} from "@/lib/booking-storage";
import {
  chatWindowForBooking,
  formatOpensIn,
} from "@/lib/chat-window";
import { ensureDemoBooking } from "@/lib/tracking-demo";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function MessagesInner() {
  const { marketId } = useMarket();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking") ?? "demo";
  const forceOpen = searchParams.get("open") === "1";
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  useEffect(() => {
    let b = loadBooking(bookingId);
    if (!b) b = ensureDemoBooking(bookingId);
    setBooking(b);
  }, [bookingId]);

  const windowState = useMemo(() => {
    if (forceOpen) {
      return { open: true as const, reason: "within_window" as const };
    }
    return chatWindowForBooking({
      scheduledAt: booking?.scheduledAt,
      trackingStatus: booking?.trackingStatus,
      isEmergency: booking?.isEmergency,
    });
  }, [booking, forceOpen]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-28 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-neutral-text">Messages</h1>
        <Link href="/" className="text-small text-neutral-secondary no-underline">
          Home
        </Link>
      </div>

      <p className="mt-2 text-small text-neutral-secondary">
        {booking
          ? `${booking.proName} · ${booking.serviceName}`
          : "Chat with your pro"}
      </p>

      {!windowState.open ? (
        <div className="card mt-8">
          <p className="text-heading text-neutral-text">Chat unlocks soon</p>
          <p className="mt-2 text-small text-neutral-secondary">
            Messaging opens about 1 hour before your appointment — keeps both
            sides focused and safe.
          </p>
          {windowState.minutesUntil != null ? (
            <p className="mt-4 text-body-bold text-pmb-700">
              Opens {formatOpensIn(windowState.minutesUntil)}
            </p>
          ) : windowState.opensAt ? (
            <p className="mt-4 text-small text-neutral-secondary">
              Opens{" "}
              {new Date(windowState.opensAt).toLocaleString("en-GB", {
                weekday: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          ) : null}
          <TextLink
            className="mt-6 no-underline"
            onClick={() => {
              window.location.href = `/messages?booking=${bookingId}&open=1`;
            }}
          >
            Demo: unlock now
          </TextLink>
        </div>
      ) : (
        <div className="card mt-8 flex min-h-[320px] flex-col">
          <p className="text-caption text-neutral-muted">
            Open · {marketId === "lagos" ? "Lagos" : "London"} window
          </p>
          <div className="mt-4 flex-1 space-y-3">
            <p className="rounded-button bg-neutral-bg px-3 py-2 text-small text-neutral-secondary">
              Hi — I’m on my way / getting ready. Share any last notes here.
            </p>
            {sent.map((m, i) => (
              <p
                key={`${m}-${i}`}
                className="ml-auto max-w-[85%] rounded-button bg-pmb-700 px-3 py-2 text-small text-white"
              >
                {m}
              </p>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message"
              className="input-underline min-w-0 flex-1"
            />
            <Button
              type="button"
              className="shrink-0 !w-auto px-4"
              onClick={() => {
                if (!draft.trim()) return;
                setSent((s) => [...s, draft.trim()]);
                setDraft("");
              }}
            >
              Send
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-5 pt-20">
          <div className="skeleton h-8 w-40" />
        </main>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}
