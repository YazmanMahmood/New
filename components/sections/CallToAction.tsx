import { AmbientCanvas } from "@/components/ui/AmbientCanvas";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { contact, cta } from "@/data/home";

export function CallToAction() {
  return (
    <section className="tone-a relative overflow-hidden !bg-none" aria-labelledby="cta-title">
      <div aria-hidden className="absolute inset-0">
        <AmbientCanvas variant="radar" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--bg) 20%, color-mix(in srgb, var(--bg) 55%, transparent) 55%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-48 pt-16 md:px-8 lg:py-28">
        <Reveal>
          <Eyebrow>{cta.eyebrow}</Eyebrow>
          <h2
            id="cta-title"
            className="wide mt-6 max-w-[14ch] text-[clamp(2.6rem,5.4vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.03em]"
          >
            {cta.title}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{cta.body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Book a demo</ButtonLink>
            <ButtonLink href={`mailto:${contact.email}`} variant="ghost">
              {contact.email}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
