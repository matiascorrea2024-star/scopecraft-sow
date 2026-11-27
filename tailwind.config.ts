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
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        canvas: "#FAFAF8",
        paper: "#FFFFFF",
        subtle: "#F3F2EE",
        hairline: "#E5E3DC",
        ink: {
          DEFAULT: "#141413",
          secondary: "#52514B",
          muted: "#6E6C64",
        },
        forest: {
          DEFAULT: "#0F5C4A",
          hover: "#0B4638",
          tint: "#ECF5F2",
        },
      },
    },
  },
  plugins: [],
};

export default config;
