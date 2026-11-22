import { sendAlertEmail } from "@/lib/security/alerts";
import { logIncident } from "@/lib/security/incident-log";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const DAY_MS = 24 * 60 * 60_000;

function stampPath(): string {
  return join(process.cwd(), ".data", "incidents", "last-backup.json");
}

function readLastBackup(): { at: string; source?: string } | null {
  try {
    if (!existsSync(stampPath())) return null;
    return JSON.parse(readFileSync(stampPath(), "utf8")) as {
      at: string;
      source?: string;
    };
  } catch {
    return null;
  }
}

function writeLastBackup(source: string): void {
  try {
    mkdirSync(join(process.cwd(), ".data", "incidents"), { recursive: true });
    writeFileSync(
      stampPath(),
      JSON.stringify(
        { at: new Date().toISOString(), source },
        null,
        2
      ),
      "utf8"
    );
  } catch {
    /* ignore */
  }
}

function authorize(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    // Dev: allow when CRON_SECRET unset (mock)
    return process.env.NODE_ENV !== "production";
  }
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = req.headers.get("x-cron-secret")?.trim() || "";
  return bearer === secret || header === secret;
}

/**
 * GET|POST /api/cron/backup-verify
 * Auth: Authorization: Bearer CRON_SECRET (or x-cron-secret).
 * Query/body mark=1 records a successful backup check now.
 * Alerts if last backup stamp is missing or older than 24h.
 */
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  let mark = url.searchParams.get("mark") === "1";
  if (req.method === "POST") {
    try {
      const body = (await req.json()) as { mark?: boolean };
      if (body.mark) mark = true;
    } catch {
      /* no body */
    }
  }

  if (mark) {
    writeLastBackup("cron_mark");
  }

  const last = readLastBackup();
  // Env override for ops that stamp backups externally
  const envStamp = process.env.BACKUP_LAST_OK?.trim();
  const atIso = last?.at || envStamp || null;
  const ageMs = atIso ? Date.now() - Date.parse(atIso) : null;
  const stale = ageMs == null || !Number.isFinite(ageMs) || ageMs > DAY_MS;

  if (stale) {
    const msg = atIso
      ? `Backup stamp older than 24h (last ${atIso})`
      : "No backup stamp found — run with ?mark=1 after a successful backup";
    sendAlertEmail("Backup verification failed", msg);
    logIncident("backup_stale", msg, "P2", { atIso, ageMs });
    return NextResponse.json({
      ok: false,
      stale: true,
      lastBackupAt: atIso,
      ageHours: ageMs != null ? Math.round(ageMs / 3_600_000) : null,
    });
  }

  return NextResponse.json({
    ok: true,
    stale: false,
    lastBackupAt: atIso,
    ageHours: Math.round((ageMs as number) / 3_600_000),
  });
}
