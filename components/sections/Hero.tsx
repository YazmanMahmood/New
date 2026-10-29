"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { DecodeText } from "@/components/ui/DecodeText";
import { hero } from "@/data/home";

// Experimental: the 3D swarm scene in place of the background video. Set to
// false to go back to the video.
const USE_3D_SCENE = true;

// Three.js loads in its own chunk after the page, so it doesn't slow first paint
const SwarmScene = dynamic(() => import("@/components/ui/SwarmScene"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

// Timeline (seconds after mount). The loading screen covers roughly the first second.
const T = { frame: 0.9, eyebrow: 1.0, title: 1.3, intro: 2.6, telemetry: 3.3, cue: 3.6 };

/** One HUD corner bracket, drawn in from its corner. */
function Corner({ className }: { className: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={`absolute h-4 w-4 border-accent md:h-5 md:w-5 ${className}`}
      initial={reduce ? false : { opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: T.frame, ease }}
    />
  );
}

/** Lahore time for the telemetry strip, filled in after mount so server and client markup match. */
function LahoreTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums text-fg">{time ?? "--:--:--"}</span>;
}

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const fadeIn = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section
      ref={ref}
      className="tone-a relative flex min-h-[100svh] flex-col overflow-hidden !bg-none"
      aria-labelledby="hero-title"
    >
      {/* Background: 3D swarm scene, or the video (both hold still for reduced-motion visitors) */}
      <motion.div aria-hidden className="absolute inset-0" style={reduce ? undefined : { y: bgY }}>
        {USE_3D_SCENE ? (
          <SwarmScene still={!!reduce} className="h-full w-full" />
        ) : (
          <LoopVideo
            eager
            sources={[
              { src: "/videos/hero.webm", type: "video/webm" },
              { src: "/videos/hero.mp4", type: "video/mp4" },
            ]}
            poster="/videos/hero-poster.webp"
            className="h-full w-full object-cover"
          />
        )}
      </motion.div>
      {/* Shade the top, the bottom and the left edge so the text reads over the scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--bg) 55%, transparent) 0%, transparent 20%), linear-gradient(to top, var(--bg) 2%, color-mix(in srgb, var(--bg) 40%, transparent) 24%, transparent 46%), linear-gradient(to right, color-mix(in srgb, var(--bg) 72%, transparent) 0%, color-mix(in srgb, var(--bg) 30%, transparent) 36%, transparent 58%)",
        }}
      />

      <motion.div
        className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-8 pt-32 md:px-8 md:pb-10 lg:justify-center"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        {/* HUD frame: corner brackets and a scan line that sweeps down once */}
        <div className="relative w-fit max-w-[40rem] px-4 py-6 sm:px-5 md:px-8 md:py-8 min-[1600px]:max-w-[56rem]">
          <Corner className="left-0 top-0 origin-top-left border-l-2 border-t-2" />
          <Corner className="right-0 top-0 origin-top-right border-r-2 border-t-2" />
          <Corner className="bottom-0 left-0 origin-bottom-left border-b-2 border-l-2" />
          <Corner className="bottom-0 right-0 origin-bottom-right border-b-2 border-r-2" />
          {!reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-px bg-accent shadow-[0_0_12px_2px_var(--accent)]"
              initial={{ top: "0%", opacity: 0 }}
              animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.6, delay: T.frame + 0.2, ease: "easeInOut" }}
            />
          )}

          <motion.p
            {...fadeIn(T.eyebrow - 0.1)}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-accent-text md:text-sm"
          >
            <span aria-hidden className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inset-0 bg-accent animate-[blink_1.6s_ease-in-out_infinite]" />
            </span>
            <span aria-hidden className="text-muted">[SYS]</span>
            <DecodeText text={hero.eyebrow} delay={T.eyebrow} step={0.035} scramble={0.25} />
          </motion.p>

          <h1
            id="hero-title"
            className="wide mt-5 text-[clamp(1.35rem,6.6vw,1.8rem)] font-bold uppercase leading-[1.04] tracking-[-0.02em] md:text-[clamp(1.8rem,3.3vw,4.25rem)]"
          >
            <DecodeText text={hero.title} delay={T.title} step={0.026} scramble={0.4} cursor />
          </h1>

          <p className="mt-6 max-w-xl font-mono text-[15px] leading-relaxed text-muted md:text-base min-[1600px]:max-w-2xl min-[1600px]:text-lg">
            <span aria-hidden className="text-accent-text">&gt; </span>
            <DecodeText text={hero.intro} delay={T.intro} step={0.008} scramble={0.15} />
          </p>
        </div>

        {/* Telemetry strip */}
        <motion.dl
          {...fadeIn(T.telemetry)}
          className="mt-6 flex flex-wrap gap-x-8 gap-y-2 px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted md:px-8 md:text-xs"
        >
          <div className="flex gap-2">
            <dt>Status</dt>
            <dd className="flex items-center gap-1.5 text-fg">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#2bb673] animate-[blink_1.6s_ease-in-out_infinite]" />
              Online
            </dd>
          </div>
          <div className="flex gap-2">
            <dt>Base</dt>
            <dd className="text-fg">31.52°N 74.36°E</dd>
          </div>
          <div className="flex gap-2">
            <dt>PKT</dt>
            <dd>
              <LahoreTime />
            </dd>
          </div>
        </motion.dl>

        {/* Scroll cue */}
        <motion.div {...fadeIn(T.cue)} className="mt-10 px-5 md:mt-12 md:px-8">
          <a href="#problem" className="group inline-flex items-center gap-4 text-fg transition-colors hover:text-accent-text">
            <span className="theme-fade grid h-11 w-11 place-items-center border border-line transition-colors group-hover:border-accent">
              <motion.svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                animate={reduce ? undefined : { y: [-3, 3, -3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M8 2v11M4 9l4 4 4-4" />
              </motion.svg>
            </span>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.24em] md:text-sm">Why autonomy?</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
