"use client";

import { prepChecklist } from "@/lib/prep-checklist";
import type { ServiceCategory } from "@/types/booking";
import { cn } from "@/lib/utils";

type PrepChecklistProps = {
  category: ServiceCategory;
  checked: boolean;
  onChecked: (v: boolean) => void;
};

export function PrepChecklistBlock({
  category,
  checked,
  onChecked,
}: PrepChecklistProps) {
  const items = prepChecklist(category);

  return (
    <div className="mt-8">
      <p className="text-caption font-medium uppercase tracking-wide text-neutral-muted">
        Prep
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="text-small text-neutral-text">
            · {item.label}
          </li>
        ))}
      </ul>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChecked(!checked)}
        className={cn(
          "mt-4 flex w-full items-center gap-3 rounded-button px-3 py-3 text-left transition",
          checked ? "bg-pmb-50 text-pmb-700" : "bg-neutral-bg text-neutral-secondary"
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border text-caption",
            checked
              ? "border-pmb-700 bg-pmb-700 text-white"
              : "border-neutral-input"
          )}
        >
          {checked ? "✓" : ""}
        </span>
        <span className="text-small font-medium">I&apos;ll be ready</span>
      </button>
    </div>
  );
}
