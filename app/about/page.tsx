import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { AboutPage } from "@/components/about/AboutPage";

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description:
    "Artemis builds fully autonomous drone platforms for high-stakes response, minimizing human exposure. Founded in Lahore, Pakistan in 2024.",
  path: "/about",
});

export default function About() {
  return <AboutPage />;
}
