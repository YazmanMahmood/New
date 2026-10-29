"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SpecIcon } from "@/components/products/SpecIcon";
import { allProducts, fleetCode, missions, statKeys, type StatKey } from "@/data/products";

const ease = [0.16, 1, 0.3, 1] as const;

const maxOf = Object.fromEntries(
  statKeys.map((s) => [s.id, Math.max(...allProducts.map((p) => p.stats?.[s.id] ?? 0))]),
) as Record<StatKey, number>;

/** Every platform side by side. Click a column to rank by it. */
export function FleetLineup() {
  const reduce = useReducedMotion();
  const [sortBy, setSortBy] = useState<StatKey | null>(null);

  const rows = sortBy
    ? [...allProducts].sort((a, b) => (b.stats?.[sortBy] ?? -1) - (a.stats?.[sortBy] ?? -1))
    : allProducts;

  return (
    <section className="tone-a relative" aria-labelledby="lineup-title">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Lineup</Eyebrow>
            <h2 id="lineup-title" className="wide mt-5 text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
              The whole fleet, side by side.
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="leading-relaxed text-muted">
              <span className="md:hidden">Pick a figure to rank the fleet by it. Tap it again to reset.</span>
              <span className="hidden md:inline">Click a column to rank the fleet by it. Click again to reset.</span>
            </p>
          </Reveal>
        </div>

        {/* Phones: rank buttons and one card per drone */}
        <div className="mt-10 md:hidden">
          <div role="group" aria-label="Rank the fleet by" className="flex flex-wrap gap-2">
            {statKeys.map((s) => {
              const active = sortBy === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSortBy(active ? null : s.id)}
                  className={`theme-fade narrow inline-flex h-10 cursor-pointer items-center gap-1.5 border px-3 text-sm font-medium transition-colors ${
                    active ? "border-accent text-accent-text" : "border-line text-muted"
                  }`}
                >
                  <SpecIcon label={s.label} className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              );
            })}
          </div>
          <ul className="mt-6 border-t border-fg">
            {rows.map((p) => (
              <motion.li key={p.slug} layout={!reduce} transition={{ duration: 0.5, ease }} className="theme-fade border-b border-line py-5">
                <Link href={`/products/${p.slug}`} className="flex items-baseline justify-between gap-3">
                  <span className="wide font-bold tracking-tight">{p.name}</span>
                  <span className="narrow text-xs tabular-nums text-muted">{fleetCode(p.slug)}</span>
                </Link>
                <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
                  {statKeys.map((s) => {
                    const v = p.stats?.[s.id];
                    return (
                      <div key={s.id}>
                        <dt className="narrow text-xs text-muted">{s.label}</dt>
                        <dd className={`mt-0.5 text-sm font-semibold tabular-nums ${sortBy === s.id ? "text-accent-text" : ""}`}>
                          {v === undefined ? <span className="font-normal text-muted">–</span> : `${v} ${s.unit}`}
                        </dd>
                        {v !== undefined && (
                          <span className="mt-1 block h-1 bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]">
                            <span
                              className={`block h-full rounded-r-[2px] ${sortBy === s.id ? "bg-accent" : "bg-muted"}`}
                              style={{ width: `${(v / maxOf[s.id]) * 100}%` }}
                            />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </dl>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Tablet and up: sortable table */}
        <div className="mt-12 hidden md:block">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <caption className="sr-only">Artemis UAV platforms compared by top speed, endurance, range and payload</caption>
            <thead>
              <tr className="theme-fade border-b border-fg">
                <th scope="col" className="narrow w-16 py-3 pr-4 text-xs font-medium text-muted">Code</th>
                <th scope="col" className="narrow py-3 pr-4 text-xs font-medium text-muted">Platform</th>
                {statKeys.map((s) => {
                  const active = sortBy === s.id;
                  return (
                    <th key={s.id} scope="col" aria-sort={active ? "descending" : "none"} className="w-[15%] py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => setSortBy(active ? null : s.id)}
                        className={`narrow inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors ${active ? "text-accent-text" : "text-muted hover:text-fg"}`}
                      >
                        <SpecIcon label={s.label} className="h-3.5 w-3.5" />
                        {s.label}
                        <span className="text-[10px]">{s.unit}</span>
                        <svg aria-hidden viewBox="0 0 10 10" className={`h-2.5 w-2.5 transition-opacity ${active ? "opacity-100" : "opacity-30"}`} fill="currentColor">
                          <path d="M5 8L1.5 3h7z" />
                        </svg>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <motion.tr
                  key={p.slug}
                  layout={!reduce}
                  transition={{ duration: 0.5, ease }}
                  className="theme-fade group border-b border-line transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_4%,transparent)]"
                >
                  <td className="narrow py-4 pr-4 text-sm tabular-nums text-muted">{fleetCode(p.slug)}</td>
                  <th scope="row" className="py-4 pr-4 font-normal">
                    <Link href={`/products/${p.slug}`} className="wide font-bold tracking-tight transition-colors group-hover:text-accent-text">
                      {p.name}
                    </Link>
                    <span className="narrow mt-0.5 block text-xs text-muted">
                      {p.missions.map((id) => missions.find((m) => m.id === id)!.name).join(" / ")}
                    </span>
                  </th>
                  {statKeys.map((s) => {
                    const v = p.stats?.[s.id];
                    return (
                      <td key={s.id} className="py-4 pr-4">
                        {v === undefined ? (
                          <span className="text-muted">–</span>
                        ) : (
                          <>
                            <span className={`text-sm font-semibold tabular-nums ${sortBy === s.id ? "text-fg" : ""}`}>{v}</span>
                            <span className="mt-1.5 block h-1 bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]">
                              <motion.span
                                className={`block h-full rounded-r-[2px] ${sortBy === s.id ? "bg-accent" : "bg-muted"}`}
                                initial={reduce ? false : { width: 0 }}
                                whileInView={{ width: `${(v / maxOf[s.id]) * 100}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease }}
                              />
                            </span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">Top-end figures for each platform. A dash means the figure is shared on request.</p>
      </div>
    </section>
  );
}
