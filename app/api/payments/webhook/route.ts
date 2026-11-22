import {
  getStripe,
  getStripeWebhookSecret,
} from "@/lib/stripe-server";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * POST /api/payments/webhook
 * Verifies Stripe signature when STRIPE_WEBHOOK_SECRET is set;
 * otherwise acknowledges (no-op) for local/dev without keys.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  const rawBody = await req.text();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({
      received: true,
      mode: "mock",
      note: "No STRIPE_WEBHOOK_SECRET — ack only",
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[webhook] signature", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      console.info("[webhook] deposit paid", {
        paymentIntentId: intent.id,
        bookingId,
        amount: intent.amount,
      });
      // Persist deposit_paid in Supabase when wired.
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.warn("[webhook] deposit failed", {
        paymentIntentId: intent.id,
        bookingId: intent.metadata?.bookingId,
      });
      const { recordStripeFail } = await import("@/lib/security/alerts");
      recordStripeFail(1);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true, mode: "live", type: event.type });
}
