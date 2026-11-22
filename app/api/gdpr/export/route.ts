import { resolveAuth } from "@/lib/security/auth-context";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { listBookings } from "@/lib/api-catalog";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/gdpr/export — Article 20 data portability (auth required). */
export async function GET(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "gdpr:export"), 3, 60 * 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers }
    );
  }

  const auth = await resolveAuth(req);
  if (!auth.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers }
    );
  }

  const { data: bookings, mode } = await listBookings({
    customerId: auth.userId,
  });

  return NextResponse.json(
    {
      mode,
      exportedAt: new Date().toISOString(),
      userId: auth.userId,
      bookings: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        scheduled_at: b.scheduled_at,
        service_id: b.service_id,
        pro_id: b.pro_id,
        total_price: b.total_price,
        address_text: b.address_text,
        created_at: b.created_at,
      })),
      note: "Contact support to include payment history and messages.",
    },
    { headers }
  );
}
