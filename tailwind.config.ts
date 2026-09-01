import type { Config } from "tailwindcss";

/**
 * Colors + fonts are wired to CSS variables defined in globals.css.
 * This is what makes the "recolor" step a one-file swap: change the
 * variable values, every component follows.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ice: "var(--ice)",
        teal: "var(--teal)",
        ink: "var(--ink)",
        gold: "var(--gold)",
        paper: "var(--paper)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "Montserrat", "system-ui", "sans-serif"],
      },
      maxWidth: { shell: "1200px" },
    },
  },
  plugins: [],
};

export default config;
