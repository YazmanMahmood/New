"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { allProducts, fleetCode, jobs, type CatalogueProduct } from "@/data/products";

const ease = [0.16, 1, 0.3, 1] as const;

// Slider position 0–100 maps to 1–250 km on a log scale
const toKm = (v: number) => Math.max(1, Math.round(250 ** (v / 100)));
const toSlider = (km: number) => Math.round((Math.log(km) / Math.log(250)) * 100);

type Reason = { ok: boolean; text: string };

/** Job fit is worth 60, reach 30, payload 10. */
function score(p: CatalogueProduct, jobId: string, km: number, needsPayload: boolean) {
  const job = jobs.find((j) => j.id === jobId)!;
  const reasons: Reason[] = [];
  let total = 0;

  const rank = job.slugs.indexOf(p.slug);
  const jobPts = rank === 0 ? 60 : rank === 1 ? 45 : rank === 2 ? 35 : 0;
  total += jobPts;
  reasons.push(
    jobPts > 0
      ? { ok: true, text: `Built for ${job.label.toLowerCase()}` }
      : { ok: false, text: `Not built for ${job.label.toLowerCase()}` },
  );

  const range = p.stats?.range;
  if (range && range >= km) {
    total += 30;
    reasons.push({ ok: true, text: `Reaches ${range} km, you need ${km} km` });
  } else {
    total += range ? Math.round((30 * range) / km) : 3;
    reasons.push({ ok: false, text: range ? `Reaches ${range} of the ${km} km you need` : "Range shared on request" });
  }

  const payload = p.stats?.payload;
  if (!needsPayload) total += 10;
  else if (payload) {
    total += 10;
    reasons.push({ ok: true, text: `Carries up to ${payload} kg` });
  } else reasons.push({ ok: false, text: "Payload capacity shared on request" });

  return { product: p, total, reasons };
}

function Mark({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? "text-accent-text" : "text-muted"}`} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      {ok ? <path d="M3 8.5l3 3 7-7" /> : <path d="M4 4l8 8M12 4l-8 8" />}
    </svg>
  );
}

/** Three quick inputs, one recommended platform with its reasons. */
export function MissionMatcher() {
  const reduce = useReducedMotion();
  const [jobId, setJobId] = useState(jobs[0].id);
  const [slider, setSlider] = useState(toSlider(60));
  const [needsPayload, setNeedsPayload] = useState(false);
  const km = toKm(slider);

  const results = allProducts
    .map((p) => score(p, jobId, km, needsPayload))
    .sort((a, b) => b.total - a.total);
  const [best, ...rest] = results;
  // Prefer runners-up that suit the job, then fill with the next best scores
  const fits = rest.filter((r) => r.reasons[0].ok);
  const runnersUp = [...fits, ...rest.filter((r) => !r.reasons[0].ok)].slice(0, 2);

  return (
    <section className="tone-b relative" aria-labelledby="matcher-title">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <Reveal className="max-w-3xl">
          <Eyebrow>Mission matcher</Eyebrow>
          <h2 id="matcher-title" className="wide mt-5 text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
            Tell us the job. We&apos;ll pick the drone.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 md:mt-12 lg:grid-cols-12 lg:gap-12">
          {/* Inputs */}
          <div className="space-y-10 lg:col-span-6">
            <fieldset>
              <legend className="wide text-lg font-bold tracking-tight">1. What needs watching?</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {jobs.map((j) => {
                  const selected = j.id === jobId;
                  return (
                    <button
                      key={j.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setJobId(j.id)}
                      className={`theme-fade h-11 cursor-pointer border px-4 text-[15px] font-medium transition-colors ${
                        selected ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-fg"
                      }`}
                    >
                      {j.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="matcher-range" className="wide flex items-baseline justify-between gap-4 text-lg font-bold tracking-tight">
                2. How far from base?
                <span className="xwide text-2xl tabular-nums text-accent-text">{km} km</span>
              </label>
              <input
                id="matcher-range"
                type="range"
                min={0}
                max={100}
                value={slider}
                onChange={(e) => setSlider(Number(e.target.value))}
                aria-valuetext={`${km} kilometres`}
                className="mt-5 w-full cursor-pointer accent-[var(--accent)]"
              />
              <div className="narrow mt-2 flex justify-between text-xs text-muted">
                <span>1 km</span>
                <span>15 km</span>
                <span>250 km</span>
              </div>
            </div>

            <div>
              <p className="wide text-lg font-bold tracking-tight" id="payload-label">
                3. Does it need to carry a payload?
              </p>
              <button
                type="button"
                role="switch"
                aria-checked={needsPayload}
                aria-labelledby="payload-label"
                onClick={() => setNeedsPayload((v) => !v)}
                className="mt-4 inline-flex cursor-pointer items-center gap-3"
              >
                <span className={`theme-fade relative h-7 w-12 rounded-full border transition-colors ${needsPayload ? "border-accent bg-accent" : "border-line"}`}>
                  <motion.span
                    className={`absolute top-1 h-[18px] w-[18px] rounded-full ${needsPayload ? "bg-accent-ink" : "bg-muted"}`}
                    animate={{ left: needsPayload ? 24 : 4 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease }}
                  />
                </span>
                <span className="text-[15px] font-medium">{needsPayload ? "Yes" : "No"}</span>
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-6">
            <p className="sr-only" aria-live="polite">
              Best match: {best.product.name}, {best.total} percent.
            </p>
            <div className="theme-fade border border-line bg-bg p-6 md:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={best.product.slug}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.4, ease }}
                >
                  <p className="narrow text-sm text-muted">
                    Best match · <span className="text-accent-text">{fleetCode(best.product.slug)}</span>
                  </p>
                  <h3 className="wide mt-2 text-[clamp(1.8rem,3vw,2.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
                    {best.product.name}
                  </h3>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex items-center gap-4">
                <div className="theme-fade relative h-2.5 flex-1 bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-r-[4px] bg-accent"
                    animate={{ width: `${best.total}%` }}
                    transition={{ duration: reduce ? 0 : 0.6, ease }}
                  />
                </div>
                <span className="xwide w-20 text-right text-2xl font-bold tabular-nums">{best.total}%</span>
              </div>
              <p className="narrow mt-1 text-xs text-muted">match</p>

              <ul className="mt-6 space-y-2.5">
                {best.reasons.map((r) => (
                  <li key={r.text} className="flex gap-2.5 text-[15px] leading-snug">
                    <Mark ok={r.ok} />
                    <span className={r.ok ? "" : "text-muted"}>{r.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/products/${best.product.slug}`}
                className="theme-fade group mt-8 inline-flex h-12 items-center gap-3 bg-accent px-6 text-[15px] font-medium text-accent-ink transition-[filter] hover:brightness-110"
              >
                See {best.product.name}
                <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </Link>

              <div className="theme-fade mt-8 border-t border-line pt-5">
                <p className="narrow text-xs text-muted">Also consider</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {runnersUp.map((r) => (
                    <li key={r.product.slug}>
                      <Link
                        href={`/products/${r.product.slug}`}
                        className="theme-fade flex items-center justify-between gap-3 border border-line px-4 py-3 text-[15px] font-semibold transition-colors hover:border-fg"
                      >
                        {r.product.name}
                        <span className="narrow text-sm tabular-nums text-muted">{r.total}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
