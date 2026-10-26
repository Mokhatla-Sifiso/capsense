import type { NextConfig } from "next";

// Baseline security headers (NFR-S1). The nonce-based Content-Security-Policy is set per request in
// `src/proxy.ts` (task #264, B11) because nonces cannot be static.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // ADR-006: standalone server output for the multi-stage Docker image.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Next.js 16.4 defaults (Partial Prerendering + Partial Prefetching). Pages that read headers() or
  // searchParams must render inside <Suspense> (ADR-001 amendment, pending Muzi).
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
