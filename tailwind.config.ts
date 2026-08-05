import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        court: {
          950: "#0A2420",
          800: "#0F4C46",
          600: "#1C6F63",
          100: "#EBEFE2",
        },
        ball: {
          500: "#CFE94D",
          ink: "#3A4B12",
        },
        ink: {
          900: "#13241F",
          600: "#54655D",
        },
        bg: "#F5F6F0",
        win: { DEFAULT: "#2E7D5B", bg: "#E4F3EA" },
        loss: { DEFAULT: "#C0483A", bg: "#FBEAE7" },
        draw: { DEFAULT: "#B4900F", bg: "#FBF3DC" },
        pending: { DEFAULT: "#8C1C5C", bg: "#F8E4EF" },
        info: { DEFAULT: "#1C4E85", bg: "#E4EEF8" },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
        modal: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,40,36,.06), 0 12px 32px rgba(15,40,36,.08)",
      },
    },
  },
  plugins: [],
};
export default config;
