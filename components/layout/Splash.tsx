"use client";

import { useEffect, useState } from "react";
import { logoMask } from "@/components/ui/LogoMark";

// Show for at least this long after navigation starts, so the logo animation reads
const MIN_MS = 1000;
// Never hold the page longer than this, even if some asset is slow
const MAX_MS = 4000;

/*
  Loading screen on a full page load: the eagle with a light sweeping across
  it and a running bar. It is in the server HTML, so it covers the first paint,
  and fades out once the page has loaded. Client-side navigation doesn't
  remount the layout, so it only shows on full loads. If JavaScript never
  runs, a CSS fallback in globals.css hides it after a few seconds.
*/
export function Splash() {
  const [state, setState] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    let leaveTimer: number | undefined;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      leaveTimer = window.setTimeout(() => setState("leaving"), Math.max(0, MIN_MS - performance.now()));
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const cap = window.setTimeout(finish, MAX_MS);
    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(cap);
    };
  }, []);

  // Remove it once the fade has had time to finish
  useEffect(() => {
    if (state !== "leaving") return;
    const t = window.setTimeout(() => setState("gone"), 700);
    return () => window.clearTimeout(t);
  }, [state]);

  if (state === "gone") return null;

  return (
    <div className={`splash ${state === "leaving" ? "splash-leaving" : ""}`} role="status" aria-label="Loading Artemis UAV">
      <div className="flex flex-col items-center gap-6">
        <span aria-hidden className="splash-logo" style={logoMask} />
        <span aria-hidden className="splash-bar" />
      </div>
    </div>
  );
}
