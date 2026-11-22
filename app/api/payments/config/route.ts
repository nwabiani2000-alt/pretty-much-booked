import {
  getStripePublishableKey,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/lib/stripe-server";
import { NextResponse } from "next/server";

/**
 * Exposes publishable key to the client without NEXT_PUBLIC_ binding.
 * Never returns the secret key.
 */
export async function GET() {
  const publishableKey = getStripePublishableKey();
  const secretConfigured = isStripeConfigured();
  const stripeEnabled = Boolean(secretConfigured && publishableKey);

  return NextResponse.json({
    publishableKey: publishableKey || null,
    /** True when both secret + publishable are set — Payment Element path. */
    stripeEnabled,
    mode: stripeEnabled ? "live" : "mock",
    /** Doctor — booleans only, no secret values. */
    doctor: {
      STRIPE_SECRET_KEY: Boolean(getStripeSecretKey()),
      STRIPE_PUBLISHABLE_KEY: Boolean(publishableKey),
      STRIPE_WEBHOOK_SECRET: Boolean(getStripeWebhookSecret()),
      elementsPath: stripeEnabled,
      mockFallback: !stripeEnabled,
    },
  });
}
