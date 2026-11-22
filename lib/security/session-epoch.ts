/**
 * Edge-safe session epoch (globalThis + optional env override).
 * File persistence lives in session-invalidate (Node API only).
 */

const g = globalThis as unknown as {
  __pmbAdminEpoch?: number;
  __pmbUserEpoch?: number;
};

/** Ops can bump ADMIN_SESSION_EPOCH in env for hard cluster-wide invalidate. */
export function getAdminEpoch(): number {
  const fromEnv = Number(process.env.ADMIN_SESSION_EPOCH || 0);
  const fromMem = g.__pmbAdminEpoch ?? 0;
  return Math.max(
    Number.isFinite(fromEnv) ? fromEnv : 0,
    fromMem
  );
}

export function getUserEpoch(): number {
  const fromEnv = Number(process.env.USER_SESSION_EPOCH || 0);
  const fromMem = g.__pmbUserEpoch ?? 0;
  return Math.max(
    Number.isFinite(fromEnv) ? fromEnv : 0,
    fromMem
  );
}

export function setEpochs(adminEpoch: number, userEpoch: number): void {
  g.__pmbAdminEpoch = adminEpoch;
  g.__pmbUserEpoch = userEpoch;
}
