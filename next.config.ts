import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/*
  Content Security Policy. Pages, fonts and media are first-party. Forms talk
  to the Firebase Realtime Database (WebSocket, with a long-polling script
  fallback) and look up the sender's IP and area (lib/visitor.ts). Google
  Analytics loads from googletagmanager.com and reports to google-analytics.com. Next's
  hydration and framer-motion need inline scripts and styles. Dev adds eval
  and the hot-reload socket.
*/
const firebaseDb = "https://*.firebaseio.com wss://*.firebaseio.com";
const ipLookup = "https://ipinfo.io https://free.freeipapi.com";
const analytics = "https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://*.firebaseio.com https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${analytics}`,
  "font-src 'self' data:",
  `connect-src 'self' ${firebaseDb} ${ipLookup} ${analytics}${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Browsers only honour HSTS over HTTPS. Subdomains are left out until they all serve HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/*
  Permanent (301) redirects: the www host to the bare domain, and likely old
  or alternative URLs to their pages here. Add any other old URLs that still
  get traffic or links (check Search Console → Pages → Not found).
*/
const moved: [from: string, to: string][] = [
  ["/home", "/"],
  ["/index.html", "/"],
  ["/index.php", "/"],
  ["/about-us", "/about"],
  ["/contact-us", "/contact"],
  ["/products.html", "/products"],
  ["/product/:slug", "/products/:slug"],
  ["/services", "/products#services"],
  ["/technology", "/platform"],
  ["/privacy-policy", "/privacy"],
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework in an X-Powered-By header
  poweredByHeader: false,
  images: {
    // The optimizer resizes on demand, so keep what it will produce small and
    // cached: only our own /images, a short list of widths, WebP only (AVIF
    // encoding is far heavier on CPU), and a month in cache.
    localPatterns: [{ pathname: "/images/**", search: "" }],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.artemisuav.com" }],
        destination: "https://artemisuav.com/:path*",
        statusCode: 301,
      },
      ...moved.map(([source, destination]) => ({ source, destination, statusCode: 301 as const })),
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Files in public/ keep their name when edited, so browsers would
      // otherwise re-check every image and video on each visit. Keep them a
      // month, and refresh in the background for a day after that.
      // Rename a file when you replace it so visitors get the new one at once.
      ...["/images/:path*", "/videos/:path*", "/:file*.pdf"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      })),
    ];
  },
};

export default nextConfig;
