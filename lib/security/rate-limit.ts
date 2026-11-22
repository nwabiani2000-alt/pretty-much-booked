/**
 * In-memory rate limiter (mock-safe). Replace with Upstash/Vercel KV in prod.
 * Keyed by IP + route bucket.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt, limit };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      limit,
    };
  }
  existing.count += 1;
  store.set(key, existing);
  return {
    ok: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
    limit,
  };
}

export function clientKey(req: Request, bucket: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0]?.trim() : null) ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${bucket}:${ip}`;
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
