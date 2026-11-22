"use client";

import { Button, TextLink } from "@/components/ui/Button";
import { loadProKyc, submitProKyc, type ProKycState } from "@/lib/pro-kyc";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProKycPage() {
  const [kyc, setKyc] = useState<ProKycState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setKyc(loadProKyc());
  }, []);

  if (!kyc) {
    return (
      <main className="mx-auto max-w-md px-5 pt-20">
        <div className="skeleton h-8 w-40" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-16 pt-6">
      {toast ? (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-badge bg-neutral-text px-4 py-2 text-small text-white">
          {toast}
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <Link href="/pro/dashboard" className="text-small text-neutral-secondary no-underline">
          Dashboard
        </Link>
        <Image src="/images/logo-icon-purple.png" alt="" width={28} height={28} />
      </div>

      <div className="card mt-6">
        <p className="text-caption font-semibold uppercase tracking-wide text-pmb-700">
          Verification
        </p>
        <h1 className="mt-2 text-display text-neutral-text">KYC</h1>
        <p className="mt-2 text-small text-neutral-secondary">
          Upload stubs for ID + selfie. Status shows on admin vetting.
        </p>
        <p className="mt-4 text-small font-medium capitalize text-pmb-700">
          {kyc.status === "none" ? "Not started" : kyc.status}
        </p>

        <button
          type="button"
          className="btn-secondary mt-8 w-full no-underline"
          onClick={() => {
            const next = { ...kyc, idUploaded: true };
            setKyc(next);
            setToast("ID placeholder attached");
            window.setTimeout(() => setToast(null), 1600);
          }}
        >
          {kyc.idUploaded ? "ID ✓" : "Upload ID (stub)"}
        </button>
        <button
          type="button"
          className="btn-secondary mt-3 w-full no-underline"
          onClick={() => {
            const next = { ...kyc, selfieUploaded: true };
            setKyc(next);
            setToast("Selfie placeholder attached");
            window.setTimeout(() => setToast(null), 1600);
          }}
        >
          {kyc.selfieUploaded ? "Selfie ✓" : "Upload selfie (stub)"}
        </button>

        <div className="mt-10">
          <Button
            type="button"
            disabled={!kyc.idUploaded || !kyc.selfieUploaded}
            onClick={() => {
              const next = submitProKyc({
                idUploaded: true,
                selfieUploaded: true,
              });
              setKyc(next);
              setToast("Pending verification");
            }}
          >
            Submit for review
          </Button>
        </div>
        <TextLink
          className="mt-4 block text-center no-underline"
          onClick={() => (window.location.href = "/pro/dashboard")}
        >
          Back
        </TextLink>
      </div>
    </main>
  );
}
