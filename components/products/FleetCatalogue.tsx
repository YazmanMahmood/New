"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMode } from "@/components/providers/ModeProvider";
import { CatalogueButton } from "@/components/products/CatalogueButton";
import { SpecIcon } from "@/components/products/SpecIcon";
import { ProductImage } from "@/components/products/ProductImage";
import { allProducts, fleetCode, missions, productsPage, type CatalogueProduct, type Mode } from "@/data/products";

/*
  Fleet catalogue: every platform as a card with its picture, key specs and a
  link to its spec sheet. Mission tabs filter the grid and re-theme the site.
*/

const ease = [0.16, 1, 0.3, 1] as const;

type Filter = Mode | "all";

function ProductCard({ product, index }: { product: CatalogueProduct; index: number }) {
  const reduce = useReducedMotion();
  const missionNames = product.missions.map((id) => missions.find((m) => m.id === id)!.name);

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.5, delay: reduce ? 0 : Math.min(index, 5) * 0.05, ease }}
      className="min-w-0"
    >
      <Link
        href={`/products/${product.slug}`}
        className="product-card theme-fade group flex h-full flex-col border border-line bg-bg transition-colors duration-300 hover:border-fg"
      >
        {/* Picture */}
        <div className="relative overflow-hidden border-b border-line">
          <div className="transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            <ProductImage product={product} ratio="4/3" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" priority={index < 3} />
          </div>
          <span className="narrow absolute left-3 top-3 bg-bg/85 px-2 py-1 text-xs tabular-nums text-accent-text backdrop-blur-sm">
            {fleetCode(product.slug)}
          </span>
          <span className="reticle right-3 top-3 border-r-2 border-t-2" aria-hidden />
          <span className="reticle bottom-3 left-3 border-b-2 border-l-2" aria-hidden />
          <span className="reticle bottom-3 right-3 border-b-2 border-r-2" aria-hidden />
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <p className="narrow text-xs uppercase tracking-[0.16em] text-muted">{missionNames.join(" / ")}</p>
          <h2 className="wide mt-2 text-xl font-bold tracking-tight md:text-2xl">{product.name}</h2>
          <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted">{product.description}</p>

          {product.specs.length > 0 && (
            <dl className="theme-fade mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
              {product.specs.slice(0, 3).map((s) => (
                <div key={s.label} className="min-w-0">
                  {/* Long labels wrap on phones; two lines are reserved so the values stay level */}
                  <dt className="narrow flex min-h-7 items-start gap-1.5 text-[11px] leading-tight text-muted sm:min-h-0 sm:items-center">
                    <SpecIcon label={s.label} className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 break-words sm:truncate">{s.label}</span>
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[15px] font-medium text-accent-text">
            View details
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M2 8h11M9 4l4 4-4 4" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

export function FleetCatalogue() {
  const { setMode } = useMode();
  const [filter, setFilter] = useState<Filter>("all");

  const shown = filter === "all" ? allProducts : allProducts.filter((p) => p.missions.includes(filter));
  const tabs: { id: Filter; name: string; count: number }[] = [
    { id: "all", name: "All", count: allProducts.length },
    ...missions.map((m) => ({ id: m.id, name: m.name, count: allProducts.filter((p) => p.missions.includes(m.id)).length })),
  ];

  const choose = (id: Filter) => {
    setFilter(id);
    setMode(id === "all" ? "none" : id);
  };

  return (
    <section className="tone-a relative overflow-hidden" aria-labelledby="fleet-title">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 md:px-8 md:pb-20 md:pt-28">
        {/* Header */}
        <div className="theme-fade flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line pb-5">
          <div>
            <p className="tag">{productsPage.eyebrow}</p>
            <h1 id="fleet-title" className="xwide mt-2 text-[clamp(2.4rem,5vw,4.25rem)] font-bold leading-none tracking-[-0.04em]">
              {productsPage.title}
            </h1>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <p className="max-w-md text-[15px] leading-relaxed text-muted md:text-right">{productsPage.intro}</p>
            <CatalogueButton variant="ghost" />
          </div>
        </div>

        {/* Mission filter */}
        <div role="group" aria-label="Filter by mission" className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => choose(t.id)}
                className={`theme-fade inline-flex shrink-0 cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-fg"
                    : "border-line text-muted hover:border-fg hover:text-fg"
                }`}
              >
                {t.name}
                <span className={`narrow text-xs tabular-nums ${active ? "text-accent-text" : "text-muted"}`}>{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <motion.ul layout className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
