"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { EMERGENCY_FEE } from "@/lib/mock-pros";

type BookingSummaryProps = {
  servicePrice: number;
  emergency: boolean;
};

export function BookingSummary({ servicePrice, emergency }: BookingSummaryProps) {
  const { formatMoney } = useMarket();
  const emergencyFee = emergency ? EMERGENCY_FEE : 0;
  const total = servicePrice + emergencyFee;
  const deposit = Math.round(total * 0.3 * 100) / 100;

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-purple/10">
      <p className="text-sm font-semibold text-brand-dark">Price summary</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between text-brand-dark/70">
          <dt>Service</dt>
          <dd className="font-medium text-brand-dark">{formatMoney(servicePrice)}</dd>
        </div>
        {emergency && (
          <div className="flex justify-between text-brand-dark/70">
            <dt>Emergency fee</dt>
            <dd className="font-medium text-brand-dark">{formatMoney(emergencyFee)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-brand-purple/10 pt-2 font-semibold text-brand-dark">
          <dt>Total</dt>
          <dd>{formatMoney(total)}</dd>
        </div>
        <div className="flex justify-between text-brand-purple">
          <dt>Deposit due now (30%)</dt>
          <dd className="font-bold">{formatMoney(deposit)}</dd>
        </div>
        <div className="flex justify-between text-xs text-brand-dark/50">
          <dt>Pay to pro on completion</dt>
          <dd>{formatMoney(total - deposit)}</dd>
        </div>
      </dl>
    </div>
  );
}
