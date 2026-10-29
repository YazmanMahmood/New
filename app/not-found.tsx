import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { allProducts } from "@/data/products";

// Next serves this with a 404 status and a noindex tag.
export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for doesn't exist or has moved.",
};

const pages = [
  { href: "/products", label: "Products", line: "The full fleet, by mission" },
  { href: "/platform", label: "Platform", line: "The autonomy stack behind every drone" },
  { href: "/about", label: "About", line: "Who we are and who backs us" },
  { href: "/contact", label: "Contact", line: "Email, call or leave a message" },
];

export default function NotFound() {
  return (
    <section className="tone-a relative min-h-[80vh]" aria-labelledby="not-found-title">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-8 md:pb-28 md:pt-36">
        <p className="tag">Error 404</p>
        <h1 id="not-found-title" className="wide mt-3 text-[clamp(2.2rem,4.4vw,3.75rem)] font-bold leading-[1] tracking-[-0.03em]">
          Off the flight path.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          This page doesn&apos;t exist or has moved. Pick up from one of these instead.
        </p>
        <div className="mt-8">
          <ButtonLink href="/">Back to the homepage</ButtonLink>
        </div>

        <div className="theme-fade mt-14 grid gap-12 border-t border-line pt-10 lg:grid-cols-12">
          <ul className="lg:col-span-6">
            {pages.map((p) => (
              <li key={p.href} className="theme-fade border-b border-line">
                <Link href={p.href} className="group flex items-baseline justify-between gap-4 py-4">
                  <span className="wide text-lg font-bold tracking-tight transition-colors group-hover:text-accent-text">{p.label}</span>
                  <span className="text-right text-sm text-muted">{p.line}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="narrow text-xs uppercase tracking-[0.16em] text-muted">Platforms</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {allProducts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="theme-fade inline-block border border-line px-3 py-2 text-sm transition-colors hover:border-fg"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
