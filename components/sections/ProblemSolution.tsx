"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { MissionMap } from "@/components/ui/MissionMap";
import { SiteGlobe, type GlobeStage } from "@/components/ui/SiteGlobe";
import { problem, solution } from "@/data/home";

/*
  Section 1: problem → solution.
  The text runs down one side; a visual stays pinned on the other. It shows a
  globe of mostly unwatched sites for the problem, then a live mission on a
  site map (authorize, take off, patrol, detect, alert) for the solution.
*/

export function ProblemSolution() {
  const solutionRef = useRef<HTMLDivElement>(null);
  const solutionInView = useInView(solutionRef, { margin: "0px 0px -50% 0px" });
  const stage: GlobeStage = solutionInView ? "solution" : "problem";
  const showMission = stage === "solution";

  return (
    <section id="problem" className="tone-a relative scroll-mt-16 !bg-none" aria-label="The problem and our solution">
      <div className="mx-auto grid max-w-7xl px-5 md:px-8 lg:grid-cols-12 lg:gap-12">
        {/* Pinned visual: globe (problem), mission map (solution) */}
        {/* Phones: the globe bar fades out once the solution starts (the mission plays inline there) */}
        <div className={`theme-fade sticky top-16 z-10 -mx-5 border-b border-line bg-bg px-5 py-3 md:-mx-8 md:px-8 lg:order-2 lg:col-span-6 lg:col-start-7 lg:mx-0 lg:flex lg:h-[calc(100svh-4rem)] lg:items-center lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 ${showMission ? "max-lg:invisible max-lg:opacity-0" : ""}`}>
          <div className="flex w-full items-center gap-5 lg:flex-col lg:items-stretch lg:gap-4">
            <div className="relative w-[104px] shrink-0 sm:w-[140px] lg:mx-auto lg:w-full lg:max-w-[min(620px,calc(100svh-9rem))]">
              <div className={`transition-opacity duration-700 ${showMission ? "lg:opacity-0" : ""}`}>
                <SiteGlobe stage={stage} />
              </div>
              {/* Desktop: the mission plays here; on mobile it sits inline in the solution text */}
              <div
                className={`absolute inset-0 hidden transition-opacity duration-700 lg:block ${
                  showMission ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <MissionMap active={showMission} />
              </div>
            </div>
            {/* Caption for the problem only; it fades out when the mission takes over */}
            <div
              className={`theme-fade min-w-0 flex-1 lg:flex lg:items-baseline lg:justify-between lg:gap-6 lg:border-t lg:border-line lg:pt-4 ${showMission ? "invisible opacity-0" : ""}`}
            >
              <p className="wide text-2xl font-bold tabular-nums lg:text-3xl">
                <span className="text-alarm">1</span>
                <span className="text-muted">/100</span>
                <span className="sr-only"> sites watched</span>
              </p>
              <p className="mt-1 text-sm leading-snug text-muted lg:mt-0 lg:text-right">One pilot, one site. The rest go unseen.</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="lg:order-1 lg:col-span-6">
          {/* Problem */}
          <div className="py-16 md:py-20 lg:py-24">
            <Reveal>
              <Eyebrow>The problem</Eyebrow>
              <h2 className="wide mt-6 text-[clamp(2.4rem,4.8vw,4.25rem)] font-bold leading-[1] tracking-[-0.03em]">
                {problem.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{problem.intro}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="theme-fade mt-12 divide-y divide-line border-y border-line">
                {problem.points.map((point) => (
                  <div key={point.value} className="grid items-baseline gap-2 py-6 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-5 md:grid-cols-[minmax(0,12rem)_1fr]">
                    <dt className="wide whitespace-nowrap text-3xl font-bold tracking-tight text-alarm md:text-4xl">
                      {point.value}
                    </dt>
                    <dd>
                      <p className="font-semibold">{point.label}</p>
                      <p className="mt-1 leading-relaxed text-muted">{point.note}</p>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="theme-fade mt-10 max-w-md border-l-2 border-alarm pl-5 text-xl font-medium leading-snug">
                {problem.closing}
              </p>
            </Reveal>
          </div>

          {/* Solution */}
          <div ref={solutionRef} className="pb-16 pt-4 md:pb-24 lg:pb-28 lg:pt-8">
            <Reveal>
              <Eyebrow>The solution</Eyebrow>
              <h2 className="wide mt-6 text-[clamp(2.4rem,4.8vw,4.25rem)] font-bold leading-[1] tracking-[-0.03em]">
                {solution.title}
              </h2>
              <dl className="mt-10 space-y-6">
                <div className="theme-fade border-l-2 border-line pl-5">
                  <dt className="text-sm text-muted">Today</dt>
                  <dd className="mt-1 leading-relaxed text-muted">{solution.today}</dd>
                </div>
                <div className="theme-fade border-l-2 border-signal pl-5">
                  <dt className="text-sm font-semibold text-signal">With Artemis</dt>
                  <dd className="mt-1 text-lg leading-relaxed">{solution.artemis}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal className="mt-10 lg:hidden">
              <MissionMap />
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="theme-fade mt-12 divide-y divide-line border-y border-line">
                {solution.stats.map((s) => (
                  <div key={s.label} className="grid items-baseline gap-2 py-6 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-5 md:grid-cols-[minmax(0,12rem)_1fr]">
                    <dt className="wide whitespace-nowrap text-3xl font-bold tracking-tight text-signal md:text-4xl">{s.value}</dt>
                    <dd className="text-muted">{s.label}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-xs text-muted">{solution.footnote}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

