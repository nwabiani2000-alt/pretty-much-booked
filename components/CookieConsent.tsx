"use client";

import { useEffect, useState } from "react";

const KEY = "pmb_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: "accepted" | "essential") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-700">
          We use essential cookies for sign-in and bookings. Analytics cookies are
          optional. See our{" "}
          <a href="/privacy" className="underline text-brand-primary">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={() => choose("essential")}
          >
            Essential only
          </button>
          <button
            type="button"
            className="rounded-lg bg-brand-primary px-3 py-2 text-sm text-white"
            onClick={() => choose("accepted")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
