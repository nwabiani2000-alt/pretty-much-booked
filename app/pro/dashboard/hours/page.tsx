"use client";

import { Button, TextLink } from "@/components/ui/Button";
import {
  loadAvailability,
  saveAvailability,
  type ProAvailabilityState,
} from "@/lib/pro-dashboard";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProHoursPage() {
  const router = useRouter();
  const [avail, setAvail] = useState<ProAvailabilityState | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAvail(loadAvailability());
  }, []);

  if (!avail) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-24 w-full rounded" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
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
        Hours
      </h1>
      <p className="mt-2 text-sm text-brand-muted">When you take jobs</p>

      <label className="mt-10 block">
        <span className="text-sm text-brand-muted">Weekdays</span>
        <input
          type="text"
          value={avail.weekdayHours}
          onChange={(e) =>
            setAvail({ ...avail, weekdayHours: e.target.value })
          }
          className="input-underline mt-2"
        />
      </label>

      <label className="mt-8 block">
        <span className="text-sm text-brand-muted">Weekends</span>
        <input
          type="text"
          value={avail.weekendHours}
          onChange={(e) =>
            setAvail({ ...avail, weekendHours: e.target.value })
          }
          className="input-underline mt-2"
        />
      </label>

      {saved && (
        <p className="animate-fade-in mt-6 text-sm text-brand-purple">Saved</p>
      )}

      <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
        <div className="mx-auto max-w-md">
          <Button
            type="button"
            onClick={() => {
              saveAvailability(avail);
              setSaved(true);
              window.setTimeout(() => router.push("/pro/dashboard"), 500);
            }}
          >
            Save
          </Button>
          <div className="mt-3 text-center">
            <TextLink onClick={() => router.push("/pro/dashboard")}>
              Cancel
            </TextLink>
          </div>
        </div>
      </div>
    </main>
  );
}
