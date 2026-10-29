import { ButtonLink } from "@/components/ui/ButtonLink";
import { DecodeText } from "@/components/ui/DecodeText";
import { Reveal } from "@/components/ui/Reveal";
import { BackedBy } from "@/components/sections/BackedBy";
import { CatalogueButton } from "@/components/products/CatalogueButton";
import { PrincipleCards, SysLabel, Timeline } from "@/components/about/AboutParts";
import { about, companyProfile, milestones, principles, story, workWithUs } from "@/data/about";
import { contact } from "@/data/home";

/*
  About, in the same machine-readout style as the homepage hero: who Artemis
  is, its directives (mission, vision, values), its operational history, who
  backs it, and an open door at the end. Headings decode in, panels draw their
  corners, and the timeline fills as you scroll.
*/

const headline = "wide text-[clamp(2.2rem,4.6vw,4rem)] font-bold uppercase leading-[1] tracking-[-0.03em]";

export function AboutPage() {
  return (
    <>
      <section className="tone-a relative overflow-hidden" aria-labelledby="about-title">
        {/* Faint survey grid behind the heading */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
          {/* Heading */}
          <SysLabel index="01">
            <DecodeText text={about.eyebrow} delay={0.2} step={0.035} scramble={0.25} />
          </SysLabel>
          <h1 id="about-title" className={`${headline} mt-6 max-w-4xl`}>
            <DecodeText text={about.title} delay={0.5} step={0.03} scramble={0.4} cursor />
          </h1>
          <Reveal delay={1.2}>
            <p className="mt-6 font-mono text-sm uppercase tracking-[0.16em] text-muted">{about.subtitle}</p>
          </Reveal>

          {/* Story and key facts */}
          <div className="theme-fade mt-14 grid grid-cols-1 gap-12 border-t border-line pt-12 md:mt-20 lg:grid-cols-12 lg:gap-12">
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">&gt; {story.eyebrow}</p>
              <div className="mt-5 space-y-6 text-lg leading-relaxed md:text-xl">
                {story.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.25} className="lg:col-span-4 lg:col-start-9">
              <dl className="theme-fade border-t border-line">
                {story.facts.map((f) => (
                  <div key={f.label} className="theme-fade flex items-baseline justify-between gap-4 border-b border-line py-4">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{f.label}</dt>
                    <dd className="text-right text-lg font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8">
                <CatalogueButton variant="ghost" doc={companyProfile} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission, vision, values */}
      <section className="tone-b relative" aria-labelledby="principles-title">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <SysLabel index="02">{principles.eyebrow}</SysLabel>
          <h2 id="principles-title" className={`${headline} mt-6`}>
            <DecodeText text={principles.title} onView step={0.035} scramble={0.35} />
          </h2>
          <PrincipleCards />
        </div>
      </section>

      {/* Operational history */}
      <section className="tone-a relative" aria-labelledby="milestones-title">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SysLabel index="03">{milestones.eyebrow}</SysLabel>
              <h2 id="milestones-title" className={`${headline} mt-6`}>
                <DecodeText text={milestones.title} onView step={0.035} scramble={0.35} />
              </h2>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Timeline />
          </div>
        </div>
      </section>

      <BackedBy />

      {/* Work with us */}
      <section className="tone-b relative overflow-hidden" aria-labelledby="work-title">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <SysLabel index="04">{workWithUs.eyebrow}</SysLabel>
          <h2 id="work-title" className={`${headline} mt-6 max-w-3xl`}>
            <DecodeText text={workWithUs.title} onView step={0.035} scramble={0.35} cursor />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{workWithUs.body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/contact">Get in touch</ButtonLink>
              <CatalogueButton variant="ghost" doc={companyProfile} />
              <ButtonLink href={`mailto:${contact.email}`} variant="ghost">
                {contact.email}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
