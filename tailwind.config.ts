import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Lidos do tema do tenant via CSS vars (aplicadas no layout).
        brand: "var(--brand)",
        "brand-fg": "var(--brand-fg)",
        ink: "var(--ink)",
        surface: "var(--surface)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui"],
      },
    },
  },
  plugins: [],
};
export default config;
