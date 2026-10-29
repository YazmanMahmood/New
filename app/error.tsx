"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { contact } from "@/data/home";

/*
  Shown in place of a page that crashed while rendering, so visitors keep the
  navbar and footer and can retry instead of seeing a blank screen.
*/
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="tone-a relative min-h-[80vh]" aria-labelledby="error-title">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-8 md:pb-28 md:pt-36">
        <p className="tag">Something went wrong</p>
        <h1 id="error-title" className="wide mt-3 text-[clamp(2.2rem,4.4vw,3.75rem)] font-bold leading-[1] tracking-[-0.03em]">
          Lost the signal.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          This page hit a problem loading. Try again, or email {contact.email} if it keeps happening.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="theme-fade inline-flex h-12 cursor-pointer items-center gap-3 bg-accent px-6 text-[15px] font-medium text-accent-ink transition-[filter] hover:brightness-110"
          >
            Try again
          </button>
          <ButtonLink href="/" variant="ghost">
            Back to the homepage
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
