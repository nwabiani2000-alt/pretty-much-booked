"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { MarketToggle } from "@/components/market/MarketToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button, TextLink } from "@/components/ui/Button";
import {
  getClubPoints,
  isClubMember,
  joinClub,
} from "@/lib/loyalty";
import {
  isPushEnabled,
  loadPushLog,
  mockSendPush,
  setPushEnabled,
  type PushLogEntry,
} from "@/lib/push-prefs";
import { loadSavedLook } from "@/lib/saved-looks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { formatMoney, fxGbpToNgn, setFxGbpToNgn, marketId } = useMarket();
  const [club, setClub] = useState(false);
  const [pts, setPts] = useState(0);
  const [pushOn, setPushOn] = useState(false);
  const [log, setLog] = useState<PushLogEntry[]>([]);
  const [look, setLook] = useState(loadSavedLook());
  const [fxInput, setFxInput] = useState(String(fxGbpToNgn));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setClub(isClubMember());
    setPts(getClubPoints());
    setPushOn(isPushEnabled());
    setLog(loadPushLog());
    setLook(loadSavedLook());
    setFxInput(String(fxGbpToNgn));
  }, [fxGbpToNgn]);

  function toastMsg(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-28 pt-6">
      {toast ? (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-badge bg-neutral-text px-4 py-2 text-small text-white">
          {toast}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h1 className="text-display text-neutral-text">You</h1>
        <MarketToggle />
      </div>

      <div className="card mt-6">
        <p className="text-caption text-neutral-muted">PMB Club</p>
        {club ? (
          <p className="mt-2 text-body-bold text-neutral-text">
            {pts} points
          </p>
        ) : (
          <Button
            type="button"
            className="mt-4"
            onClick={() => {
              setPts(joinClub());
              setClub(true);
              toastMsg("Welcome to PMB Club");
            }}
          >
            Join Club
          </Button>
        )}
      </div>

      {look ? (
        <div className="card mt-4">
          <p className="text-caption text-neutral-muted">Saved look</p>
          <p className="mt-2 text-body-bold text-neutral-text">
            {look.serviceName} · {look.proName}
          </p>
          {look.styleNotes ? (
            <p className="mt-1 text-small text-neutral-secondary">
              {look.styleNotes}
            </p>
          ) : null}
          <div className="mt-4">
            <Button
              type="button"
              onClick={() =>
                router.push(
                  `/booking/${look.proId}/${look.serviceId}?step=when`
                )
              }
            >
              Book again
            </Button>
          </div>
        </div>
      ) : null}

      <div className="card mt-4">
        <p className="text-caption text-neutral-muted">Push (stub)</p>
        <button
          type="button"
          role="switch"
          aria-checked={pushOn}
          onClick={() => {
            const next = !pushOn;
            setPushEnabled(next);
            setPushOn(next);
          }}
          className="mt-3 flex w-full items-center justify-between py-2"
        >
          <span className="text-small font-medium text-neutral-text">
            Notifications
          </span>
          <span className="text-small text-pmb-700">
            {pushOn ? "On" : "Off"}
          </span>
        </button>
        <TextLink
          className="mt-2 no-underline"
          onClick={() => {
            if (!pushOn) {
              toastMsg("Enable notifications first");
              return;
            }
            mockSendPush(
              "Pro on the way",
              "Your stylist is heading over (mock)."
            );
            setLog(loadPushLog());
            toastMsg("Mock push logged");
          }}
        >
          Send mock push
        </TextLink>
        {log[0] ? (
          <p className="mt-3 text-caption text-neutral-secondary">
            Last: {log[0].title} · {new Date(log[0].at).toLocaleTimeString()}
          </p>
        ) : null}
        <p className="mt-2 text-caption text-neutral-muted">
          FCM / APNs later — prefs + log only.
        </p>
      </div>

      <div className="card mt-4">
        <p className="text-caption text-neutral-muted">
          FX · 1 GBP → NGN ({marketId})
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={fxInput}
            onChange={(e) => setFxInput(e.target.value)}
            inputMode="numeric"
            className="input-underline min-w-0 flex-1"
          />
          <Button
            type="button"
            className="!w-auto shrink-0 px-4"
            onClick={() => {
              const n = Number(fxInput);
              if (!Number.isFinite(n) || n <= 0) {
                toastMsg("Enter a valid rate");
                return;
              }
              setFxGbpToNgn(n);
              toastMsg(`FX set · sample ${formatMoney(10)}`);
            }}
          >
            Set
          </Button>
        </div>
        <p className="mt-2 text-caption text-neutral-muted">
          Or env PMB_FX_GBP_NGN. Default 2100.
        </p>
      </div>

      <p className="mt-8 text-center text-caption text-neutral-muted">
        <Link href="/" className="text-neutral-secondary no-underline">
          Home
        </Link>
      </p>
      <BottomNav />
    </main>
  );
}
