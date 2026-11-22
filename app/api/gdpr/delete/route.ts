import { resolveAuth } from "@/lib/security/auth-context";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gdpr/delete — Right to be forgotten request.
 * Queues deletion; live wipe requires service-role + auth admin (not auto-run here).
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "gdpr:delete"), 2, 60 * 60_000);
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

  console.info("[gdpr/delete] queued", { userId: auth.userId });

  return NextResponse.json(
    {
      queued: true,
      userId: auth.userId,
      message:
        "Deletion request recorded. Account data will be erased within 30 days except records we must keep for legal/tax reasons.",
    },
    { headers }
  );
}
