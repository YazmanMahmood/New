"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>[]_";

type DecodeTextProps = {
  text: string;
  /** Seconds before the first character starts decoding */
  delay?: number;
  /** Seconds between one character locking in and the next */
  step?: number;
  /** Seconds each character flickers through random glyphs before it locks in */
  scramble?: number;
  /** Wait until scrolled into view before starting (for headings further down a page) */
  onView?: boolean;
  /** Blinking block cursor after the text */
  cursor?: boolean;
  className?: string;
};

/**
 * Text that "decodes" like a machine readout: each character flickers through
 * random glyphs, then locks in, left to right. Every character keeps its slot
 * from the first render, so lines never reflow while it runs. The full text is
 * always in the DOM for screen readers and search engines; reduced-motion
 * visitors get it straight away.
 */
export function DecodeText({ text, delay = 0, step = 0.03, scramble = 0.35, onView = false, cursor = false, className = "" }: DecodeTextProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const go = !onView || seen;
  // Seconds since decoding was scheduled; -1 until mounted, so server and client markup match
  const [elapsed, setElapsed] = useState(-1);

  useEffect(() => {
    if (reduce) {
      setElapsed(Infinity);
      return;
    }
    if (!go) return;
    const total = delay + text.length * step + scramble;
    const begin = performance.now();
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const t = (now - begin) / 1000;
      // ~30 updates a second is plenty for the flicker
      if (now - last > 33 || t >= total) {
        last = now;
        setElapsed(t);
      }
      if (t < total) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, delay, step, scramble, reduce, go]);

  const done = elapsed >= delay + text.length * step + scramble;
  let index = 0;

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((word, w, words) => (
          <span key={w}>
            <span className="inline-block whitespace-nowrap">
              {[...word].map((ch) => {
                const i = index++;
                const lockAt = delay + i * step + scramble;
                if (elapsed >= lockAt) return <span key={i}>{ch}</span>;
                if (elapsed >= lockAt - scramble) {
                  const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                  return (
                    <span key={i} className="text-accent-text opacity-80">
                      {glyph}
                    </span>
                  );
                }
                return (
                  <span key={i} className="opacity-0">
                    {ch}
                  </span>
                );
              })}
            </span>
            {w < words.length - 1 && (index++, " ")}
          </span>
        ))}
        {cursor && (
          <span
            className={`ml-[0.12em] inline-block h-[0.82em] w-[0.42em] translate-y-[0.08em] bg-accent ${
              done ? "animate-[cursor_1.1s_steps(1,end)_infinite]" : ""
            } ${elapsed < 0 ? "opacity-0" : ""}`}
          />
        )}
      </span>
    </span>
  );
}
