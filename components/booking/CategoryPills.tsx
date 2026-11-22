"use client";

import { HOME_CATEGORIES } from "@/lib/services";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/types/booking";

type CategoryPillsProps = {
  selected: ServiceCategory | "all";
  onSelect: (category: ServiceCategory | "all") => void;
};

/** Compact category chips — no Popular/Trending badges (§8). */
export function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none">
      <div className="flex w-max gap-2">
        {HOME_CATEGORIES.map((category) => {
          const active = selected === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={cn(
                "min-h-12 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.97]",
                active
                  ? "bg-brand-purple text-white"
                  : "bg-white text-black ring-1 ring-[#F3F4F6]"
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
