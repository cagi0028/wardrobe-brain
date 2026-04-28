import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "Georgia", "serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Warm stone palette — feels like linen and ivory
        stone: {
          50: "#FAFAF8",
          100: "#F4F3EE",
          200: "#E8E5DC",
          300: "#D4CFBF",
          400: "#B5AE9A",
          500: "#8E8672",
          600: "#6B6352",
          700: "#4A4438",
          800: "#2E2820",
          900: "#1A1510",
          950: "#0D0B07",
        },
        // Warm gold accent
        gold: {
          300: "#E8D08A",
          400: "#D4B856",
          500: "#C4A43E",
          600: "#A08030",
        },
        // Dusty sage
        sage: {
          100: "#EEF1E8",
          200: "#D4DBC8",
          300: "#B0BDA0",
          400: "#8A9C78",
          500: "#6B7A5C",
        },
        // Terracotta for alerts
        terra: {
          100: "#F5E8E0",
          400: "#C8795A",
          500: "#B05E3E",
        },
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(26,21,16,0.04), 0 4px 16px 0 rgba(26,21,16,0.06)",
        "card-hover": "0 4px 12px 0 rgba(26,21,16,0.08), 0 12px 28px 0 rgba(26,21,16,0.10)",
        float: "0 8px 32px 0 rgba(26,21,16,0.12), 0 2px 8px 0 rgba(26,21,16,0.06)",
        "inner-sm": "inset 0 1px 3px 0 rgba(26,21,16,0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.32s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
        "shimmer": "shimmer 1.8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
