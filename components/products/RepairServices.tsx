import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/data/products";

/** Repair and upgrade services from the product catalogue. */
export function RepairServices() {
  return (
    <section id="services" className="tone-b relative scroll-mt-16" aria-labelledby="services-title">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>{services.eyebrow}</Eyebrow>
            <h2
              id="services-title"
              className="wide mt-5 text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]"
            >
              {services.title}
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="leading-relaxed text-muted">{services.intro}</p>
          </Reveal>
        </div>

        <div className="theme-fade mt-10 grid gap-px border border-line bg-line md:mt-12 md:grid-cols-2">
          {services.groups.map((group, i) => (
            <Reveal key={group.title} delay={i * 0.08} className="bg-bg p-6 md:p-8">
              <h3 className="wide text-lg font-bold tracking-tight md:text-xl">{group.title}</h3>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed text-muted">
                    <span aria-hidden className="theme-fade mt-[0.6em] h-px w-4 shrink-0 bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
