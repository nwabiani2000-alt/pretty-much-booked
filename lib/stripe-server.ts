import Stripe from "stripe";

/**
 * Server-only Stripe helpers.
 * Env (see .env.example):
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - STRIPE_PUBLISHABLE_KEY (exposed to client via /api/payments/config only — not NEXT_PUBLIC_)
 */

export function getStripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

export function getStripePublishableKey(): string | null {
  return process.env.STRIPE_PUBLISHABLE_KEY?.trim() || null;
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) return null;
  if (!stripeClient) {
    // SDK pins its own LatestApiVersion by default when omitted in recent majors;
    // pass explicitly via env override if needed.
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
