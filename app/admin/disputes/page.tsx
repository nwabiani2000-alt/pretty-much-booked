"use client";

import { loadDisputes, type AdminDispute } from "@/lib/admin";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDisputes(loadDisputes());
    setReady(true);
  }, []);

  const open = disputes.filter((d) => d.status === "open");
  const resolved = disputes.filter((d) => d.status === "resolved");

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-12 pt-5">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-brand-muted">
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
        Disputes
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        {ready ? `${open.length} open` : "…"}
      </p>

      {!ready ? (
        <div className="mt-8 space-y-3">
          <div className="skeleton h-14 w-full rounded" />
          <div className="skeleton h-14 w-full rounded" />
        </div>
      ) : (
        <>
          <ul className="mt-8">
            {open.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/admin/disputes/${d.id}`}
                  className="block py-4 transition active:scale-[0.98]"
                >
                  <p className="text-lg font-semibold text-black">
                    {d.customerName} · {d.proName}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {d.serviceName} · {d.amount}
                  </p>
                </Link>
              </li>
            ))}
            {open.length === 0 && (
              <p className="py-6 text-base text-black">No open disputes</p>
            )}
          </ul>

          {resolved.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm text-brand-muted">Resolved</h2>
              <ul className="mt-2">
                {resolved.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/admin/disputes/${d.id}`}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-base text-black">
                        {d.customerName}
                      </span>
                      <span className="text-sm text-brand-muted">Done</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
