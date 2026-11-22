"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

type InspirationBriefProps = {
  styleNotes: string;
  onStyleNotes: (v: string) => void;
  labels: string[];
  onLabels: (v: string[]) => void;
};

const PRESETS = ["Soft glam", "Natural", "Bold colour", "Protective style"];

/** Photos (mock file pick) + style notes — Hick’s: optional, one block. */
export function InspirationBrief({
  styleNotes,
  onStyleNotes,
  labels,
  onLabels,
}: InspirationBriefProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hint, setHint] = useState<string | null>(null);

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const names = Array.from(files)
      .slice(0, 3)
      .map((f) => f.name.replace(/\.[^.]+$/, "").slice(0, 24) || "Photo");
    onLabels([...labels, ...names].slice(0, 4));
    setHint(`${names.length} photo${names.length > 1 ? "s" : ""} attached (mock)`);
  }

  return (
    <div className="mt-8">
      <p className="text-caption font-medium uppercase tracking-wide text-neutral-muted">
        Inspiration
      </p>
      <p className="mt-1 text-small text-neutral-secondary">
        Photos + a short note so the pro nails your look.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const on = labels.includes(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={on}
              onClick={() =>
                onLabels(
                  on ? labels.filter((x) => x !== p) : [...labels, p].slice(0, 4)
                )
              }
              className={cn(
                "pressable rounded-button px-3 py-2 text-small font-medium transition",
                on
                  ? "bg-pmb-700 text-white"
                  : "bg-neutral-bg text-neutral-secondary"
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-secondary mt-4 w-full no-underline"
        onClick={() => inputRef.current?.click()}
      >
        Add photos
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      {labels.length > 0 && (
        <p className="mt-2 text-caption text-neutral-secondary">
          {labels.join(" · ")}
        </p>
      )}
      {hint && <p className="mt-1 text-caption text-pmb-700">{hint}</p>}

      <textarea
        value={styleNotes}
        onChange={(e) => onStyleNotes(e.target.value)}
        placeholder="Style notes (length, colour, reference…)"
        rows={3}
        className="input-underline mt-4 w-full resize-none"
      />
    </div>
  );
}
