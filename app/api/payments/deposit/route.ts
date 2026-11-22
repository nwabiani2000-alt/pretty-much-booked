import { getBookingById } from "@/lib/api-catalog";
import { convertFromGbp, parseMarketParam, type MarketId } from "@/lib/market";
import {
  resolveAuth,
  verifyBookingAccessToken,
} from "@/lib/security/auth-context";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { paymentDepositSchema } from "@/lib/security/schemas";
import { getStripe, isStripeConfigured } from "@/lib/stripe-server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payments/deposit
 * Amount is ALWAYS taken from the booking record (server-side).
 * Client-supplied amountGbp is ignored when the booking exists.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "payments:deposit"), 20, 60 * 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers }
    );
  }

  const parsed = paymentDepositSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers }
    );
  }

  const body = parsed.data;
  const bookingId = body.bookingId.trim();
  const auth = await resolveAuth(req);
  const token = body.access_token || auth.accessToken || undefined;

  const { data: booking } = await getBookingById(bookingId);

  let amountGbp: number;
  if (booking) {
    const isOwner = Boolean(auth.userId && auth.userId === booking.customer_id);
    const tokenOk =
      verifyBookingAccessToken(token, booking.id, booking.customer_id) ||
      (booking.access_token && token === booking.access_token);
    if (!isOwner && !tokenOk) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers }
      );
    }
    // Server-side amount — never trust client.
    amountGbp = Number(booking.deposit_amount);
  } else {
    // Mock fallback when booking not in store: require positive amount but cap.
    const fallback = Number(
      body.amountGbp != null ? body.amountGbp : body.amount
    );
    if (!Number.isFinite(fallback) || fallback <= 0 || fallback > 1000) {
      return NextResponse.json(
        { error: "booking not found; amountGbp required (max 1000)" },
        { status: 400, headers }
      );
    }
    amountGbp = fallback;
  }

  const tipGbp = Number(body.tipGbp ?? 0) || 0;
  if (tipGbp < 0 || tipGbp > 500) {
    return NextResponse.json({ error: "Invalid tip" }, { status: 400, headers });
  }

  const marketId: MarketId =
    parseMarketParam(body.market) ??
    parseMarketParam(body.currency) ??
    "london";
  const currency = marketId === "lagos" ? "ngn" : "gbp";

  const totalGbp = amountGbp + tipGbp;
  const major = convertFromGbp(totalGbp, marketId);
  const amountMinor = Math.round(major * 100);

  if (amountMinor <= 0) {
    return NextResponse.json(
      { error: "Amount must be positive" },
      { status: 400, headers }
    );
  }

  const stripe = getStripe();

  if (!stripe || !isStripeConfigured()) {
    const mockSecret = `pi_mock_${bookingId}_secret_mock`;
    return NextResponse.json(
      {
        mode: "mock",
        clientSecret: mockSecret,
        paymentIntentId: `pi_mock_${bookingId}`,
        amount: amountMinor,
        amount_gbp: totalGbp,
        currency,
        market: marketId,
        bookingId,
        note: "STRIPE_SECRET_KEY missing — mock PaymentIntent",
      },
      { headers }
    );
  }

  try {
    const intent = await stripe.paymentIntents.create(
      {
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
      },
      { idempotencyKey: `deposit_${bookingId}_${amountMinor}` }
    );

    return NextResponse.json(
      {
        mode: "live",
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: amountMinor,
        amount_gbp: totalGbp,
        currency,
        market: marketId,
        bookingId,
      },
      { headers }
    );
  } catch (err) {
    console.error("[deposit]", err instanceof Error ? err.message : "Stripe error");
    return NextResponse.json(
      { error: "Payment could not be created" },
      { status: 502, headers }
    );
  }
}
