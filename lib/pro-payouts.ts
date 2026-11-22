/**
 * Pro payouts stub — mock ledger until Stripe Connect / Paystack.
 */

export type PayoutRow = {
  id: string;
  label: string;
  amountGbp: number;
  status: "pending" | "paid" | "scheduled";
  date: string;
};

const KEY = "pmb_pro_payouts";

const SEED: PayoutRow[] = [
  {
    id: "po_1",
    label: "Week of 10 Nov",
    amountGbp: 186.5,
    status: "paid",
    date: "2026-11-14",
  },
  {
    id: "po_2",
    label: "Week of 17 Nov",
    amountGbp: 93.5,
    status: "scheduled",
    date: "2026-11-21",
  },
  {
    id: "po_3",
    label: "Tips (this week)",
    amountGbp: 18,
    status: "pending",
    date: "2026-11-22",
  },
];

export function loadPayouts(): PayoutRow[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as PayoutRow[];
  } catch {
    return SEED;
  }
}

export function payoutTotals(rows: PayoutRow[]): {
  pending: number;
  paid: number;
} {
  return rows.reduce(
    (acc, r) => {
      if (r.status === "paid") acc.paid += r.amountGbp;
      else acc.pending += r.amountGbp;
      return acc;
    },
    { pending: 0, paid: 0 }
  );
}
