import Script from "next/script";
import { gaId } from "@/lib/analytics";

/**
 * GA4 tag, loaded after the page is interactive and only in production builds.
 * Enhanced measurement counts client-side navigations as page views on its own.
 */
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !gaId) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  );
}
