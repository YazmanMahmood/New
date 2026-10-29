"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ProductImage } from "@/components/products/ProductImage";
import { SpecIcon } from "@/components/products/SpecIcon";
import type { Product } from "@/data/products";

const ease = [0.16, 1, 0.3, 1] as const;

type ProductRowProps = {
  product: Product;
  index: number;
  /** How many specs to show; the major ones are listed first in the data */
  specLimit?: number;
  showUseCases?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
};

/** One drone: details on the left, picture on the right (picture on top on phones). */
export function ProductRow({ product, index, specLimit = 3, showUseCases = false, headingLevel = "h4" }: ProductRowProps) {
  const reduce = useReducedMotion();
  const Heading = headingLevel;
  const specs = product.specs.slice(0, specLimit);

  // Picture tilts toward the cursor
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const untilt = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.li
      className="product-card theme-fade group grid gap-8 border-b border-line py-10 md:py-12 lg:grid-cols-12 lg:items-center lg:gap-12"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay: reduce ? 0 : Math.min(index, 3) * 0.08, ease }}
    >
      {/* Details on the left */}
      <div className="order-2 lg:order-1 lg:col-span-7">
        <span className="narrow text-sm tabular-nums text-muted">{String(index + 1).padStart(2, "0")}</span>
        <Heading className="wide mt-3 text-2xl font-bold tracking-tight md:text-3xl">{product.name}</Heading>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">{product.description}</p>

        {specs.length > 0 ? (
          <dl className="theme-fade mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
            {specs.map((s) => (
              <div key={s.label} className="flex items-start gap-3">
                <SpecIcon label={s.label} className="mt-0.5 h-5 w-5" />
                <div>
                  <dt className="narrow text-xs text-muted">{s.label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug">{s.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-6 text-sm text-muted">Specifications shared on request.</p>
        )}

        {showUseCases && product.useCases && (
          <p className="mt-6 text-sm leading-relaxed text-muted">
            <span className="font-semibold text-fg">Use cases: </span>
            {product.useCases.join(" · ")}
          </p>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-accent-text"
        >
          View {product.name}
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
        </Link>
      </div>

      {/* Picture on the right */}
      <div className="order-1 [perspective:1000px] lg:order-2 lg:col-span-5" onPointerMove={tilt} onPointerLeave={untilt}>
        <motion.div
          className="theme-fade relative overflow-hidden border border-line transition-colors duration-300 group-hover:border-fg"
          style={{ rotateX, rotateY }}
        >
          <ProductImage product={product} ratio="4/3" sizes="(min-width: 1024px) 520px, 100vw" />
          {/* Target reticle corners, visible only in defense mode */}
          <span className="reticle left-3 top-3 border-l-2 border-t-2" aria-hidden />
          <span className="reticle right-3 top-3 border-r-2 border-t-2" aria-hidden />
          <span className="reticle bottom-3 left-3 border-b-2 border-l-2" aria-hidden />
          <span className="reticle bottom-3 right-3 border-b-2 border-r-2" aria-hidden />
        </motion.div>
      </div>
    </motion.li>
  );
}
