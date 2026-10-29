import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { Hero } from "@/components/sections/Hero";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Applications } from "@/components/sections/Applications";
import { Capabilities } from "@/components/sections/Capabilities";
import { MissionSelector } from "@/components/sections/MissionSelector";
import { CustomSolutions } from "@/components/sections/CustomSolutions";
import { BackedBy } from "@/components/sections/BackedBy";
import { CallToAction } from "@/components/sections/CallToAction";

export const metadata: Metadata = pageMetadata({
  description:
    "Artemis UAV builds AI-native autonomous drones for industrial inspection, security and defense: drone-in-a-box, long-range VTOL, AI interceptors and swarms.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Problem → solution, told on a globe of watched sites */}
      <ProblemSolution />
      {/* Launch → fly → detect → report */}
      <HowItWorks />
      {/* Where the stack is used */}
      <Applications />
      {/* What the autonomy stack does */}
      <Capabilities />
      {/* Mission selector: re-themes the site and shows that mission's drones */}
      <MissionSelector />
      {/* Plan → design → integrate → demo → deploy → support */}
      <CustomSolutions />
      {/* NIC Lahore, Pakistan Army, MoITT, Tech Destination Pakistan */}
      <BackedBy />
      <CallToAction />
    </>
  );
}
