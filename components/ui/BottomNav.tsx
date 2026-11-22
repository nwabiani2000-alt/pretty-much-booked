"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/book",
    label: "Home",
    match: (p: string) => p === "/book" || p.startsWith("/book/"),
  },
  {
    href: "/bookings/bk_demo_track",
    label: "Bookings",
    match: (p: string) => p.startsWith("/bookings"),
  },
  {
    href: "/messages",
    label: "Messages",
    match: (p: string) => p.startsWith("/messages"),
  },
  {
    href: "/profile",
    label: "Profile",
    match: (p: string) => p.startsWith("/profile"),
  },
] as const;

type BottomNavProps = {
  /** Show floating Book Now — home / list surfaces */
  showBook?: boolean;
  bookHref?: string;
};

/** Research pack §9 — ≤4 tabs + center floating Book Now. */
export function BottomNav({
  showBook = true,
  bookHref = "/book",
}: BottomNavProps) {
  const pathname = usePathname() || "/book";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-neutral-card/95 shadow-card backdrop-blur-md"
      aria-label="Main"
    >
      <div className="relative mx-auto flex h-16 max-w-md items-center justify-between px-2">
        {TABS.slice(0, 2).map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-touch min-w-[4.5rem] flex-col items-center justify-center gap-0.5 text-caption font-medium transition-colors",
                active ? "text-pmb-700" : "text-neutral-muted"
              )}
            >
              <TabIcon name={tab.label} active={active} />
              {tab.label}
            </Link>
          );
        })}

        {showBook ? (
          <Link
            href={bookHref}
            className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full bg-pmb-700 text-caption font-bold text-white shadow-card transition active:scale-[0.97] active:bg-pmb-800"
            aria-label="Book Now"
          >
            Book
          </Link>
        ) : (
          <span className="w-14" />
        )}

        {TABS.slice(2).map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-touch min-w-[4.5rem] flex-col items-center justify-center gap-0.5 text-caption font-medium transition-colors",
                active ? "text-pmb-700" : "text-neutral-muted"
              )}
            >
              <TabIcon name={tab.label} active={active} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#5B2C87" : "#9CA3AF";
  if (name === "Home") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "Bookings") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2"
          stroke={stroke}
          strokeWidth="1.8"
        />
        <path d="M8 3v4M16 3v4M4 10h16" stroke={stroke} strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "Messages") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 6h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke={stroke} strokeWidth="1.8" />
      <path
        d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
