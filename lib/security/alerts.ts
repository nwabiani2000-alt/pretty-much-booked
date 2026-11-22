/**
 * Ops alert counters + mock emailer.
 * Thresholds from IR plan: Sentry >100/hr, Stripe fail spike, Supabase query volume.
 */

import { logIncident } from "@/lib/security/incident-log";

type CounterWindow = {
  hourStart: number;
  count: number;
  lastAlertAt: number;
};

const counters: Record<string, CounterWindow> = {};

export const ALERT_THRESHOLDS = {
  sentry_errors_per_hour: 100,
  stripe_fails_per_hour: 20,
  supabase_queries_per_hour: 1000,
} as const;

function hourBucket(now = Date.now()): number {
  return Math.floor(now / 3_600_000) * 3_600_000;
}

function bump(name: string, n = 1): number {
  const h = hourBucket();
  const cur = counters[name];
  if (!cur || cur.hourStart !== h) {
    counters[name] = { hourStart: h, count: n, lastAlertAt: 0 };
    return n;
  }
  cur.count += n;
  return cur.count;
}

export function recordSentryError(n = 1): number {
  const c = bump("sentry", n);
  maybeAlert(
    "sentry",
    c,
    ALERT_THRESHOLDS.sentry_errors_per_hour,
    "Sentry error spike"
  );
  return c;
}

export function recordStripeFail(n = 1): number {
  const c = bump("stripe_fail", n);
  maybeAlert(
    "stripe_fail",
    c,
    ALERT_THRESHOLDS.stripe_fails_per_hour,
    "Stripe failure spike"
  );
  return c;
}

export function recordSupabaseQuery(n = 1): number {
  const c = bump("supabase_q", n);
  maybeAlert(
    "supabase_q",
    c,
    ALERT_THRESHOLDS.supabase_queries_per_hour,
    "Supabase query volume spike"
  );
  return c;
}

function maybeAlert(
  key: string,
  count: number,
  threshold: number,
  title: string
): void {
  if (count < threshold) return;
  const cur = counters[key];
  if (!cur) return;
  // One alert per hour window after crossing threshold
  if (cur.lastAlertAt >= cur.hourStart) return;
  cur.lastAlertAt = Date.now();
  sendAlertEmail(title, `${title}: ${count} in current hour (threshold ${threshold})`);
  logIncident(
    "alert_threshold",
    title,
    "P2",
    { key, count, threshold }
  );
}

/** Mock mailer — logs only until SMTP/Resend wired. */
export function sendAlertEmail(subject: string, body: string): void {
  const to = process.env.ALERT_EMAIL?.trim() || "security@prettymuchbooked.com";
  console.warn(`[alert:email] to=${to} subject=${subject} body=${body}`);
  logIncident("alert_email", subject, "P3", { to, body, mode: "mock" });
}

export function getAlertSnapshot() {
  const h = hourBucket();
  const read = (name: string) => {
    const c = counters[name];
    if (!c || c.hourStart !== h) return 0;
    return c.count;
  };
  return {
    hourStart: new Date(h).toISOString(),
    counters: {
      sentry_errors: read("sentry"),
      stripe_fails: read("stripe_fail"),
      supabase_queries: read("supabase_q"),
    },
    thresholds: { ...ALERT_THRESHOLDS },
  };
}
