import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PlatformPage } from "@/components/platform/PlatformPage";

export const metadata: Metadata = pageMetadata({
  title: "Autonomy platform",
  description:
    "One in-house autonomy stack runs every Artemis drone: flight control, AI perception and autonomy, fleet and mission management, with a human operator in the loop.",
  path: "/platform",
});

export default function Platform() {
  return <PlatformPage />;
}
