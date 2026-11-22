import { convertFromGbp, parseMarketParam, type MarketId } from "@/lib/market";
import { getStripe, isStripeConfigured } from "@/lib/stripe-server";
import { NextRequest, NextResponse } from "next/server";

type DepositBody = {
  bookingId?: string;
  /** Canonical GBP amount (preferred). */
  amountGbp?: number;
  /** Legacy alias — treated as GBP if amountGbp omitted. */
  amount?: number;
  currency?: string;
  market?: string;
  customerEmail?: string;
  tipGbp?: number;
};

/**
 * POST /api/payments/deposit
 * Creates a Stripe PaymentIntent when STRIPE_SECRET_KEY + publishable are set;
 * otherwise returns a mock clientSecret for local UX.
 *
 * Amounts are GBP-canonical in the app. For Lagos we convert with mock FX
 * and charge NGN (kobo). London charges GBP (pence).
 */
export async function POST(req: NextRequest) {
  let body: DepositBody = {};
  try {
    body = (await req.json()) as DepositBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bookingId = body.bookingId?.trim();
  const amountGbp = Number(
    body.amountGbp != null ? body.amountGbp : body.amount
  );
  const tipGbp = Number(body.tipGbp ?? 0) || 0;
  const marketId: MarketId =
    parseMarketParam(body.market) ??
    parseMarketParam(body.currency) ??
    "london";
  const currency = marketId === "lagos" ? "ngn" : "gbp";

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }
  if (!Number.isFinite(amountGbp) || amountGbp <= 0) {
    return NextResponse.json({ error: "amountGbp required" }, { status: 400 });
  }

  const totalGbp = amountGbp + (tipGbp > 0 ? tipGbp : 0);
  const major = convertFromGbp(totalGbp, marketId);
  /** Stripe smallest unit (pence / kobo). */
  const amountMinor = Math.round(major * 100);

  const stripe = getStripe();

  if (!stripe || !isStripeConfigured()) {
    const mockSecret = `pi_mock_${bookingId}_secret_mock`;
    return NextResponse.json({
      mode: "mock",
      clientSecret: mockSecret,
      paymentIntentId: `pi_mock_${bookingId}`,
      amount: amountMinor,
      amount_gbp: totalGbp,
      currency,
      market: marketId,
      bookingId,
      note: "STRIPE_SECRET_KEY missing — mock PaymentIntent",
    });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId,
        purpose: "deposit",
        market: marketId,
        amount_gbp: String(totalGbp),
      },
      receipt_email: body.customerEmail || undefined,
      description: `Pretty Much Booked deposit · ${bookingId}`,
    });

    return NextResponse.json({
      mode: "live",
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: amountMinor,
      amount_gbp: totalGbp,
      currency,
      market: marketId,
      bookingId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[deposit]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
