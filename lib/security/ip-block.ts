/**
 * Brute-force protection: >10 failed logins per IP per 15 minutes → block IP.
 */

import { sendAlertEmail } from "@/lib/security/alerts";
import { logIncident } from "@/lib/security/incident-log";

const WINDOW_MS = 15 * 60_000;
const FAIL_LIMIT = 10;

type FailBucket = { count: number; resetAt: number };
type BlockEntry = { until: number; reason: string };

const fails = new Map<string, FailBucket>();
const blocks = new Map<string, BlockEntry>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return (
    (forwarded ? forwarded.split(",")[0]?.trim() : null) ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function isIpBlocked(ip: string): boolean {
  const b = blocks.get(ip);
  if (!b) return false;
  if (b.until <= Date.now()) {
    blocks.delete(ip);
    return false;
  }
  return true;
}

export function blockIp(ip: string, reason: string, ttlMs = WINDOW_MS): void {
  blocks.set(ip, { until: Date.now() + ttlMs, reason });
  sendAlertEmail(
    "IP blocked — brute force",
    `IP ${ip} blocked: ${reason}`
  );
  logIncident("ip_blocked", `Blocked ${ip}`, "P3", { ip, reason });
}

/** Record a failed auth attempt. Returns whether IP is now blocked. */
export function recordFailedAuth(ip: string, source: string): {
  blocked: boolean;
  fails: number;
} {
  const now = Date.now();
  let b = fails.get(ip);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + WINDOW_MS };
  }
  b.count += 1;
  fails.set(ip, b);

  if (b.count > FAIL_LIMIT) {
    blockIp(ip, `${source}: ${b.count} failed auths in 15m`);
    return { blocked: true, fails: b.count };
  }
  return { blocked: false, fails: b.count };
}

export function clearFailedAuth(ip: string): void {
  fails.delete(ip);
}

export function listBlockedIps(): Array<{
  ip: string;
  until: string;
  reason: string;
}> {
  const now = Date.now();
  const out: Array<{ ip: string; until: string; reason: string }> = [];
  for (const [ip, b] of blocks) {
    if (b.until <= now) {
      blocks.delete(ip);
      continue;
    }
    out.push({
      ip,
      until: new Date(b.until).toISOString(),
      reason: b.reason,
    });
  }
  return out;
}
