import Image from "next/image";
import Link from "next/link";

type ProStepHeaderProps = {
  backHref?: string;
  onBack?: () => void;
  step?: number;
  total?: number;
};

export function ProStepHeader({
  backHref,
  onBack,
  step,
  total,
}: ProStepHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-brand-muted transition active:scale-[0.98]"
        >
          Back
        </button>
      ) : backHref ? (
        <Link
          href={backHref}
          className="text-sm text-brand-muted transition active:scale-[0.98]"
        >
          Back
        </Link>
      ) : (
        <span />
      )}
      <Image
        src="/images/logo-icon-purple.png"
        alt="Pretty Much Booked"
        width={24}
        height={24}
      />
      {step && total ? (
        <span className="text-xs text-brand-muted">
          Step {step} of {total}
        </span>
      ) : (
        <span className="w-10" />
      )}
    </div>
  );
}
