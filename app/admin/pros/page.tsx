"use client";

import { loadAdminPros, type AdminPro } from "@/lib/admin";
import { loadProKyc } from "@/lib/pro-kyc";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminProsPage() {
  const [pros, setPros] = useState<AdminPro[]>([]);
  const [kycPending, setKycPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPros(loadAdminPros());
    setKycPending(loadProKyc().status === "pending");
    setReady(true);
  }, []);

  const pending = pros.filter((p) => p.status === "pending");
  const done = pros.filter((p) => p.status !== "pending");

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
        Pros
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        {ready ? `${pending.length} pending` : "…"}
        {kycPending ? " · KYC pending verification" : ""}
      </p>
      {kycPending ? (
        <p className="mt-4 rounded-button bg-brand-purple/10 px-3 py-3 text-sm text-brand-purple">
          A pro submitted ID + selfie stubs — Pending verification
        </p>
      ) : null}

      {!ready ? (
        <div className="mt-8 space-y-3">
          <div className="skeleton h-14 w-full rounded" />
          <div className="skeleton h-14 w-full rounded" />
        </div>
      ) : (
        <>
          <ul className="mt-8">
            {pending.map((pro) => (
              <li key={pro.id}>
                <Link
                  href={`/admin/pros/${pro.id}`}
                  className="block py-4 transition active:scale-[0.98]"
                >
                  <p className="text-lg font-semibold text-black">
                    {pro.displayName}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {pro.specialties.join(" · ")} · {pro.city}
                  </p>
                </Link>
              </li>
            ))}
            {pending.length === 0 && (
              <p className="py-6 text-base text-black">All clear</p>
            )}
          </ul>

          {done.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm text-brand-muted">Reviewed</h2>
              <ul className="mt-2">
                {done.map((pro) => (
                  <li
                    key={pro.id}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-base text-black">
                      {pro.displayName}
                    </span>
                    <span className="text-sm text-brand-muted capitalize">
                      {pro.status}
                    </span>
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
