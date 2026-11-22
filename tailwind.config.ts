import type { Config } from "tailwindcss";

/**
 * Source of truth: docs/design-system/tailwind.config.js
 * Kept as TypeScript + Poppins (anti-slop / brand font already in layout).
 * `brand.*` aliases preserved for existing call sites.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pmb: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#5B2C87",
          800: "#4A1F6B",
          900: "#3B1560",
          950: "#2E1065",
        },
        gold: {
          50: "#FEFCE8",
          100: "#FEF9C3",
          200: "#FEF08A",
          300: "#FDE047",
          400: "#FACC15",
          500: "#D4AF37",
          600: "#B8960F",
          700: "#A16207",
        },
        neutral: {
          white: "#FFFFFF",
          bg: "#FAFAFA",
          card: "#FFFFFF",
          border: "#F3F4F6",
          input: "#E5E7EB",
          text: "#000000",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        // Legacy aliases used across booking surfaces
        brand: {
          purple: "#5B2C87",
          "purple-dark": "#4A1F6B",
          "purple-light": "#F5F0FA",
          gold: "#D4AF37",
          dark: "#000000",
          muted: "#6B7280",
          gray: "#FAFAFA",
        },
      },
      spacing: {
        card: "24px",
        "card-gap": "16px",
        section: "32px",
        screen: "20px",
      },
      borderRadius: {
        card: "20px",
        button: "12px",
        btn: "12px",
        input: "8px",
        badge: "9999px",
        avatar: "50%",
      },
      fontSize: {
        display: [
          "32px",
          { lineHeight: "36px", fontWeight: "700", letterSpacing: "-0.02em" },
        ],
        title: [
          "24px",
          { lineHeight: "28px", fontWeight: "700", letterSpacing: "-0.01em" },
        ],
        heading: ["20px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-bold": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        small: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        price: ["20px", { lineHeight: "24px", fontWeight: "700" }],
      },
      fontFamily: {
        sans: [
          "var(--font-poppins)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "var(--font-syne)",
          "var(--font-poppins)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.08)",
        button: "0 1px 2px rgba(0, 0, 0, 0.05)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "350ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "stagger-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        press: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        skeleton: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
        pop: {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "70%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-forward": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-back": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "overshoot-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.96) translateY(10px)",
          },
          "70%": { opacity: "1", transform: "scale(1.02) translateY(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up":
          "fade-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "stagger-in":
          "stagger-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        press: "press 0.15s ease-in-out",
        shake: "shake 0.3s ease-in-out",
        "check-pop":
          "check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        skeleton: "skeleton 1.2s ease-in-out infinite",
        pop: "pop 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-forward":
          "slide-forward 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "slide-back":
          "slide-back 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "slide-in":
          "slide-forward 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "fade-in":
          "fade-in 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        overshoot:
          "overshoot-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
      },
      height: {
        "btn-primary": "56px",
        "btn-secondary": "48px",
        input: "48px",
        touch: "48px",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
