import { firebaseConfig } from "@/lib/firebase";

/**
 * Google Analytics 4 measurement ID. Set NEXT_PUBLIC_GA_ID to use another
 * property; by default it's the GA4 stream already created for the Firebase project.
 */
export const gaId = process.env.NEXT_PUBLIC_GA_ID || firebaseConfig.measurementId;

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/** Sends a GA4 event. Does nothing if analytics hasn't loaded (dev, blocked by the visitor). */
export function track(name: string, params?: Record<string, unknown>) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", name, params);
}
