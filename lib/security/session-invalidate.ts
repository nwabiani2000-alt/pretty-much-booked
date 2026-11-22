/**
 * Global session invalidation (emergency logout).
 * Bumps epoch so existing admin tokens fail verify on Node APIs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { logIncident } from "@/lib/security/incident-log";
import {
  getAdminEpoch,
  getUserEpoch,
  setEpochs,
} from "@/lib/security/session-epoch";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";

type EpochState = {
  adminEpoch: number;
  userEpoch: number;
  lastEmergencyAt?: string;
};

const statePath = () =>
  join(process.cwd(), ".data", "incidents", "session-epoch.json");

function hydrateFromDisk(): void {
  try {
    if (!existsSync(statePath())) return;
    const s = JSON.parse(readFileSync(statePath(), "utf8")) as EpochState;
    setEpochs(
      Math.max(getAdminEpoch(), s.adminEpoch || 0),
      Math.max(getUserEpoch(), s.userEpoch || 0)
    );
  } catch {
    /* keep mem */
  }
}

function persist(s: EpochState): void {
  setEpochs(s.adminEpoch, s.userEpoch);
  try {
    mkdirSync(join(process.cwd(), ".data", "incidents"), { recursive: true });
    writeFileSync(statePath(), JSON.stringify(s, null, 2), "utf8");
  } catch {
    /* memory only */
  }
}

export type EmergencyLogoutResult = {
  ok: true;
  adminEpoch: number;
  userEpoch: number;
  supabase: "signed_out_best_effort" | "mock" | "skipped_error";
  incidentId: string;
};

/**
 * Invalidate all sessions. Mock-safe when Supabase admin API unavailable.
 */
export async function emergencyInvalidateAllSessions(
  triggeredBy: string
): Promise<EmergencyLogoutResult> {
  hydrateFromDisk();
  const next: EpochState = {
    adminEpoch: getAdminEpoch() + 1,
    userEpoch: getUserEpoch() + 1,
    lastEmergencyAt: new Date().toISOString(),
  };
  persist(next);

  let supabaseStatus: EmergencyLogoutResult["supabase"] = "mock";
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data, error } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 50,
        });
        if (!error && data?.users?.length) {
          await Promise.allSettled(
            data.users.map((u) =>
              supabase.auth.admin.signOut(u.id, "global")
            )
          );
          supabaseStatus = "signed_out_best_effort";
        } else {
          supabaseStatus = "mock";
        }
      }
    } catch {
      supabaseStatus = "skipped_error";
    }
  }

  const incident = logIncident(
    "emergency_logout",
    "Emergency logout — all sessions invalidated",
    "P1",
    {
      triggeredBy,
      adminEpoch: next.adminEpoch,
      userEpoch: next.userEpoch,
      supabase: supabaseStatus,
    }
  );

  return {
    ok: true,
    adminEpoch: next.adminEpoch,
    userEpoch: next.userEpoch,
    supabase: supabaseStatus,
    incidentId: incident.id,
  };
}

export { getAdminEpoch, getUserEpoch };
