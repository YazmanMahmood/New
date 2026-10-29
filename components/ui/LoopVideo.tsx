"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type LoopVideoProps = {
  /** Sources in order of preference, e.g. WebM then MP4 */
  sources: { src: string; type: string }[];
  /** Still frame shown before the video plays, and instead of it with reduced motion */
  poster: string;
  className?: string;
  /** Start loading with the page (hero) instead of when scrolled near */
  eager?: boolean;
};

/**
 * Muted background loop. It only downloads and plays while on screen, pauses
 * when scrolled away, and stays on its poster for reduced-motion visitors.
 */
export function LoopVideo({ sources, poster, className = "", eager = false }: LoopVideoProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const near = useInView(ref, { margin: "200px 0px" });
  const playing = !reduce && near;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) {
      // Autoplay can still be refused (e.g. battery saver); the poster stays then
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playing]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager && !reduce ? "auto" : "none"}
      aria-hidden
      disablePictureInPicture
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
