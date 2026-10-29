"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useAnimationFrame, useInView, useReducedMotion } from "framer-motion";
import { useMode } from "@/components/providers/ModeProvider";
import { CatalogueButton } from "@/components/products/CatalogueButton";
import { SpecIcon } from "@/components/products/SpecIcon";
import { ProductImage } from "@/components/products/ProductImage";
import { allProducts, fleetCode, missions, productsPage, type CatalogueProduct } from "@/data/products";

/*
  Fleet console: pick a drone from the roster and
  - the radar redraws its range to scale against every other platform,
    with a marker orbiting the ring at a pace set by its top speed,
  - the outer gauge fills to its flight time,
  - the readout decodes its name and specs,
  - the whole site re-themes to the drone's mission.
*/

const ease = [0.16, 1, 0.3, 1] as const;

// Radar geometry (SVG units). Range uses a square-root scale so 4 km and 250 km both read.
const C = 200;
const R_MAX = 160;
const KM_MAX = 250;
const GAUGE_R = 184;
const ENDURANCE_MAX = 150;
const rings = [5, 25, 100, 250];
const kmToR = (km: number) => R_MAX * Math.sqrt(Math.min(km, KM_MAX) / KM_MAX);

const roster = missions.map((m) => ({
  mission: m,
  items: allProducts.filter((p) => p.missions[0] === m.id),
}));
const ordered = roster.flatMap((g) => g.items);

/* ---------- Decoding text ---------- */

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>#";

function Decode({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (reduce) {
      setOut(text);
      return;
    }
    const frames = 16;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const settled = Math.floor((text.length * frame) / frames);
      setOut(
        text
          .split("")
          .map((c, i) => (i < settled || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (frame >= frames) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [text, reduce]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/* ---------- Radar ---------- */

function arcPath(r: number, from: number, to: number) {
  const x0 = C + r * Math.cos(from);
  const y0 = C + r * Math.sin(from);
  const x1 = C + r * Math.cos(to);
  const y1 = C + r * Math.sin(to);
  const large = to - from > Math.PI ? 1 : 0;
  return `M${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function Radar({ product }: { product: CatalogueProduct }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box);
  const ring = useRef<SVGCircleElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const gauge = useRef<SVGPathElement>(null);
  const sweep = useRef<SVGGElement>(null);
  const live = useRef({ r: 0, e: 0, angle: -Math.PI / 2, sweep: 0 });

  const range = product.stats?.range;
  const endurance = product.stats?.endurance;
  const speed = product.stats?.speed ?? 60;
  const targetR = range ? kmToR(range) : kmToR(1);
  const targetE = endurance ? Math.min(endurance / ENDURANCE_MAX, 0.999) : 0;

  useAnimationFrame((_, delta) => {
    if (!inView) return;
    const s = live.current;
    const k = reduce ? 1 : Math.min(1, delta / 220);
    s.r += (targetR - s.r) * k;
    s.e += (targetE - s.e) * k;
    if (!reduce) {
      // Faster drones lap their ring faster
      s.angle += (delta / 1000) * (0.35 + (speed / 230) * 1.4);
      s.sweep = (s.sweep + delta * 0.06) % 360;
    }

    ring.current?.setAttribute("r", String(s.r));
    dot.current?.setAttribute("cx", String(C + s.r * Math.cos(s.angle)));
    dot.current?.setAttribute("cy", String(C + s.r * Math.sin(s.angle)));
    trail.current?.setAttribute("d", arcPath(s.r, s.angle - 0.9, s.angle));
    gauge.current?.setAttribute("d", s.e > 0.002 ? arcPath(GAUGE_R, -Math.PI / 2, -Math.PI / 2 + s.e * Math.PI * 2) : "");
    sweep.current?.setAttribute("transform", `rotate(${s.sweep} ${C} ${C})`);
  });

  return (
    <div ref={box} className="relative mx-auto aspect-square w-full max-w-[34rem]">
      <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" role="img" aria-label={radarLabel(product)}>
        <defs>
          <linearGradient id="sweep-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Crosshair and scale rings */}
        <g className="theme-fade stroke-line" strokeWidth="1" fill="none">
          <line x1={C - R_MAX - 8} y1={C} x2={C + R_MAX + 8} y2={C} />
          <line x1={C} y1={C - R_MAX - 8} x2={C} y2={C + R_MAX + 8} />
          {rings.map((km) => (
            <circle key={km} cx={C} cy={C} r={kmToR(km)} strokeDasharray="2 4" />
          ))}
        </g>
        <g className="narrow fill-muted" fontSize="9">
          {rings.map((km) => (
            <text key={km} x={C + 5} y={C - kmToR(km) - 4}>
              {km} km
            </text>
          ))}
        </g>

        {/* Every other platform's reach, faint, for comparison */}
        <g className="theme-fade stroke-fg" strokeOpacity="0.14" strokeWidth="1" fill="none">
          {allProducts
            .filter((p) => p.slug !== product.slug && p.stats?.range)
            .map((p) => (
              <circle key={p.slug} cx={C} cy={C} r={kmToR(p.stats!.range!)} />
            ))}
        </g>

        {/* Sweep */}
        <g ref={sweep} className="text-accent">
          <path d={`M${C} ${C}L${C + R_MAX} ${C}A${R_MAX} ${R_MAX} 0 0 0 ${C + R_MAX * Math.cos(-0.5)} ${C + R_MAX * Math.sin(-0.5)}Z`} fill="url(#sweep-fade)" />
        </g>

        {/* Selected platform: reach ring, orbiting marker and trail */}
        <circle ref={ring} cx={C} cy={C} r={0} className="theme-fade fill-accent/10 stroke-accent" strokeWidth="1.5" />
        <path ref={trail} className="theme-fade stroke-accent" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
        <circle ref={dot} cx={C} cy={C} r="5" className="theme-fade fill-accent stroke-bg" strokeWidth="2" />

        {/* Flight-time gauge around the outside */}
        <circle cx={C} cy={C} r={GAUGE_R} className="theme-fade stroke-line" strokeWidth="3" fill="none" />
        <path ref={gauge} className="theme-fade stroke-accent" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Base */}
        <rect x={C - 5} y={C - 5} width="10" height="10" className="theme-fade fill-fg" transform={`rotate(45 ${C} ${C})`} />
        <text x={C + 10} y={C + 16} fontSize="9" className="narrow fill-muted">
          BASE
        </text>
      </svg>

      {/* Readouts pinned to the radar corners */}
      <div className="pointer-events-none absolute left-0 top-0 text-left">
        <p className="narrow text-xs text-muted">Reach</p>
        <p className="wide text-xl font-bold tabular-nums md:text-2xl">
          <Decode text={range ? `${range} km` : "Close range"} />
        </p>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 text-right">
        <p className="narrow text-xs text-muted">Aloft</p>
        <p className="wide text-xl font-bold tabular-nums md:text-2xl">
          <Decode text={endurance ? `${endurance} min` : "On request"} />
        </p>
      </div>
      <p className="narrow pointer-events-none absolute bottom-0 left-0 max-w-[12rem] text-[11px] leading-snug text-muted">
        Faint rings are the rest of the fleet. The marker laps faster on faster drones.
      </p>
    </div>
  );
}

function radarLabel(p: CatalogueProduct) {
  const parts = [`${p.name} reach`];
  if (p.stats?.range) parts.push(`${p.stats.range} km range`);
  if (p.stats?.endurance) parts.push(`${p.stats.endurance} minutes flight time`);
  return parts.join(", ");
}

/* ---------- Console ---------- */

export function FleetConsole() {
  const { setMode } = useMode();
  const reduce = useReducedMotion();
  const [slug, setSlug] = useState(ordered[0].slug);
  const product = ordered.find((p) => p.slug === slug)!;
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (p: CatalogueProduct, focus = false) => {
    setSlug(p.slug);
    setMode(p.missions[0]);
    if (focus) optionRefs.current[p.slug]?.focus();
  };

  // Arrow keys step through the roster
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = ordered.findIndex((p) => p.slug === slug);
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    select(ordered[(i + step + ordered.length) % ordered.length], true);
  };

  const missionNames = product.missions.map((id) => missions.find((m) => m.id === id)!.name);

  return (
    <section className="tone-a relative overflow-hidden" aria-labelledby="fleet-title">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 md:px-8 md:pb-20 md:pt-28">
        {/* Status bar */}
        <div className="theme-fade flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line pb-5">
          <div>
            <p className="tag">{productsPage.eyebrow}</p>
            <h1 id="fleet-title" className="xwide mt-2 text-[clamp(2.4rem,5vw,4.25rem)] font-bold leading-none tracking-[-0.04em]">
              {productsPage.title}
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="narrow flex items-center gap-2 text-sm text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-accent animate-[blink_1.6s_ease-in-out_infinite]" />
              </span>
              {allProducts.length} platforms on the roster
              <span className="hidden lg:inline">· use ↑ ↓ to switch</span>
            </p>
            <p className="max-w-md text-[15px] leading-relaxed text-muted md:text-right">{productsPage.intro}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Roster */}
          <nav aria-label="Fleet roster" className="min-w-0 lg:col-span-3">
            <div
              role="listbox"
              aria-label="Choose a platform"
              onKeyDown={onKey}
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:block lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {roster.map((group) => (
                <div key={group.mission.id} className="flex shrink-0 gap-2 lg:mb-6 lg:block">
                  <p className="narrow hidden pb-2 text-xs uppercase tracking-[0.18em] text-muted lg:block">
                    {group.mission.name}
                  </p>
                  {group.items.map((p) => {
                    const selected = p.slug === slug;
                    return (
                      <button
                        key={p.slug}
                        id={`fleet-${p.slug}`}
                        ref={(el) => {
                          optionRefs.current[p.slug] = el;
                        }}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => select(p)}
                        className={`theme-fade group relative flex shrink-0 cursor-pointer items-center gap-3 border px-3 py-2.5 text-left transition-colors lg:w-full lg:border-0 lg:border-l-2 lg:py-2 ${
                          selected
                            ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                            : "border-line hover:border-fg lg:border-transparent"
                        }`}
                      >
                        <span className={`narrow text-xs tabular-nums ${selected ? "text-accent-text" : "text-muted"}`}>
                          {fleetCode(p.slug)}
                        </span>
                        <span className={`whitespace-nowrap text-[15px] font-semibold ${selected ? "text-fg" : "text-muted group-hover:text-fg"}`}>
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>

          {/* Radar */}
          <div className="min-w-0 lg:col-span-5">
            <Radar product={product} />
          </div>

          {/* Readout */}
          <div className="min-w-0 lg:col-span-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={product.slug}
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8, transition: { duration: 0.12 } }}
                transition={{ duration: 0.45, ease }}
              >
                <p className="narrow text-sm text-accent-text">
                  {fleetCode(product.slug)} · {missionNames.join(" / ")}
                </p>
                <h2 className="wide mt-2 text-[clamp(1.8rem,3vw,2.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
                  <Decode text={product.name} />
                </h2>
                <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

                {product.specs.length > 0 && (
                  <dl className="theme-fade mt-6 grid grid-cols-2 gap-px border border-line bg-line">
                    {product.specs.slice(0, 6).map((s) => (
                      <div key={s.label} className="bg-bg p-3.5">
                        <dt className="narrow flex items-center gap-2 text-xs text-muted">
                          <SpecIcon label={s.label} className="h-4 w-4" />
                          {s.label}
                        </dt>
                        <dd className="mt-1.5 text-sm font-semibold leading-snug">
                          <Decode text={s.value} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="product-card theme-fade relative mt-6 overflow-hidden border border-line">
                  <ProductImage product={product} ratio="16/9" sizes="420px" />
                  <span className="reticle left-2 top-2 border-l-2 border-t-2" aria-hidden />
                  <span className="reticle right-2 top-2 border-r-2 border-t-2" aria-hidden />
                  <span className="reticle bottom-2 left-2 border-b-2 border-l-2" aria-hidden />
                  <span className="reticle bottom-2 right-2 border-b-2 border-r-2" aria-hidden />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/products/${product.slug}`}
                    className="theme-fade group inline-flex h-12 items-center gap-3 bg-accent px-6 text-[15px] font-medium text-accent-ink transition-[filter] hover:brightness-110"
                  >
                    Full spec sheet
                    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 8h11M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                  <CatalogueButton variant="ghost" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
