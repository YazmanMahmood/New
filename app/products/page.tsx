import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { FleetCatalogue } from "@/components/products/FleetCatalogue";
import { CustomizationRequest } from "@/components/products/CustomizationRequest";
import { FleetLineup } from "@/components/products/FleetLineup";
import { RepairServices } from "@/components/products/RepairServices";
import { CallToAction } from "@/components/sections/CallToAction";

export const metadata: Metadata = pageMetadata({
  title: "Autonomous drones and UAV platforms",
  description:
    "Drone-in-a-Box, Long-Range VTOL, AI Interceptor, mortar dropping drone, swarm drones and more. Autonomous UAV platforms for industrial inspection, security and defense.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      {/* Every platform as a card, filterable by mission */}
      <FleetCatalogue />
      {/* Base platform + what to change → emailed customization request */}
      <CustomizationRequest />
      {/* Sortable comparison table */}
      <FleetLineup />
      <RepairServices />
      <CallToAction />
    </>
  );
}
