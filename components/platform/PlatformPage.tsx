"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { layers, platform, platformStats } from "@/data/platform";
import { allProducts, fleetCode } from "@/data/products";

/*
  Platform: the four-layer stack as an exploded diagram. The slabs settle
  apart when it scrolls into view, then the layers step through on their own
  while it's on screen. Hovering pauses that; hovering or picking a layer lights
  its slab and opens its details. Below: the airframes it runs on and the
  headline numbers.
*/

const ease = [0.16, 1, 0.3, 1] as const;

// How long each layer stays open when the stack steps through on its own
const DWELL_MS = 2000;

// Isometric slab geometry (SVG units)
const CX = 160;
const HALF_W = 120;
const HALF_H = 48;
const DEPTH = 10;
const GAP = 74;
const TOP = 70;

/*
  Hover-to-pick that ignores scrolling. Scrolling slides rows under the
  cursor, and the hand on the mouse wobbles a pixel or two while it wheels,
  so plain hover would keep hijacking the open layer. Any scroll locks hover
  picking until the pointer travels a real distance from where it was.
*/
const UNLOCK_DISTANCE = 8;
const pointer = { x: NaN, y: NaN };
let scrollLock: { x: number; y: number } | null = null;

function useHoverPick() {
  useEffect(() => {
    const track = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const lock = () => {
      scrollLock = { x: pointer.x, y: pointer.y };
    };
    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("scroll", lock, { passive: true });
    return () => {
      window.removeEventListener("pointermove", track);
      window.removeEventListener("scroll", lock);
    };
  }, []);

  return (pick: () => void) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (scrollLock) {
      if (Math.hypot(e.clientX - scrollLock.x, e.clientY - scrollLock.y) < UNLOCK_DISTANCE) return;
      scrollLock = null;
    }
    pick();
  };
}

function Slab({
  y,
  active,
  onPick,
  onHover,
}: {
  y: number;
  active: boolean;
  onPick: () => void;
  onHover: (e: React.PointerEvent) => void;
}) {
  const top = `${CX},${y - HALF_H} ${CX + HALF_W},${y} ${CX},${y + HALF_H} ${CX - HALF_W},${y}`;
  const left = `${CX - HALF_W},${y} ${CX},${y + HALF_H} ${CX},${y + HALF_H + DEPTH} ${CX - HALF_W},${y + DEPTH}`;
  const right = `${CX},${y + HALF_H} ${CX + HALF_W},${y} ${CX + HALF_W},${y + DEPTH} ${CX},${y + HALF_H + DEPTH}`;
  return (
    <g onPointerMove={onHover} onClick={onPick} className="cursor-pointer">
      <polygon points={left} className={`theme-fade ${active ? "fill-accent/50" : "fill-fg/10"}`} />
      <polygon points={right} className={`theme-fade ${active ? "fill-accent/30" : "fill-fg/5"}`} />
      <polygon
        points={top}
        strokeWidth="1"
        className={`theme-fade ${active ? "fill-accent/15 stroke-accent" : "fill-bg stroke-line"}`}
      />
    </g>
  );
}

function StackDiagram({ activeId, onPick }: { activeId: string; onPick: (id: string) => void }) {
  const reduce = useReducedMotion();
  const hoverPick = useHoverPick();
  const height = TOP + GAP * (layers.length - 1) + HALF_H + DEPTH + 20;

  // Settle the slabs apart when the diagram scrolls into view, not on load,
  // so it still plays when the stack starts below the fold.
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const shown = inView || !!reduce;
  // After the entrance, hover lifts use a short transition with no stagger.
  const [settled, setSettled] = useState(false);

  return (
    <svg ref={ref} viewBox={`0 0 400 ${height}`} className="mx-auto w-full max-w-[30rem] overflow-visible" aria-hidden>
      {/* Bottom layer first so upper slabs sit on top */}
      {[...layers].reverse().map((layer) => {
        const i = layers.indexOf(layer);
        const y = TOP + i * GAP;
        const active = layer.id === activeId;
        const collapsed = (layers.length - 1) * GAP * 0.5 - i * GAP;
        return (
          <motion.g
            key={layer.id}
            initial={{ y: collapsed, opacity: 0 }}
            animate={shown ? { y: active ? -6 : 0, opacity: 1 } : { y: collapsed, opacity: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : settled
                  ? { duration: 0.35, ease }
                  : { duration: 0.9, delay: 0.15 + (layers.length - 1 - i) * 0.08, ease }
            }
            onAnimationComplete={() => shown && setSettled(true)}
          >
            <Slab
              y={y}
              active={active}
              onPick={() => onPick(layer.id)}
              onHover={hoverPick(() => onPick(layer.id))}
            />
            {/* Leader line and number */}
            <line
              x1={CX + HALF_W + 8}
              y1={y}
              x2={CX + HALF_W + 40}
              y2={y}
              strokeWidth="1"
              strokeDasharray="2 3"
              className={`theme-fade ${active ? "stroke-accent" : "stroke-line"}`}
            />
            <text
              x={CX + HALF_W + 48}
              y={y + 4}
              fontSize="13"
              className={`narrow theme-fade tabular-nums ${active ? "fill-accent" : "fill-muted"}`}
            >
              {layer.number}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

export function PlatformPage() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(layers[0].id);
  const hoverPick = useHoverPick();

  // Step to the next layer every few seconds while the stack is on screen.
  // Mouse over it or keyboard focus inside it pauses; any pick restarts the wait.
  const stackRef = useRef<HTMLDivElement>(null);
  const stackInView = useInView(stackRef, { amount: 0.25 });
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const autoplay = !reduce && stackInView && !hovering && !focused;

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => {
      const i = layers.findIndex((l) => l.id === activeId);
      setActiveId(layers[(i + 1) % layers.length].id);
    }, DWELL_MS);
    return () => window.clearTimeout(t);
  }, [autoplay, activeId]);

  const rise = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { duration: 0.8, delay: 0.1 + i * 0.1, ease },
  });

  return (
    <>
      <section className="tone-a relative overflow-hidden" aria-labelledby="platform-title">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32">
          {/* Heading */}
          <motion.div {...rise(0)} className="max-w-2xl">
            <p className="tag">{platform.eyebrow}</p>
            <h1 id="platform-title" className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
              {platform.title}
            </h1>
            <p className="mt-5 leading-relaxed text-muted">{platform.intro}</p>
          </motion.div>

          {/* The stack */}
          <div
            ref={stackRef}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
            className="theme-fade mt-12 grid grid-cols-1 items-center gap-10 border-t border-line pt-12 md:mt-16 lg:grid-cols-12 lg:gap-12"
          >
            <motion.div {...rise(1)} className="lg:col-span-6">
              <StackDiagram activeId={activeId} onPick={setActiveId} />
            </motion.div>

            <motion.div {...rise(2)} className="lg:col-span-6">
              <h2 className="wide text-2xl font-bold tracking-tight text-alarm md:text-3xl">The stack, top to bottom</h2>
              <ul className="mt-4">
                {layers.map((layer) => {
                  const open = layer.id === activeId;
                  return (
                    <li
                      key={layer.id}
                      className="theme-fade relative border-b border-line"
                      onPointerMove={hoverPick(() => setActiveId(layer.id))}
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`layer-${layer.id}`}
                        onClick={() => setActiveId(layer.id)}
                        className="flex w-full cursor-pointer items-baseline gap-4 py-4 text-left"
                      >
                        <span className={`narrow text-sm tabular-nums transition-colors ${open ? "text-accent-text" : "text-muted"}`}>
                          {layer.number}
                        </span>
                        <span className={`text-lg transition-colors ${open ? "text-fg" : "text-muted hover:text-fg"}`}>{layer.title}</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            id={`layer-${layer.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: reduce ? 0 : 0.35, ease }}
                            className="overflow-hidden"
                          >
                            <div className="pb-5 pl-9">
                              <p className="leading-relaxed text-muted">{layer.body}</p>
                              <ul className="mt-3 space-y-1.5 text-[15px]">
                                {layer.points.map((p) => (
                                  <li key={p} className="flex gap-3">
                                    <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" />
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Time until the next layer opens */}
                      {open && autoplay && (
                        <motion.span
                          key={activeId}
                          aria-hidden
                          className="absolute inset-x-0 -bottom-px h-px origin-left bg-accent"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: DWELL_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Where it runs */}
      <section className="tone-b relative" aria-labelledby="runs-on-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="narrow text-xs uppercase tracking-[0.16em] text-muted">In numbers</p>
            <dl className="mt-4">
              {[...platformStats, { value: String(allProducts.length), label: "platforms on one autonomy stack" }].map((s) => (
                <div key={s.label} className="theme-fade flex items-baseline gap-4 border-b border-line py-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="w-28 shrink-0 text-2xl font-medium tabular-nums text-accent-text">{s.value}</dd>
                  <dd className="text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 id="runs-on-title" className="narrow text-xs uppercase tracking-[0.16em] text-muted">
              Runs on every airframe
            </h2>
            <ul className="mt-4">
              {allProducts.map((p) => (
                <li key={p.slug} className="theme-fade border-b border-line">
                  <Link href={`/products/${p.slug}`} className="group flex items-baseline gap-4 py-4">
                    <span className="narrow text-sm tabular-nums text-muted">{fleetCode(p.slug)}</span>
                    <span className="text-lg transition-colors group-hover:text-accent-text">{p.name}</span>
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="ml-auto h-3.5 w-3.5 self-center text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-text"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M2 8h11M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-muted">
              Want to see the stack on your site?{" "}
              <Link href="/contact" className="font-medium text-accent-text underline-offset-4 hover:underline">
                Get in touch
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
