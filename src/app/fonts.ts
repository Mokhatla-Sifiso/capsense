import localFont from "next/font/local";

export const nunitoSans = localFont({
  src: [
    { path: "./fonts/nunito-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/nunito-sans-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/nunito-sans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-nunito-sans",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
  adjustFontFallback: "Arial",
});
