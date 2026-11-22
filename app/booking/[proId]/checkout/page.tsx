"use client";

import { CheckoutClient } from "@/components/booking/CheckoutClient";
import { useParams } from "next/navigation";

export default function CheckoutPage() {
  /** URL is /booking/[bookingId]/checkout — folder is [proId] (shared dynamic segment). */
  const params = useParams<{ proId: string }>();
  return <CheckoutClient bookingId={params.proId} />;
}
