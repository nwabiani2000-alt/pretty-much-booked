"use client";

import { adminCounts } from "@/lib/admin";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminHomePage() {
  const [counts, setCounts] = useState({ pendingPros: 0, openDisputes: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCounts(adminCounts());
    setReady(true);
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-12 pt-5">
      <div className="flex items-center justify-between">
        <Image
          src="/images/logo-icon-purple.png"
          alt="Pretty Much Booked"
          width={28}
          height={28}
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-purple">
          Admin
        </span>
      </div>

      <h1 className="mt-10 font-display text-[2rem] font-bold text-black">
        Admin
      </h1>
      <p className="mt-2 text-sm text-brand-muted">Vetting and disputes</p>

      {!ready ? (
        <div className="mt-12 space-y-4">
          <div className="skeleton h-16 w-full rounded" />
          <div className="skeleton h-16 w-full rounded" />
        </div>
      ) : (
        <nav className="mt-12 flex flex-col">
          <Link
            href="/admin/pros"
            className="flex items-baseline justify-between py-5 transition active:scale-[0.98]"
          >
            <span className="text-xl font-semibold text-black">Pros to vet</span>
            <span className="text-2xl font-bold text-brand-purple">
              {counts.pendingPros}
            </span>
          </Link>
          <Link
            href="/admin/disputes"
            className="flex items-baseline justify-between py-5 transition active:scale-[0.98]"
          >
            <span className="text-xl font-semibold text-black">Disputes</span>
            <span className="text-2xl font-bold text-brand-purple">
              {counts.openDisputes}
            </span>
          </Link>
        </nav>
      )}

      <div className="mt-16 flex flex-col gap-3 text-sm text-brand-muted">
        <Link href="/pro/dashboard">Pro dashboard</Link>
        <Link href="/">Customer app</Link>
        <p className="text-xs text-brand-muted/70">
          Gate: ADMIN_SECRET or demo <code className="text-brand-purple">pmb-admin-demo</code>
        </p>
      </div>
    </main>
  );
}
