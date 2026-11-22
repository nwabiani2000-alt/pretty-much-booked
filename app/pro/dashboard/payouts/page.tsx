"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { TextLink } from "@/components/ui/Button";
import { loadPayouts, payoutTotals } from "@/lib/pro-payouts";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ProPayoutsPage() {
  const { formatMoney } = useMarket();
  const [rows, setRows] = useState<ReturnType<typeof loadPayouts>>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRows(loadPayouts());
    setReady(true);
  }, []);

  const totals = useMemo(() => payoutTotals(rows), [rows]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-16 pt-5">
      <div className="flex items-center justify-between">
        <Link href="/pro/dashboard" className="text-sm text-brand-muted">
          Back
        </Link>
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <h1 className="mt-10 font-display text-[2rem] font-bold text-black">
        Payouts
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        Stub ledger — Connect / Paystack later
      </p>

      {!ready ? (
        <div className="mt-10 space-y-3">
          <div className="skeleton h-16 w-full rounded" />
        </div>
      ) : (
        <>
          <div className="mt-10 flex gap-10">
            <div>
              <p className="text-3xl font-bold text-black">
                {formatMoney(totals.pending)}
              </p>
              <p className="mt-1 text-sm text-brand-muted">Pending</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-black">
                {formatMoney(totals.paid)}
              </p>
              <p className="mt-1 text-sm text-brand-muted">Paid</p>
            </div>
          </div>

          <ul className="mt-12">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 border-b border-black/5 py-4"
              >
                <div>
                  <p className="font-semibold text-black">{r.label}</p>
                  <p className="text-sm text-brand-muted">
                    {r.date} · {r.status}
                  </p>
                </div>
                <p className="text-base font-semibold text-black">
                  {formatMoney(r.amountGbp)}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center text-sm text-brand-muted">
            Bank details · coming soon
          </p>
          <div className="mt-4 text-center">
            <TextLink onClick={() => (window.location.href = "/pro/dashboard")}>
              Dashboard
            </TextLink>
          </div>
        </>
      )}
    </main>
  );
}
