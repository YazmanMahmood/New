import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";
import { ModeProvider } from "@/components/providers/ModeProvider";
import { ModeUrlSync } from "@/components/providers/ModeUrlSync";
import { Navbar } from "@/components/layout/Navbar";
import { Splash } from "@/components/layout/Splash";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/layout/GoogleAnalytics";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";
import { siteName, siteUrl } from "@/lib/site";

// Defaults for every page. Pages set their own title, description, canonical
// and Open Graph tags with pageMetadata() from lib/site.ts.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Autonomous drones for critical infrastructure`,
    template: `%s | ${siteName}`,
  },
  description:
    "Artemis UAV builds AI-native autonomous drones for industrial inspection, security and defense. Drone-in-a-box, long-range VTOL, AI interceptors and swarms.",
  applicationName: siteName,
  keywords: [
    "drone companies in Pakistan",
    "drone manufacturers in Pakistan",
    "drone AI companies in Pakistan",
    "پاکستان میں ڈرون کمپنیز",
    "پاکستان میں ڈرون بنانے والی کمپنیاں",
  ],
  openGraph: {
    siteName,
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  // Search Console: set GOOGLE_SITE_VERIFICATION to the token from the
  // "HTML tag" method (the content="..." value) and rebuild.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="none" suppressHydrationWarning>
      <body>
        <JsonLd data={organizationSchema} />
        <ModeProvider>
          <Suspense fallback={null}>
            <ModeUrlSync />
          </Suspense>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
          >
            Skip to content
          </a>
          <Splash />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </ModeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
