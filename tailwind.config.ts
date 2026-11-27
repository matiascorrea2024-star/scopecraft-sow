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
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        obsidian: "#090D16",
        canvas: "#F8FAFC",
        paper: "#FFFFFF",
        subtle: "#F1F5F9",
        hairline: "#E2E8F0",
        ink: {
          DEFAULT: "#0F172A",
          secondary: "#475569",
          muted: "#64748B",
        },
        forest: {
          DEFAULT: "#059669",
          hover: "#047857",
          tint: "#ECFDF5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
