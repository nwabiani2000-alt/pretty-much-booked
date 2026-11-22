/**
 * Lagos escrow / Paystack path (scaffold).
 * Hold until complete — mock release on tracking completed.
 */

export const PAYSTACK_PUBLIC_KEY_ENV = "PAYSTACK_PUBLIC_KEY";
export const PAYSTACK_SECRET_KEY_ENV = "PAYSTACK_SECRET_KEY";

export function isPaystackConfigured(): boolean {
  return Boolean(
    process.env.PAYSTACK_SECRET_KEY?.trim() ||
      process.env.PAYSTACK_PUBLIC_KEY?.trim()
  );
}

export type EscrowStatus = "none" | "held" | "released" | "refunded";

export function paystackDoctor() {
  return {
    PAYSTACK_PUBLIC_KEY: Boolean(process.env.PAYSTACK_PUBLIC_KEY?.trim()),
    PAYSTACK_SECRET_KEY: Boolean(process.env.PAYSTACK_SECRET_KEY?.trim()),
    mode: isPaystackConfigured() ? "live_ready" : "mock",
    note: "Escrow UI works in mock; wire initialize/verify when keys present.",
  };
}
