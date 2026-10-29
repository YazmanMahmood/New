import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ShareCard } from "@/components/seo/ShareCard";

// Default share image for every page without its own. Rendered at build time.
export const alt = "Artemis UAV: autonomous drones for critical infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo-white.png"));
  return new ImageResponse(<ShareCard logo={logo} kicker="Industrial · Security · Defense" title="Autonomous drones for critical infrastructure." />, size);
}
