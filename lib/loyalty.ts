/**
 * PMB Club loyalty stub — mock points + checkout discount line.
 */

const POINTS_KEY = "pmb_club_points";
const MEMBER_KEY = "pmb_club_member";

/** 100 points ≈ £1 off (stub). */
export const POINTS_PER_GBP = 100;
export const WELCOME_POINTS = 250;
/** Max discount as fraction of service (stub). */
export const MAX_CLUB_DISCOUNT_FRAC = 0.1;

export function isClubMember(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MEMBER_KEY) === "1";
  } catch {
    return false;
  }
}

export function joinClub(): number {
  if (typeof window === "undefined") return WELCOME_POINTS;
  localStorage.setItem(MEMBER_KEY, "1");
  const pts = Math.max(getClubPoints(), WELCOME_POINTS);
  localStorage.setItem(POINTS_KEY, String(pts));
  return pts;
}

export function getClubPoints(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = Number(localStorage.getItem(POINTS_KEY) || "0");
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  } catch {
    return 0;
  }
}

export function setClubPoints(n: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(POINTS_KEY, String(Math.max(0, Math.floor(n))));
}

/** Suggest discount in GBP from points (capped). */
export function clubDiscountGbp(
  points: number,
  servicePriceGbp: number
): number {
  const fromPoints = points / POINTS_PER_GBP;
  const cap = servicePriceGbp * MAX_CLUB_DISCOUNT_FRAC;
  return Math.round(Math.min(fromPoints, cap) * 100) / 100;
}
