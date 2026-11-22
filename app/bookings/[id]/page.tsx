"use client";

import { TrackingClient } from "@/components/booking/TrackingClient";
import { useParams } from "next/navigation";
import { Suspense } from "react";

function TrackingInner() {
  const params = useParams<{ id: string }>();
  return <TrackingClient bookingId={params.id} />;
}

export default function BookingTrackingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
          <div className="skeleton h-8 w-40 rounded" />
          <div className="skeleton h-56 w-full rounded" />
        </main>
      }
    >
      <TrackingInner />
    </Suspense>
  );
}
