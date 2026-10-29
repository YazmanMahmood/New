"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { process } from "@/data/home";

/*
  Four-step mission loop. A progress line fills as you scroll and
  each step lights up (and draws its icon) when the line reaches it.
*/

const ease = [0.16, 1, 0.3, 1] as const;

const icons: Record<(typeof process.steps)[number]["icon"], string[]> = {
  launch: ["M6 40h36", "M11 40v-7h26v7", "M24 28V8", "M17 15l7-7 7 7"],
  fly: ["M6 38c9-18 15 6 23-10s9-14 13-18", "M4 38a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M40 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0"],
  detect: ["M6 16V6h10", "M32 6h10v10", "M42 32v10H32", "M16 42H6V32", "M24 18v12", "M18 24h12"],
  report: ["M11 5h18l8 8v30H11z", "M29 5v8h8", "M17 28l5 5 9-10"],
};

export function HowItWorks() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [active, setActive] = useState(-1);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    setActive(v <= 0.01 ? -1 : Math.min(process.steps.length - 1, Math.floor(v * process.steps.length)));
  });

  return (
    <section className="tone-a relative overflow-hidden" aria-labelledby="process-title">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>{process.eyebrow}</Eyebrow>
            <h2
              id="process-title"
              className="wide mt-6 text-[clamp(2.4rem,4.8vw,4.25rem)] font-bold leading-[1] tracking-[-0.03em]"
            >
              {process.title}
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="text-lg leading-relaxed text-muted">{process.intro}</p>
          </Reveal>
        </div>

        <ol ref={ref} className="relative mt-16 grid gap-12 pl-8 md:mt-24 md:grid-cols-4 md:gap-8 md:pl-0">
          {/* Mobile: vertical track */}
          <span aria-hidden className="theme-fade absolute bottom-0 left-[4px] top-2 w-px bg-line md:hidden">
            <motion.span
              className="absolute inset-0 origin-top bg-accent"
              style={{ scaleY: reduce ? 1 : progress }}
            />
          </span>
          {/* Desktop: horizontal track */}
          <span aria-hidden className="theme-fade absolute inset-x-0 top-0 hidden h-px bg-line md:block">
            <motion.span
              className="absolute inset-0 origin-left bg-accent"
              style={{ scaleX: reduce ? 1 : progress }}
            />
          </span>

          {process.steps.map((step, i) => {
            const on = reduce || i <= active;
            return (
              <li key={step.title} className="relative md:pt-12">
                <span
                  aria-hidden
                  className={`absolute -left-8 top-[6px] h-[9px] w-[9px] rotate-45 border transition-colors duration-500 md:-top-[4px] md:left-0 ${
                    on ? "border-accent bg-accent" : "border-line bg-bg"
                  }`}
                />
                <div className="flex items-start justify-between gap-4">
                  <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    {icons[step.icon].map((d, n) => (
                      <g key={n}>
                        <path d={d} className="text-muted" opacity="0.35" />
                        <motion.path
                          d={d}
                          className="text-accent-text"
                          initial={false}
                          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                          transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : n * 0.08, ease }}
                        />
                      </g>
                    ))}
                  </svg>
                  <span className="narrow text-sm tabular-nums text-muted">0{i + 1}</span>
                </div>
                <h3
                  className={`wide mt-8 text-2xl font-bold tracking-tight transition-colors duration-500 ${
                    on ? "text-fg" : "text-muted"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs leading-relaxed text-muted">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
