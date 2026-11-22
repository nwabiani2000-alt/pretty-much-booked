"use client";

import Image from "next/image";
import Link from "next/link";

const SOCIALS = [
  {
    id: "instagram",
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "#",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || "#",
  },
  {
    id: "x",
    label: "X",
    href: process.env.NEXT_PUBLIC_SOCIAL_X || "#",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP || "#",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "#",
  },
] as const;

type SocialId = (typeof SOCIALS)[number]["id"];

export function LandingPage() {
  return (
    <main className="landing-root relative min-h-[100dvh] bg-neutral-bg">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-6xl lg:grid-cols-2">
        {/* Copy column — brand, headline, sentence, CTA group */}
        <section className="relative z-10 order-2 flex flex-col justify-center px-screen py-10 sm:px-10 sm:py-14 lg:order-1 lg:px-14 lg:py-16">
          <p className="landing-brand font-display text-[clamp(2.6rem,9vw,4.75rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-neutral-text">
            Pretty Much
            <span className="mt-1 block text-gold-500">Booked</span>
          </p>

          <h1 className="landing-headline mt-5 max-w-md font-display text-[clamp(1.15rem,2.8vw,1.5rem)] font-medium leading-snug tracking-[-0.02em] text-neutral-text sm:mt-6">
            Mobile beauty, booked in minutes.
          </h1>

          <p className="landing-sub mt-3 max-w-sm text-body text-neutral-secondary">
            Hair, nails, makeup, and lashes — pros come to you.
          </p>

          <div className="landing-cta mt-7 flex w-full max-w-sm flex-col gap-4 sm:mt-8 sm:gap-5">
            <Link
              href="/book"
              className="inline-flex h-btn-primary items-center justify-center rounded-button bg-pmb-700 text-body-bold text-white no-underline transition-transform duration-normal ease-premium hover:scale-[1.01] active:scale-[0.97] active:bg-pmb-800"
            >
              Book now
            </Link>

            <nav
              className="landing-socials flex flex-wrap items-center gap-x-1 gap-y-0"
              aria-label="Social links"
            >
              {SOCIALS.map((s) => (
                <SocialLink
                  key={s.id}
                  id={s.id}
                  label={s.label}
                  href={s.href}
                />
              ))}
            </nav>
          </div>
        </section>

        {/* Dominant full-bleed brand mark — edge-to-edge visual plane */}
        <div
          className="landing-visual relative order-1 min-h-[42vh] overflow-hidden bg-pmb-700 lg:order-2 lg:min-h-[100dvh]"
          aria-hidden
        >
          <Image
            src="/images/logo-icon-white-on-purple.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="landing-logo object-cover object-center"
          />
        </div>
      </div>
    </main>
  );
}

function SocialLink({
  id,
  label,
  href,
}: {
  id: SocialId;
  label: string;
  href: string;
}) {
  const className =
    "group inline-flex min-h-touch items-center gap-2 rounded-button px-2.5 text-small text-neutral-secondary hover:text-pmb-700";

  if (href === "#") {
    return (
      <span className={className} title={`${label} — link coming soon`}>
        <SocialIcon id={id} />
        <span className="font-medium">{label}</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      <SocialIcon id={id} />
      <span className="font-medium">{label}</span>
    </a>
  );
}

function SocialIcon({ id }: { id: SocialId }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };
  const stroke = "currentColor";

  if (id === "instagram") {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke={stroke}
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1" fill={stroke} />
      </svg>
    );
  }
  if (id === "tiktok") {
    return (
      <svg {...common}>
        <path
          d="M14 4c.4 2.2 1.8 3.8 4 4.2v2.6c-1.5-.1-2.8-.6-4-1.4V15a5 5 0 1 1-5-5c.3 0 .7 0 1 .1v2.7a2.3 2.3 0 1 0 2.3 2.3V4h1.7Z"
          fill={stroke}
        />
      </svg>
    );
  }
  if (id === "x") {
    return (
      <svg {...common}>
        <path
          d="M4 4h3.4l4.3 5.8L16.8 4H20l-6.2 7.2L20.4 20h-3.4l-4.7-6.3L7.2 20H4l6.6-7.6L4 4Z"
          fill={stroke}
        />
      </svg>
    );
  }
  if (id === "whatsapp") {
    return (
      <svg {...common}>
        <path
          d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L4 20.5l4.4-.7A8.5 8.5 0 1 0 12 3.5Zm0 1.6a6.9 6.9 0 0 1 5.8 10.6l-.3.4.5 2.1-2.1-.5-.4.2A6.9 6.9 0 0 1 12 5.1Zm-3.3 3.3c.2-.1.5-.1.7 0l1 2.2c.1.2 0 .4-.1.6l-.4.5c-.1.1-.1.3 0 .4.4.7 1.1 1.4 1.9 1.9.1.1.3.1.4 0l.5-.4c.2-.1.4-.2.6-.1l2.2 1c.1.2.1.5 0 .7-.3.6-1 .9-1.6.9-2.5 0-5.4-2.9-5.9-5.4-.1-.6.2-1.3.7-1.6Z"
          fill={stroke}
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M6 9.5V20H3.2V9.5H6ZM4.6 4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM20.8 20h-2.8v-5.4c0-1.5-.6-2.5-2-2.5-1 0-1.6.7-1.9 1.3-.1.2-.1.6-.1.9V20H11.2s0-8.6 0-9.5h2.8v1.3c.4-.6 1.4-1.6 3.3-1.6 2.4 0 4.1 1.6 4.1 5V20Z"
        fill={stroke}
      />
    </svg>
  );
}
