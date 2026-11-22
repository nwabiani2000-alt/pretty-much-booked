import { getBookingById } from "@/lib/api-catalog";
import { corsPreflight, withCors } from "@/lib/cors";
import {
  resolveAuth,
  verifyBookingAccessToken,
} from "@/lib/security/auth-context";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { reviewSchema } from "@/lib/security/schemas";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reviews
 * Only for completed bookings owned by the caller (fake-review prevention).
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "reviews:post"), 10, 60 * 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    return withCors(
      NextResponse.json({ error: "Too many requests" }, { status: 429, headers }),
      req
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return withCors(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers }),
      req
    );
  }

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return withCors(
      NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400, headers }
      ),
      req
    );
  }

  const auth = await resolveAuth(req);
  const { booking_id, rating, comment, access_token } = parsed.data;
  const { data: booking } = await getBookingById(booking_id);

  if (!booking) {
    return withCors(
      NextResponse.json({ error: "Booking not found" }, { status: 404, headers }),
      req
    );
  }

  const isOwner = Boolean(auth.userId && auth.userId === booking.customer_id);
  const tokenOk =
    verifyBookingAccessToken(
      access_token || auth.accessToken,
      booking.id,
      booking.customer_id
    ) ||
    (booking.access_token &&
      (access_token || auth.accessToken) === booking.access_token);

  if (!isOwner && !tokenOk) {
    return withCors(
      NextResponse.json({ error: "Forbidden" }, { status: 403, headers }),
      req
    );
  }

  const status = booking.status?.toLowerCase();
  if (status !== "completed") {
    return withCors(
      NextResponse.json(
        { error: "Reviews only allowed for completed bookings" },
        { status: 400, headers }
      ),
      req
    );
  }

  // Escape is default in React; store plain text only (no HTML).
  const safeComment = (comment ?? "").replace(/[<>]/g, "");

  return withCors(
    NextResponse.json(
      {
        ok: true,
        review: {
          booking_id,
          rating,
          comment: safeComment,
          pro_id: booking.pro_id,
          customer_id: booking.customer_id,
        },
        mode: "mock",
        note: "Persisted to reviews table when Supabase live + migration applied",
      },
      { status: 201, headers }
    ),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
