"use client";

import { Button, TextLink } from "@/components/ui/Button";
import { UnderlineField } from "@/components/ui/UnderlineField";
import {
  isValidPhone,
  normalizePhone,
  saveAuthSession,
  type AuthSession,
} from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PhoneOtpFormProps = {
  mode: "login" | "signup";
};

type AuthConfig = {
  supabaseEnabled: boolean;
  mode: "live" | "mock";
};

export function PhoneOtpForm({ mode }: PhoneOtpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [normalized, setNormalized] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((data: AuthConfig) => setConfig(data))
      .catch(() => setConfig({ supabaseEnabled: false, mode: "mock" }));
  }, []);

  // Demo deep-link: /login?step=code&phone=+447700900123
  useEffect(() => {
    if (searchParams.get("step") !== "code") return;
    const p = searchParams.get("phone") || "+447700900123";
    const n = normalizePhone(p);
    setPhone(p);
    setNormalized(n);
    setHint("Use code 000000");
    setStep("code");
  }, [searchParams]);

  async function sendCode(fromResend = false) {
    setError(null);
    const n = fromResend && normalized ? normalized : normalizePhone(phone);
    if (!isValidPhone(n)) {
      setError("Enter a valid mobile number");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: n }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send code");
        if (data.hint) setHint(data.hint);
        return;
      }
      setNormalized(n);
      setHint(data.hint || null);
      setStep("code");
    } catch {
      setError("Could not send code");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, token: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        return;
      }
      const session = data.session as AuthSession;
      saveAuthSession(session);
      router.push("/book");
    } catch {
      setError("Could not verify code");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "login" ? "Log in" : "Sign up";
  const altHref = mode === "login" ? "/signup" : "/login";
  const altLabel = mode === "login" ? "Create account" : "Log in instead";
  const authMode = config?.mode ?? "mock";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-12 pt-5">
      <div className="flex items-center justify-between">
        <Link href="/book" className="btn-secondary no-underline">
          Back
        </Link>
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <div className="card mt-8 animate-fade-up">
        <p className="text-caption font-medium uppercase tracking-wide text-neutral-muted">
          Auth · {authMode === "live" ? "Supabase" : "Mock"}
        </p>
        <h1 className="mt-2 text-display text-neutral-text">{title}</h1>
        <p className="mt-2 text-small text-neutral-secondary">
          {step === "phone"
            ? "We’ll text a one-time code"
            : `Code sent to ${normalized}`}
        </p>

        {step === "phone" && (
          <div className="mt-8 space-y-4">
            <UnderlineField
              label="Mobile number"
              hintPlaceholder="07…"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              state={error ? "error" : "default"}
              errorText={error || undefined}
            />
            <Button type="button" disabled={busy} onClick={sendCode}>
              {busy ? "…" : "Send code"}
            </Button>
          </div>
        )}

        {step === "code" && (
          <div className="mt-8 space-y-4">
            <UnderlineField
              label="6-digit code"
              hintPlaceholder="••••••"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              state={error ? "error" : code.length === 6 ? "success" : "default"}
              errorText={error || undefined}
            />
            {hint && (
              <p className="text-caption text-neutral-secondary">{hint}</p>
            )}
            <Button type="button" disabled={busy} onClick={verifyCode}>
              {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
            </Button>
            <div className="flex justify-center gap-4">
              <TextLink
                className="no-underline"
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError(null);
                }}
              >
                Change number
              </TextLink>
              <TextLink
                className="no-underline"
                onClick={() => {
                  void sendCode(true);
                }}
              >
                Resend
              </TextLink>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href={altHref} className="btn-secondary no-underline">
            {altLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
