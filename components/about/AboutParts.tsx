"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { milestones, principles } from "@/data/about";

const ease = [0.16, 1, 0.3, 1] as const;

/** Monospace system label, e.g. "[03] Operational history". */
export function SysLabel({ index, children }: { index: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-accent-text md:text-sm"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, ease }}
    >
      <span aria-hidden className="h-2 w-2 shrink-0 bg-accent animate-[blink_1.6s_ease-in-out_infinite]" />
      <span aria-hidden className="text-muted">[{index}]</span>
      {children}
    </motion.p>
  );
}

/** Mission, vision and values as HUD panels: corners snap in, a bar draws across, text rises. */
export function PrincipleCards() {
  const reduce = useReducedMotion();
  return (
    <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
      {principles.items.map((item, i) => (
        <motion.article
          key={item.title}
          className="theme-fade group relative border border-line bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-fg md:p-8"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.8, delay: i * 0.12, ease }}
        >
          {/* Corner brackets */}
          {["left-[-1px] top-[-1px] border-l-2 border-t-2", "right-[-1px] top-[-1px] border-r-2 border-t-2", "bottom-[-1px] left-[-1px] border-b-2 border-l-2", "bottom-[-1px] right-[-1px] border-b-2 border-r-2"].map((pos) => (
            <motion.span
              key={pos}
              aria-hidden
              className={`absolute h-3 w-3 border-accent ${pos}`}
              initial={reduce ? false : { opacity: 0, scale: 0.2 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.12, ease }}
            />
          ))}
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span>{String(i + 1).padStart(2, "0")}</span>
            <span className="text-accent-text">{item.code}</span>
          </div>
          {/* Accent bar draws across */}
          <motion.span
            aria-hidden
            className="mt-6 block h-[2px] origin-left bg-accent"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4 + i * 0.12, ease }}
          />
          <h3 className="wide mt-6 text-2xl font-bold uppercase tracking-tight md:text-3xl">{item.title}</h3>
          <p className="mt-4 leading-relaxed text-muted">{item.body}</p>
        </motion.article>
      ))}
    </div>
  );
}

/** Timeline whose line fills as you scroll; each milestone's node lights up as it comes into view. */
export function Timeline() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    // Clip sideways: entries slide in from the right and would otherwise widen the page on phones
    <ol ref={ref} className="relative overflow-x-clip">
      {/* Track, and the accent fill that follows the scroll */}
      <span aria-hidden className="theme-fade absolute bottom-3 left-[11px] top-3 w-px bg-line" />
      <motion.span
        aria-hidden
        className="absolute bottom-3 left-[11px] top-3 w-px origin-top bg-accent shadow-[0_0_8px_var(--accent)]"
        style={{ scaleY: reduce ? 1 : fill }}
      />
      {milestones.items.map((m, i) => (
        <li key={m.title} className="relative grid grid-cols-[24px_1fr] gap-6 pb-12 last:pb-0 md:gap-10 md:pb-16">
          {/* Node */}
          <motion.span
            aria-hidden
            className="relative mt-1.5 grid h-6 w-6 place-items-center border bg-bg"
            initial={reduce ? false : { borderColor: "var(--line)", scale: 0.7 }}
            whileInView={{ borderColor: "var(--accent)", scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -45% 0px" }}
            transition={{ duration: 0.5, ease }}
          >
            <motion.span
              className="h-2 w-2 bg-accent"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "0px 0px -45% 0px" }}
              transition={{ duration: 0.3, delay: 0.2 }}
            />
          </motion.span>

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -20% 0px" }}
            transition={{ duration: 0.8, ease }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text md:text-sm">
              {m.date}
              <span className="text-muted"> // {String(i + 1).padStart(2, "0")}</span>
            </p>
            <h3 className="wide mt-3 text-2xl font-bold uppercase tracking-tight md:text-3xl">{m.title}</h3>
            <p className="mt-3 max-w-lg leading-relaxed text-muted">{m.body}</p>
          </motion.div>
        </li>
      ))}
    </ol>
  );
}
