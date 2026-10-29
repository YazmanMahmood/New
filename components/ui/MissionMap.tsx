"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useInView, useReducedMotion } from "framer-motion";

/*
  Looping mission on a site map:
  command authorises the flight → VTOL takes off from the dock → patrols the
  pipeline → detects a thermal anomaly → raises an alert to the operator.
  Positions are driven from one clock so the drone, trail and HUD stay in sync.

  The HUD panels are sized in container units, so they keep the same share of
  the map at any size. In map units (0–400) they cover: command panel x<200,
  y<200; telemetry x>300, y<80; alert (last phase only) y>320. The dock,
  route and anomaly sit outside those areas so the drone is never hidden.
*/

const CYCLE = 16;
// Phase start times, in seconds
const T = { authorized: 1.4, takeoff: 2.4, patrol: 4.2, detect: 9, alert: 10.5, fade: 15.2 };

const STEPS = ["Authorize", "Take off", "Patrol", "Detect", "Alert"] as const;

const DOCK = { x: 62, y: 262 };
const ANOMALY = { x: 300, y: 196 };
const ORBIT_R = 26;
// Ends at the top of the orbit (ANOMALY.y - ORBIT_R), where the circling starts
const ROUTE = "M62 262 C80 240 120 236 170 236 C220 236 262 214 300 170";
const PIPELINE = "M-10 318 L90 290 L170 268 C220 252 260 222 300 196 L410 140";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

function stepAt(t: number) {
  if (t < T.takeoff) return 0;
  if (t < T.patrol) return 1;
  if (t < T.detect) return 2;
  if (t < T.alert) return 3;
  return 4;
}

export function MissionMap({ active = true, className = "" }: { active?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box);
  const routeRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const droneRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const scanRef = useRef<SVGCircleElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const spdRef = useRef<HTMLSpanElement>(null);
  const batRef = useRef<HTMLSpanElement>(null);
  const clock = useRef(0);
  // Start like the server render; with reduced motion the first frame jumps to the end state
  const [step, setStep] = useState(0);
  const [authorized, setAuthorized] = useState(false);

  // Start the mission from the top each time it becomes visible
  useEffect(() => {
    if (active && inView) clock.current = 0;
  }, [active, inView]);

  useAnimationFrame((_, delta) => {
    const route = routeRef.current;
    const drone = droneRef.current;
    if (!route || !drone) return;
    if (!reduce && !(active && inView)) return;

    clock.current = reduce ? 12.5 : (clock.current + Math.min(delta, 50) / 1000) % CYCLE;
    const t = clock.current;
    const len = route.getTotalLength();

    // Drone position and heading
    let x = DOCK.x;
    let y = DOCK.y;
    let heading = -70;
    let travelled = 0;
    if (t >= T.patrol && t < T.detect) {
      const p = smooth(clamp01((t - T.patrol) / (T.detect - T.patrol)));
      travelled = p * len;
      const pt = route.getPointAtLength(travelled);
      const ahead = route.getPointAtLength(Math.min(len, travelled + 2));
      const behind = route.getPointAtLength(Math.max(0, travelled - 2));
      x = pt.x;
      y = pt.y;
      heading = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
    } else if (t >= T.detect) {
      travelled = len;
      const a = -Math.PI / 2 + (t - T.detect) * 0.7;
      x = ANOMALY.x + Math.cos(a) * ORBIT_R;
      y = ANOMALY.y + Math.sin(a) * ORBIT_R;
      heading = (a * 180) / Math.PI + 90;
    }

    // Altitude: 0 until take-off, climbs to 120 m
    const climb = t < T.takeoff ? 0 : smooth(clamp01((t - T.takeoff) / (T.patrol - T.takeoff)));
    const scale = 0.62 + 0.38 * climb;
    drone.setAttribute("transform", `translate(${x} ${y}) rotate(${heading + 90}) scale(${scale})`);
    shadowRef.current?.setAttribute("cx", String(x + 10 * climb));
    shadowRef.current?.setAttribute("cy", String(y + 14 * climb));
    shadowRef.current?.setAttribute("opacity", String(0.15 + 0.2 * (1 - climb)));

    scanRef.current?.setAttribute("cx", String(x));
    scanRef.current?.setAttribute("cy", String(y));
    scanRef.current?.setAttribute("opacity", t >= T.patrol ? "1" : "0");

    if (trailRef.current) {
      trailRef.current.style.strokeDasharray = `${len}`;
      trailRef.current.style.strokeDashoffset = `${len - travelled}`;
    }

    // Fade the moving parts out at the end of the loop and back in at the start
    const fade = t > T.fade ? 1 - (t - T.fade) / (CYCLE - T.fade) : clamp01(t / 0.4);
    layerRef.current?.setAttribute("opacity", String(reduce ? 1 : fade));

    // Telemetry
    if (altRef.current) altRef.current.textContent = String(Math.round(climb * 120));
    if (spdRef.current) spdRef.current.textContent = t < T.patrol ? "0" : t < T.detect ? "54" : "38";
    if (batRef.current) batRef.current.textContent = String(Math.round(98 - t * 0.5));

    const s = stepAt(t);
    setStep((prev) => (prev === s ? prev : s));
    const auth = t >= T.authorized;
    setAuthorized((prev) => (prev === auth ? prev : auth));
  });

  const detecting = step >= 3;
  const alerting = step === 4;

  return (
    <div
      ref={box}
      role="img"
      aria-label="Animation: command authorises a flight, a VTOL drone takes off, patrols a pipeline, detects a thermal anomaly and sends an alert to the operator."
      className={`theme-fade @container relative aspect-square w-full overflow-hidden border border-line bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] ${className}`}
    >
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="mm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="var(--line)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="mm-scan">
            <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Terrain */}
        <rect width="400" height="400" fill="url(#mm-grid)" />
        <g fill="none" stroke="var(--line)" strokeWidth="0.8">
          <path d="M210 300c40-30 110-20 140 10s-10 70-70 70-110-50-70-80z" />
          <path d="M230 305c30-18 80-12 100 8s-10 48-52 48-78-34-48-56z" />
          <path d="M250 312c18-8 46-6 58 6s-6 28-30 28-44-20-28-34z" />
          <path d="M40 60c50-30 120-10 120 30s-70 50-110 30-40-45-10-60z" />
          <path d="M60 70c32-18 80-6 80 20s-46 32-72 20-28-30-8-40z" />
        </g>
        {/* River and roads */}
        <path d="M-10 120 C60 140 90 100 160 110 S260 60 410 40" fill="none" stroke="var(--muted)" strokeOpacity="0.25" strokeWidth="6" />
        <path d="M0 360 L400 290" stroke="var(--muted)" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="6 5" />
        <path d="M120 400 L190 0" stroke="var(--muted)" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="6 5" />

        {/* Pipeline and its assets */}
        <path d={PIPELINE} fill="none" stroke="var(--fg)" strokeOpacity="0.55" strokeWidth="2.5" />
        {[
          { x: 90, y: 290, label: "KM 06" },
          { x: 170, y: 268, label: "KM 10" },
          { x: 350, y: 170, label: "KM 18" },
        ].map((a) => (
          <g key={a.label}>
            <rect x={a.x - 4} y={a.y - 4} width="8" height="8" fill="var(--bg)" stroke="var(--fg)" strokeOpacity="0.7" />
            <text x={a.x + 8} y={a.y - 8} fontSize="9" fill="var(--muted)" className="narrow">
              {a.label}
            </text>
          </g>
        ))}
        <text x={ANOMALY.x + 32} y={ANOMALY.y + 22} fontSize="9" fill="var(--muted)" className="narrow">
          KM 14
        </text>

        {/* Dock */}
        <g>
          <rect x={DOCK.x - 16} y={DOCK.y - 16} width="32" height="32" fill="var(--bg)" stroke="var(--signal)" strokeWidth="1.2" />
          <text x={DOCK.x} y={DOCK.y + 4} fontSize="11" textAnchor="middle" fill="var(--signal)" fontWeight="700">
            H
          </text>
          <text x={DOCK.x + 22} y={DOCK.y + 4} fontSize="9" fill="var(--muted)" className="narrow">
            DOCK-01
          </text>
        </g>

        {/* Planned route and flown trail */}
        <path ref={routeRef} d={ROUTE} fill="none" stroke="var(--signal)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 4" />
        <g ref={layerRef}>
          <path ref={trailRef} d={ROUTE} fill="none" stroke="var(--signal)" strokeWidth="1.6" />

          {/* Detection */}
          <AnimatePresence>
            {detecting && (
              <motion.g
                key="detect"
                initial={{ opacity: 0, scale: 1.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${ANOMALY.x}px ${ANOMALY.y}px` }}
              >
                <circle cx={ANOMALY.x} cy={ANOMALY.y} r="7" fill="var(--alarm)" fillOpacity="0.9" />
                <circle cx={ANOMALY.x} cy={ANOMALY.y} r="7" fill="none" stroke="var(--alarm)" className="mm-ping" />
                <g stroke="var(--alarm)" strokeWidth="1.5" fill="none">
                  <path d={`M${ANOMALY.x - 18} ${ANOMALY.y - 10}v-8h8`} />
                  <path d={`M${ANOMALY.x + 10} ${ANOMALY.y - 18}h8v8`} />
                  <path d={`M${ANOMALY.x + 18} ${ANOMALY.y + 10}v8h-8`} />
                  <path d={`M${ANOMALY.x - 10} ${ANOMALY.y + 18}h-8v-8`} />
                </g>
                <rect x={ANOMALY.x - 18} y={ANOMALY.y + 34} width="76" height="15" fill="var(--alarm)" />
                <text x={ANOMALY.x - 13} y={ANOMALY.y + 44.5} fontSize="8.5" fill="#fff" fontWeight="700" className="narrow">
                  THERMAL · 94%
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Drone */}
          <ellipse ref={shadowRef} cx={DOCK.x} cy={DOCK.y} rx="9" ry="5" fill="var(--fg)" opacity="0.3" />
          <circle ref={scanRef} cx={DOCK.x} cy={DOCK.y} r="30" fill="url(#mm-scan)" opacity="0" />
          <g ref={droneRef} transform={`translate(${DOCK.x} ${DOCK.y}) scale(0.62)`}>
            {/* Top-down VTOL: wing, fuselage, tail and four lift rotors */}
            <path d="M0 -14 L0 13" stroke="var(--fg)" strokeWidth="3" strokeLinecap="round" />
            <path d="M-17 -2 H17" stroke="var(--fg)" strokeWidth="4" strokeLinecap="round" />
            <path d="M-6 12 H6" stroke="var(--fg)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M-9 -9 V8 M9 -9 V8" stroke="var(--fg)" strokeWidth="1.2" />
            {[
              [-9, -9],
              [9, -9],
              [-9, 8],
              [9, 8],
            ].map(([cx, cy]) => (
              <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="4.5" fill="none" stroke="var(--signal)" strokeWidth="1" strokeDasharray="5 2.5" className={reduce ? "" : "mm-rotor"} />
            ))}
            <circle cx="0" cy="-14" r="1.6" fill="var(--signal)" />
          </g>
        </g>
      </svg>

      {/* Command panel. Sizes are in container units (cqw) so it scales with the map. */}
      <div className="theme-fade absolute left-[3%] top-[3%] w-[47%] border border-line bg-bg/90 p-[2.8cqw] text-[length:clamp(9px,2.6cqw,13px)] leading-tight backdrop-blur-sm">
        <p className="narrow font-semibold uppercase tracking-[0.16em] text-muted">Artemis command</p>
        <p className="mt-[1.2cqw] hidden font-semibold text-fg @sm:block">PATROL-07 · Pipeline B</p>
        {/* Small maps: just the current step */}
        <p className={`mt-[2cqw] font-semibold @sm:hidden ${step === 4 ? "text-alarm" : "text-signal"}`}>
          {step + 1}/5 · {STEPS[step]}
        </p>
        <ol className="mt-[2cqw] hidden space-y-[1.1cqw] @sm:block">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            const alarm = current && i === 4;
            return (
              <li key={label} className={`flex items-center gap-[1.8cqw] transition-colors duration-300 ${done || current ? "text-fg" : "text-muted"}`}>
                <span
                  className={`grid h-[3.2cqw] w-[3.2cqw] shrink-0 place-items-center border transition-colors duration-300 ${
                    alarm
                      ? "border-alarm bg-alarm"
                      : done
                        ? "border-signal bg-signal"
                        : current
                          ? "border-signal"
                          : "border-line"
                  }`}
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="h-[2.3cqw] w-[2.3cqw] text-bg" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                    </svg>
                  )}
                  {current && !alarm && <span className="h-[1.4cqw] w-[1.4cqw] bg-signal animate-[blink_1.2s_ease-in-out_infinite]" />}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
        <div
          className={`mt-[2cqw] flex h-[6.2cqw] items-center justify-center border text-[length:clamp(9px,2.5cqw,12px)] font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${
            authorized ? "border-signal bg-signal text-bg" : "border-signal text-signal"
          }`}
        >
          {authorized ? "Authorized ✓" : "Authorize flight"}
        </div>
      </div>

      {/* Telemetry */}
      <dl className="theme-fade narrow absolute right-[3%] top-[3%] grid grid-cols-[auto_auto] gap-x-[1.8cqw] gap-y-[0.8cqw] border border-line bg-bg/90 px-[2.2cqw] py-[1.8cqw] text-[length:clamp(9px,2.6cqw,13px)] tabular-nums backdrop-blur-sm">
        <dt className="text-muted">ALT</dt>
        <dd className="text-right font-semibold text-fg">
          <span ref={altRef}>0</span> m
        </dd>
        <dt className="text-muted">SPD</dt>
        <dd className="text-right font-semibold text-fg">
          <span ref={spdRef}>0</span> km/h
        </dd>
        <dt className="text-muted">BAT</dt>
        <dd className="text-right font-semibold text-fg">
          <span ref={batRef}>98</span>%
        </dd>
      </dl>

      {/* Alert */}
      <AnimatePresence>
        {alerting && (
          <motion.div
            key="alert"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-[3%] bottom-[3%] flex items-center gap-[2.6cqw] border border-alarm bg-bg/95 p-[2.4cqw] backdrop-blur-sm"
          >
            <span className="relative grid h-[7cqw] w-[7cqw] shrink-0 place-items-center bg-alarm text-white">
              <svg viewBox="0 0 16 16" className="h-[3.6cqw] w-[3.6cqw]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M8 2.5l6 11H2z" />
                <path d="M8 7v3M8 11.8v.2" />
              </svg>
            </span>
            <div className="min-w-0 text-[length:clamp(9px,2.6cqw,13px)] leading-snug">
              <p className="font-bold uppercase tracking-[0.08em] text-alarm">Alert · Thermal anomaly at KM 14</p>
              <p className="mt-0.5 text-muted">Possible leak, 94% confidence. Sent to operator for approval.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
