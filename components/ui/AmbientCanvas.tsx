"use client";

import { useEffect, useRef } from "react";

/*
  Animated canvas backgrounds, drawn in the current mission mode's colours.
  - "hero":  flying over a perspective ground grid, with drone tracks in the sky,
             a scan line sweeping the ground and ground pings.
  - "radar": a rotating radar sweep with contacts that light up as it passes.
  Pauses when off screen or in a background tab; draws one still frame for
  people who prefer reduced motion.
*/

type Variant = "hero" | "radar";
type RGB = [number, number, number];

const TAU = Math.PI * 2;

// Each drone keeps to its own horizontal band so labels never collide
const DRONES = [
  { id: "AR-01", cx: 0.15, cy: 0.17, ax: 0.1, ay: 0.035, fx: 0.23, fy: 0.37, p: 0 },
  { id: "AR-02", cx: 0.5, cy: 0.18, ax: 0.13, ay: 0.03, fx: 0.13, fy: 0.23, p: 4.2 },
  { id: "AR-03", cx: 0.74, cy: 0.12, ax: 0.09, ay: 0.03, fx: 0.17, fy: 0.29, p: 2.1 },
  { id: "AR-04", cx: 0.9, cy: 0.19, ax: 0.04, ay: 0.04, fx: 0.29, fy: 0.19, p: 1.3 },
];

// Fixed pseudo-random values so the layout is stable between renders
const DUST = Array.from({ length: 70 }, (_, i) => ({
  x: (Math.sin(i * 91.7) * 0.5 + 0.5) % 1,
  y: (Math.cos(i * 47.3) * 0.5 + 0.5) % 1,
  s: 0.004 + ((i * 37) % 11) / 1100,
  tw: (i * 13) % 7,
}));

const CONTACTS = Array.from({ length: 16 }, (_, i) => ({
  a: (i * 2.399) % TAU,
  r: 0.22 + (((i * 53) % 71) / 71) * 0.72,
}));

export function AmbientCanvas({ variant = "hero", className = "" }: { variant?: Variant; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let onScreen = true;
    let fg: RGB = [255, 255, 255];
    let accent: RGB = [215, 38, 61];
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const start = performance.now();

    const parse = (color: string): RGB => {
      ctx.fillStyle = "#000";
      ctx.fillStyle = color;
      const v = ctx.fillStyle as string;
      if (v.startsWith("#")) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)) as RGB;
      const m = v.match(/[\d.]+/g);
      return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [255, 255, 255];
    };
    const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      fg = parse(cs.getPropertyValue("--fg").trim() || "#fff");
      accent = parse(cs.getPropertyValue("--accent").trim() || "#d7263d");
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // ---------- hero ----------
    const dronePos = (d: (typeof DRONES)[number], t: number) => [
      (d.cx + d.ax * Math.sin(t * d.fx + d.p)) * w,
      (d.cy + d.ay * Math.sin(t * d.fy + d.p * 1.7)) * h * (w < 768 ? 0.62 : 1),
    ];

    const drawHero = (t: number) => {
      const horizon = h * 0.58 + py * 14;
      const vx = w * 0.5 + px * 70;
      const focal = (h - horizon) * 1.15;
      const zFar = 32;

      // Horizon glow
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.5);
      const glow = ctx.createRadialGradient(vx, horizon, 0, vx, horizon, Math.max(w, h) * 0.6);
      glow.addColorStop(0, rgba(accent, 0.2 * breathe));
      glow.addColorStop(0.45, rgba(accent, 0.05 * breathe));
      glow.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Dust
      for (const d of DUST) {
        const x = (((d.x + t * d.s) % 1) + 1) % 1;
        const y = d.y * horizon * 0.95;
        ctx.fillStyle = rgba(fg, 0.1 + 0.18 * (0.5 + 0.5 * Math.sin(t * 0.8 + d.tw)));
        ctx.fillRect(x * w, y, 1.2, 1.2);
      }

      // Ground: horizontal lines moving toward the viewer
      ctx.lineWidth = 1;
      const offset = (t * 0.55) % 1;
      for (let k = 1; k <= zFar; k++) {
        const z = k - offset;
        if (z <= 0.35) continue;
        const y = horizon + focal / z;
        if (y > h + 2) continue;
        ctx.strokeStyle = rgba(fg, 0.2 * Math.min(1, 2.5 / z) * (1 - z / zFar));
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Ground: lines converging on the vanishing point
      const vGrad = ctx.createLinearGradient(0, horizon, 0, h);
      vGrad.addColorStop(0, rgba(fg, 0));
      vGrad.addColorStop(1, rgba(fg, 0.16));
      ctx.strokeStyle = vGrad;
      ctx.beginPath();
      const spacing = 0.3;
      const nz = 0.35;
      for (let x = -16; x <= 16; x++) {
        ctx.moveTo(vx + (x * spacing * focal) / zFar, horizon + focal / zFar);
        ctx.lineTo(vx + (x * spacing * focal) / nz, horizon + focal / nz);
      }
      ctx.stroke();

      // Horizon line
      const hGrad = ctx.createLinearGradient(0, 0, w, 0);
      hGrad.addColorStop(0, rgba(accent, 0));
      hGrad.addColorStop(0.5, rgba(accent, 0.45));
      hGrad.addColorStop(1, rgba(accent, 0));
      ctx.strokeStyle = hGrad;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(w, horizon);
      ctx.stroke();

      // Scan line sweeping the ground
      const sp = (t % 7) / 7;
      const sz = zFar * Math.pow(1 - sp, 2) + 0.4;
      const sy = horizon + focal / sz;
      if (sy < h) {
        ctx.strokeStyle = rgba(accent, 0.55 * Math.sin(sp * Math.PI));
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(w, sy);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      // Ground pings
      for (let i = 0; i < 2; i++) {
        const pp = ((t + i * 2.5) % 5) / 5;
        const gx = vx + (i === 0 ? -1 : 1) * w * 0.18;
        const gy = horizon + focal / (i === 0 ? 5 : 3.2);
        const rx = pp * w * 0.22;
        ctx.strokeStyle = rgba(accent, (1 - pp) * 0.4);
        ctx.beginPath();
        ctx.ellipse(gx, gy, rx, rx * 0.2, 0, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = rgba(accent, 0.7);
        ctx.fillRect(gx - 1.5, gy - 1.5, 3, 3);
      }

      // Drone tracks
      const showLabels = w >= 768;
      ctx.font = "500 10px 'Archivo Variable', ui-sans-serif, system-ui, sans-serif";
      for (const d of DRONES) {
        const samples = 42;
        let [lx, ly] = dronePos(d, t - samples * 0.07);
        for (let s = samples - 1; s >= 0; s--) {
          const [x, y] = dronePos(d, t - s * 0.07);
          ctx.strokeStyle = rgba(fg, 0.35 * (1 - s / samples));
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(x, y);
          ctx.stroke();
          lx = x;
          ly = y;
        }
        const [x, y] = dronePos(d, t);
        const [bx, by] = dronePos(d, t - 0.05);
        const heading = Math.atan2(y - by, x - bx);

        ctx.strokeStyle = rgba(fg, 0.25);
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, TAU);
        ctx.stroke();

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);
        ctx.fillStyle = rgba(accent, 1);
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-3.5, 3.5);
        ctx.lineTo(-1.5, 0);
        ctx.lineTo(-3.5, -3.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (showLabels) {
          const alt = 120 + Math.round(18 * Math.sin(t * 0.3 + d.p));
          ctx.fillStyle = rgba(fg, 0.5);
          ctx.fillText(`${d.id}  ${alt} M`, x + 15, y + 3.5);
        }
      }
    };

    // ---------- radar ----------
    const drawRadar = (t: number) => {
      const wide = w >= 1024;
      const cx = (wide ? w * 0.74 : w * 0.5) + px * 20;
      const cy = (wide ? h * 0.5 : h * 0.86) + py * 20;
      const R = wide ? Math.min(h * 0.62, w * 0.36) : Math.max(w * 0.7, 260);
      const angle = (t * 0.7) % TAU;

      // Rings and cross
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.strokeStyle = rgba(fg, i === 5 ? 0.16 : 0.07);
        ctx.beginPath();
        ctx.arc(cx, cy, (R * i) / 5, 0, TAU);
        ctx.stroke();
      }
      ctx.strokeStyle = rgba(fg, 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();

      // Bearing ticks
      ctx.strokeStyle = rgba(fg, 0.2);
      ctx.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * TAU;
        const len = i % 6 === 0 ? 10 : 4;
        ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.lineTo(cx + Math.cos(a) * (R + len), cy + Math.sin(a) * (R + len));
      }
      ctx.stroke();

      // Sweep: a fading wedge trailing the leading edge
      const wedge = 0.9;
      if ("createConicGradient" in ctx) {
        const g = ctx.createConicGradient(angle - wedge, cx, cy);
        g.addColorStop(0, rgba(accent, 0));
        g.addColorStop(wedge / TAU, rgba(accent, 0.28));
        g.addColorStop(wedge / TAU + 0.0001, rgba(accent, 0));
        g.addColorStop(1, rgba(accent, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = rgba(accent, 0.75);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
      ctx.stroke();

      // Contacts light up as the sweep passes, then fade
      for (const c of CONTACTS) {
        const since = (((angle - c.a) % TAU) + TAU) % TAU;
        const life = Math.max(0, 1 - since / (TAU * 0.7));
        const x = cx + Math.cos(c.a) * c.r * R;
        const y = cy + Math.sin(c.a) * c.r * R;
        ctx.fillStyle = rgba(accent, 0.15 + 0.85 * life);
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, TAU);
        ctx.fill();
        if (life > 0.6) {
          ctx.strokeStyle = rgba(accent, (life - 0.6) * 2);
          ctx.beginPath();
          ctx.arc(x, y, 2.4 + (1 - life) * 30, 0, TAU);
          ctx.stroke();
        }
      }

      ctx.fillStyle = rgba(accent, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, TAU);
      ctx.fill();
    };

    const draw = (now: number) => {
      const t = reduce ? 12 : Math.max(0, now - start) / 1000;
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      ctx.clearRect(0, 0, w, h);
      if (variant === "hero") drawHero(t);
      else drawRadar(t);
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce) draw(performance.now());
      else if (onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    };

    readColors();
    resize();
    play();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      play();
    });
    io.observe(canvas);

    // Re-read colours when the mission mode changes
    const mo = new MutationObserver(() => {
      readColors();
      if (reduce) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });

    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", play);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", play);
    };
  }, [variant]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
