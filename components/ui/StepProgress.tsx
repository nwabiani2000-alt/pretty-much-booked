import { cn } from "@/lib/utils";

type StepProgressProps = {
  step: number;
  total?: number;
  fraction?: number;
  label?: string;
  className?: string;
};

/** Design system BookingProgress — car-wash / endowed progress. */
export function StepProgress({
  step,
  total = 3,
  fraction,
  label,
  className,
}: StepProgressProps) {
  const pct =
    fraction !== undefined
      ? Math.min(100, Math.max(0, fraction * 100))
      : Math.min(100, (step / total) * 100);
  const isAlmost = label === "Almost done!" || pct >= 90;
  const left = isAlmost ? `Step ${step} of ${total}` : (label ?? `Step ${step} of ${total}`);
  const right = pct >= 100 ? "Done" : isAlmost ? "Almost done!" : `${Math.round(pct)}%`;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-small text-neutral-secondary">{left}</span>
        <span className="text-small font-semibold text-pmb-700">{right}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
