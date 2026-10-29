"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type Arc, type Marker } from "cobe";
import { useMode } from "@/components/providers/ModeProvider";

/*
  WebGL globe (cobe) centred on Pakistan.
  problem:  one site watched (red), a few problems pulsing red, the rest grey and unseen
  solution: every site green, with flight routes from the docks
*/

export type GlobeStage = "problem" | "solution";

type LatLng = [number, number];

const RED: [number, number, number] = [0.84, 0.15, 0.24];
const GREEN: [number, number, number] = [0.17, 0.71, 0.45];

const WATCHED: LatLng = [31.52, 74.35]; // Lahore
const DOCKS: LatLng[] = [WATCHED, [24.86, 67.0], [33.68, 73.04]]; // Lahore, Karachi, Islamabad

const CITIES: LatLng[] = [
  [31.42, 73.08], [30.2, 71.47], [30.18, 67.0], [34.0, 71.5], [25.4, 68.37], [27.7, 68.86],
  [25.12, 62.32], [32.16, 74.19], [29.4, 71.68], [28.42, 70.3], [26.25, 68.4], [24.75, 67.9],
  [32.08, 72.67], [35.92, 74.31], [26.0, 63.05], [33.6, 71.2],
];
// Problems that develop between visits
const ANOMALY_IDX = [1, 3, 4, 8, 10, 14];

// Integer hash so the extra sites are identical on every render
function hash(i: number, seed: number) {
  let h = Math.imul(i + 1, 2654435761) ^ Math.imul(seed + 1, 1597334677);
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}
const EXTRA: LatLng[] = Array.from({ length: 36 }, (_, i) => {
  const [lat, lng] = CITIES[i % CITIES.length];
  return [lat + (hash(i, 1) - 0.5) * 2.4, lng + (hash(i, 2) - 0.5) * 2.4];
});
const SITES = [...CITIES, ...EXTRA];

const nearestDock = (p: LatLng) =>
  DOCKS.reduce((best, d) => (Math.hypot(d[0] - p[0], d[1] - p[1]) < Math.hypot(best[0] - p[0], best[1] - p[1]) ? d : best));

const ROUTES: Arc[] = CITIES.map((c) => ({ from: nearestDock(c), to: c }));

// Camera angles that put Pakistan in the middle of the globe
const FOCUS_PHI = Math.PI - ((75 * Math.PI) / 180 - Math.PI / 2);
const FOCUS_THETA = 0.5;

function markersFor(stage: GlobeStage, t: number): Marker[] {
  if (stage === "solution") {
    return [
      ...SITES.map((location) => ({ location, size: 0.018, color: GREEN })),
      ...DOCKS.map((location) => ({ location, size: 0.04, color: GREEN })),
    ];
  }
  const pulse = 0.02 + 0.015 * (0.5 + 0.5 * Math.sin(t * 4));
  return [
    ...SITES.map((location, i) =>
      ANOMALY_IDX.includes(i)
        ? { location, size: pulse, color: RED }
        : { location, size: 0.014, color: [0.45, 0.45, 0.48] as [number, number, number] },
    ),
    { location: WATCHED, size: 0.05, color: RED },
  ];
}

export function SiteGlobe({ stage, className = "" }: { stage: GlobeStage; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef(stage);
  const { mode } = useMode();
  stageRef.current = stage;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const light = mode === "industrial";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = canvas.clientWidth;
    let raf = 0;
    let onScreen = true;
    let dragX: number | null = null;
    let dragOffset = 0;
    let spring = 0;
    const start = performance.now();

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi: FOCUS_PHI,
      theta: FOCUS_THETA,
      dark: light ? 0 : 1,
      diffuse: light ? 1.2 : 1.4,
      mapSamples: 16000,
      mapBrightness: light ? 4 : 5,
      mapBaseBrightness: 0,
      baseColor: light ? [1, 1, 1] : [0.22, 0.23, 0.25],
      markerColor: GREEN,
      glowColor: light ? [0.88, 0.94, 0.9] : [0.12, 0.13, 0.15],
      markers: markersFor(stageRef.current, 0),
      arcs: [],
      arcColor: GREEN,
      arcWidth: 0.5,
      arcHeight: 0.15,
      markerElevation: 0.01,
      scale: 1.15,
    });

    const frame = (now: number) => {
      const t = reduce ? 0 : Math.max(0, now - start) / 1000;
      spring += (dragOffset - spring) * 0.12;
      const solution = stageRef.current === "solution";
      globe.update({
        width: size * dpr,
        height: size * dpr,
        phi: FOCUS_PHI + Math.sin(t * 0.15) * 0.15 + spring,
        theta: FOCUS_THETA,
        markers: markersFor(stageRef.current, t),
        arcs: solution ? ROUTES : [],
      });
    };
    const loop = (now: number) => {
      frame(now);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      cancelAnimationFrame(raf);
      if (onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    };

    // Fade in once the first frame is drawn
    requestAnimationFrame(() => (canvas.style.opacity = "1"));
    play();

    const ro = new ResizeObserver(() => (size = canvas.clientWidth));
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      play();
    });
    io.observe(canvas);

    // Drag to spin; springs back toward the region when released
    const down = (e: PointerEvent) => {
      dragX = e.clientX - dragOffset * 200;
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (dragX !== null) dragOffset = (e.clientX - dragX) / 200;
    };
    const up = () => {
      dragX = null;
      dragOffset = 0;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    document.addEventListener("visibilitychange", play);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("visibilitychange", play);
      globe.destroy();
    };
  }, [mode]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`aspect-square w-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000 ${className}`}
    />
  );
}
