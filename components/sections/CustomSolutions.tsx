"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { customSolutions } from "@/data/home";

const ease = [0.16, 1, 0.3, 1] as const;

/*
  Custom-build process. The heading stays pinned on the left while the
  steps run down the right; a line fills as you scroll through them.
*/
export function CustomSolutions() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <section id="custom" className="tone-a relative scroll-mt-16" aria-labelledby="custom-title">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-32">
            <Eyebrow>{customSolutions.eyebrow}</Eyebrow>
            <h2
              id="custom-title"
              className="wide mt-6 text-[clamp(2.4rem,4.8vw,4.25rem)] font-bold leading-[1] tracking-[-0.03em]"
            >
              {customSolutions.title}
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{customSolutions.intro}</p>
            <div className="mt-10">
              <ButtonLink href="/contact">Start a project</ButtonLink>
            </div>
          </Reveal>
        </div>

        <ol ref={ref} className="relative lg:col-span-6 lg:col-start-7">
          <span aria-hidden className="theme-fade absolute bottom-6 left-[19px] top-6 w-px bg-line">
            <motion.span className="absolute inset-0 origin-top bg-accent" style={{ scaleY: reduce ? 1 : progress }} />
          </span>
          {customSolutions.steps.map((step, i) => (
            <motion.li
              key={step.title}
              className="relative grid grid-cols-[40px_1fr] gap-6 pb-12 last:pb-0 md:gap-8 md:pb-14"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 0.7, ease }}
            >
              <span className="theme-fade narrow relative grid h-10 w-10 place-items-center border border-accent bg-bg text-sm font-semibold tabular-nums text-accent-text">
                0{i + 1}
              </span>
              <div className="pt-1">
                <h3 className="wide text-2xl font-bold tracking-tight md:text-3xl">{step.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-muted">{step.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
