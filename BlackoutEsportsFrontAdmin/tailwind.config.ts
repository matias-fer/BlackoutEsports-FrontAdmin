import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        panel: "#141922",
        panel2: "#1B222D",
        line: "#2A3340",
        signal: "#E32636",
        signal2: "#FF5964",
        paper: "#EDEFF2",
        mute: "#8B94A3",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(to right, #24171A 1px, transparent 1px), linear-gradient(to bottom, #24171A 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
    },
  },
  plugins: [],
};
export default config;
