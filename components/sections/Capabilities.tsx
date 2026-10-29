"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { capabilities } from "@/data/home";

const ease = [0.16, 1, 0.3, 1] as const;

// Line icons on a 32×32 grid, one per capability
const icons: Record<(typeof capabilities.items)[number]["icon"], string[]> = {
  detect: ["M4 11V4h7", "M21 4h7v7", "M28 21v7h-7", "M11 28H4v-7", "M10 16a6 6 0 1 0 12 0a6 6 0 1 0-12 0", "M16 15v2"],
  dock: ["M4 27h24", "M6 27v-8h20v8", "M16 15V5", "M12 9l4-4 4 4", "M14 23l2-2.5h-2.5l2-2.5"],
  operator: ["M11 10a5 5 0 1 0 10 0a5 5 0 1 0-10 0", "M5 28c1-6 5-9 11-9s10 3 11 9", "M20 24l2 2 4-4"],
  swarm: ["M14 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M4 24a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M24 24a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M14 16a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M16 8v6M8 23l6-6M24 23l-6-6M8 24h16"],
};

/** The major capabilities in one horizontal row, each with an icon; a soft spotlight follows the cursor. */
export function Capabilities() {
  const reduce = useReducedMotion();

  const track = (e: React.PointerEvent<HTMLLIElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <section className="tone-a relative" aria-labelledby="capabilities-title">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>{capabilities.eyebrow}</Eyebrow>
            <h2
              id="capabilities-title"
              className="wide mt-5 text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]"
            >
              {capabilities.title}
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="leading-relaxed text-muted">{capabilities.intro}</p>
          </Reveal>
        </div>

        <ul className="theme-fade mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {capabilities.items.map((item, i) => (
            <motion.li
              key={item.title}
              onPointerMove={track}
              className="group relative overflow-hidden bg-bg p-6 transition-colors duration-500 md:p-7"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%)",
                }}
              />
              <div className="relative">
                <span className="theme-fade grid h-14 w-14 place-items-center border border-accent bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent-text transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-ink">
                  <svg
                    viewBox="0 0 32 32"
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {icons[item.icon].map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </svg>
                </span>
                <h3 className="wide mt-6 text-base font-bold leading-snug tracking-tight md:text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                <span
                  aria-hidden
                  className="theme-fade mt-5 block h-px w-6 bg-accent transition-[width] duration-500 ease-out group-hover:w-14"
                />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
