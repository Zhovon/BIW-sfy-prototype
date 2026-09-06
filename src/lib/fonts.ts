import { Cormorant_Garamond, Montserrat } from "next/font/google";

/**
 * Shared web fonts — declared once so both root layouts (store + admin) apply
 * the same CSS variables (--font-display / --font-body) to <html>.
 */
export const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const bodyFont = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});
