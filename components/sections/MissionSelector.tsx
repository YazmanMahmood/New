"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMode } from "@/components/providers/ModeProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductRow } from "@/components/products/ProductRow";
import { missions, products } from "@/data/products";

const ease = [0.16, 1, 0.3, 1] as const;

export function MissionSelector() {
  const { mode, setMode } = useMode();
  const reduce = useReducedMotion();
  const active = mode === "none" ? null : missions.find((m) => m.id === mode)!;
  const list = active ? products[active.id] : [];
  const pendingScroll = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Scrolling back up past the selector (the section drops off the bottom of
  // the screen) returns the site to its default look. Only once the section has
  // been on screen, so a ?mode= link landing at the top keeps its theme.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || mode === "none") return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) seen = true;
      else if (seen && e.boundingClientRect.top > 0) setMode("none");
    });
    io.observe(el);
    return () => io.disconnect();
  }, [mode, setMode]);

  // Pick a mission, then glide down to its drones as soon as they render
  const choose = (id: typeof mode) => {
    pendingScroll.current = id !== "none";
    setMode(id);
  };
  const showcaseRef = (el: HTMLDivElement | null) => {
    if (!el || !pendingScroll.current) return;
    pendingScroll.current = false;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  return (
    <section ref={sectionRef} id="missions"className="tone-b relative scroll-mt-16" aria-labelledby="missions-title">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
        <Eyebrow>Missions</Eyebrow>
        <h2
          id="missions-title"
          className="wide mt-6 max-w-3xl text-[clamp(2.4rem,4.8vw,4.25rem)] font-bold leading-[1] tracking-[-0.03em]"
        >
          One stack, three missions. Which is yours?
        </h2>

        {/* Mission buttons */}
        <div className="mt-12 grid gap-4 md:grid-cols-3" role="group" aria-label="Choose a mission">
          {missions.map((m, i) => {
            const selected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                onClick={() => choose(selected ? "none" : m.id)}
                className={`theme-fade group relative flex cursor-pointer flex-col overflow-hidden border p-6 text-left transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-1 md:p-7 ${
                  selected
                    ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] shadow-[0_0_0_1px_var(--accent)]"
                    : "border-line bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] hover:border-fg hover:bg-[color-mix(in_srgb,var(--fg)_6%,transparent)]"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId={reduce ? undefined : "mission-indicator"}
                    className="absolute inset-x-0 top-0 h-[3px] bg-accent"
                    transition={{ duration: 0.5, ease }}
                  />
                )}
                <span className="narrow flex items-center justify-between text-sm tabular-nums text-muted">
                  0{i + 1}
                  <span
                    aria-hidden
                    className={`grid h-6 w-6 place-items-center rounded-full border transition-colors ${
                      selected ? "border-accent bg-accent text-accent-ink" : "border-line group-hover:border-fg"
                    }`}
                  >
                    {selected && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="xwide mt-8 block text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold leading-none tracking-[-0.03em] text-fg">
                  {m.name}
                </span>
                <span className="mt-3 block max-w-[32ch] text-[15px] leading-relaxed text-muted">{m.line}</span>
                <span
                  className={`mt-8 inline-flex items-center gap-2 text-sm font-medium ${
                    selected ? "text-accent-text" : "text-fg"
                  }`}
                >
                  {selected ? "Selected" : `Show ${m.name.toLowerCase()} drones`}
                  {!selected && (
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M2 8h11M9 4l4 4-4 4" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Every drone for the chosen mission */}
        <AnimatePresence mode="wait" initial={false}>
          {active && (
            <motion.div
              key={active.id}
              ref={showcaseRef}
              className="mt-16 scroll-mt-24 md:mt-20"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.6, ease }}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <h3 className="wide text-2xl font-bold leading-tight tracking-tight md:text-3xl">{active.headline}</h3>
                  <p className="mt-4 leading-relaxed text-muted">{active.body}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setMode("none")}
                    className="theme-fade group inline-flex h-12 cursor-pointer items-center gap-3 border border-line px-6 text-[15px] font-medium transition-colors hover:border-fg"
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3 3l10 10M13 3L3 13" />
                    </svg>
                    Clear mission
                  </button>
                </div>
              </div>

              <ul className="theme-fade mt-10 border-t border-line" aria-label={`${active.name} drones`}>
                {list.map((product, i) => (
                  <ProductRow key={product.name} product={product} index={i} />
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
