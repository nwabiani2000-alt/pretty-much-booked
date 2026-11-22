"use client";

import { ConfirmationClient } from "@/components/booking/ConfirmationClient";
import { useParams } from "next/navigation";

export default function ConfirmationPage() {
  /** URL: /booking/[bookingId]/confirmation — folder param is [proId]. */
  const params = useParams<{ proId: string }>();
  return <ConfirmationClient bookingId={params.proId} />;
}
