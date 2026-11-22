/** Mask phone until booking confirmed — e.g. +44 **** 1234 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  const last4 = digits.slice(-4);
  const prefix = phone.startsWith("+") ? phone.slice(0, 3) : "+**";
  return `${prefix} **** ${last4}`;
}

/** Keep postcode + city only — strip street for completed bookings retention. */
export function minimizeAddress(addressText: string): string {
  const parts = addressText.split(",").map((p) => p.trim());
  if (parts.length <= 2) return addressText;
  return parts.slice(-2).join(", ");
}

export type CancelRefund = {
  refundRatio: number;
  reason: string;
};

/** Cancellation policy — server-side only. */
export function cancellationRefund(
  scheduledAt: string,
  cancelledBy: "customer" | "pro" | "admin" | "system",
  now = new Date()
): CancelRefund {
  if (cancelledBy === "pro") {
    return { refundRatio: 1, reason: "Pro cancelled — full refund + £10 credit" };
  }
  const scheduled = new Date(scheduledAt).getTime();
  const hours = (scheduled - now.getTime()) / (1000 * 60 * 60);
  if (hours > 24) return { refundRatio: 1, reason: ">24h — full refund" };
  if (hours >= 2) return { refundRatio: 0.5, reason: "2–24h — 50% refund" };
  return { refundRatio: 0, reason: "<2h — no refund" };
}
