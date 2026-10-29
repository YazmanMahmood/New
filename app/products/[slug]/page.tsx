import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ProductImage } from "@/components/products/ProductImage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ProductRow } from "@/components/products/ProductRow";
import { SpecIcon } from "@/components/products/SpecIcon";
import { CallToAction } from "@/components/sections/CallToAction";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/site";
import { allProducts, getProduct, missions } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  const path = `/products/${product.slug}`;
  return pageMetadata({ title: product.name, description: product.description, path, image: `${path}/opengraph-image` });
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const missionNames = product.missions.map((id) => missions.find((m) => m.id === id)!.name);
  // Other drones that share a mission with this one
  const related = allProducts.filter(
    (p) => p.slug !== product.slug && p.missions.some((m) => product.missions.includes(m)),
  );

  return (
    <>
      {/* Overview: details left, picture right */}
      <section className="tone-a relative" aria-labelledby="product-title">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
          <Breadcrumbs
            items={[
              { name: "Products", path: "/products" },
              { name: product.name, path: `/products/${product.slug}` },
            ]}
          />

          <div className="product-card mt-8 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            <Reveal className="order-2 lg:order-1 lg:col-span-6">
              <Eyebrow>{missionNames.join(" · ")}</Eyebrow>
              <h1
                id="product-title"
                className="wide mt-5 text-[clamp(2.2rem,4.4vw,3.75rem)] font-bold leading-[1] tracking-[-0.03em]"
              >
                {product.name}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{product.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact">Book a demo</ButtonLink>
                <ButtonLink href="/platform" variant="ghost">
                  The autonomy stack
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="theme-fade relative order-1 overflow-hidden border border-line lg:order-2 lg:col-span-6">
              <ProductImage product={product} ratio="4/3" sizes="(min-width: 1024px) 620px, 100vw" priority />
              <span className="reticle left-3 top-3 border-l-2 border-t-2" aria-hidden />
              <span className="reticle right-3 top-3 border-r-2 border-t-2" aria-hidden />
              <span className="reticle bottom-3 left-3 border-b-2 border-l-2" aria-hidden />
              <span className="reticle bottom-3 right-3 border-b-2 border-r-2" aria-hidden />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Specifications and use cases */}
      <section className="tone-b relative" aria-labelledby="specs-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <Eyebrow>Specifications</Eyebrow>
            <h2 id="specs-title" className="sr-only">
              {product.name} specifications
            </h2>
            {product.specs.length > 0 ? (
              <dl className="theme-fade mt-8 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3">
                {product.specs.map((s) => (
                  <div key={s.label} className="min-w-0 bg-bg p-4 md:p-6">
                    <SpecIcon label={s.label} className="h-6 w-6" />
                    <dt className="narrow mt-4 text-xs text-muted md:mt-5">{s.label}</dt>
                    <dd className="wide mt-1 text-base font-bold leading-snug tracking-tight md:text-lg">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-8 text-muted">Specifications shared on request.</p>
            )}
          </Reveal>

          {product.useCases && (
            <Reveal delay={0.1} className="lg:col-span-4">
              <Eyebrow>Use cases</Eyebrow>
              <ul className="theme-fade mt-8 border-t border-line">
                {product.useCases.map((u) => (
                  <li key={u} className="theme-fade flex items-center gap-3 border-b border-line py-4 font-medium">
                    <span aria-hidden className="theme-fade h-px w-4 shrink-0 bg-accent" />
                    {u}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="tone-a relative" aria-labelledby="related-title">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
            <Eyebrow>More for {missionNames.join(" and ").toLowerCase()}</Eyebrow>
            <h2 id="related-title" className="wide mt-5 text-[clamp(1.8rem,3vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              Related platforms
            </h2>
            <ul className="theme-fade mt-8 border-t border-line">
              {related.map((p, i) => (
                <ProductRow key={p.slug} product={p} index={i} headingLevel="h3" />
              ))}
            </ul>
          </div>
        </section>
      )}

      <CallToAction />
    </>
  );
}
