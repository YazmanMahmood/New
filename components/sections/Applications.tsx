"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { Reveal } from "@/components/ui/Reveal";
import { applications } from "@/data/home";

const ease = [0.16, 1, 0.3, 1] as const;

/** Where the stack is used, one card per application. */
export function Applications() {
  const reduce = useReducedMotion();

  return (
    <section id="applications" className="tone-b relative scroll-mt-16" aria-labelledby="applications-title">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>{applications.eyebrow}</Eyebrow>
            <h2
              id="applications-title"
              className="wide mt-6 text-[clamp(2.4rem,4.8vw,4.25rem)] font-bold leading-[1] tracking-[-0.03em]"
            >
              {applications.title}
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="text-lg leading-relaxed text-muted">{applications.intro}</p>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {applications.items.map((item, i) => (
            <motion.li
              key={item.title}
              className="theme-fade group flex flex-col border border-line transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-fg"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
            >
              <div className="overflow-hidden">
                {item.video ? (
                  <LoopVideo
                    sources={[{ src: `/videos/${item.video}.mp4`, type: "video/mp4" }]}
                    poster={`/videos/${item.video}-poster.webp`}
                    className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <ImageSlot
                    label={item.imageLabel}
                    ratio="16/9"
                    className="!border-0 transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="theme-fade flex flex-1 flex-col border-t border-line p-6 md:p-7">
                <span className="narrow text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">
                  {item.mission}
                </span>
                <h3 className="wide mt-3 text-xl font-bold tracking-tight md:text-2xl">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{item.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
