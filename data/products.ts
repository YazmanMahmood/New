export type Mode = "industrial" | "security" | "defense";

/** Full product catalogue, served from /public */
export const catalogue = {
  href: "/ArtemisUAV-Product-Catalogue.pdf",
  /** Name the file is saved under */
  fileName: "ArtemisUAV_Product_Catalogue_2026.pdf",
  label: "Product catalogue 2026",
};

export type Product = {
  slug: string;
  name: string;
  description: string;
  specs: { label: string; value: string }[];
  useCases?: string[];
  /** Numbers for the spec showdown on /products; leave a stat out if it does not apply */
  stats?: Partial<Record<StatKey, number>>;
  imageLabel: string;
  /** Photo in /public/images; the placeholder shows until one is set */
  image?: string;
};

export type StatKey = "speed" | "endurance" | "range" | "payload";

export const statKeys: { id: StatKey; label: string; unit: string }[] = [
  { id: "speed", label: "Top speed", unit: "km/h" },
  { id: "endurance", label: "Endurance", unit: "min" },
  { id: "range", label: "Range", unit: "km" },
  { id: "payload", label: "Payload", unit: "kg" },
];

export const missions: {
  id: Mode;
  name: string;
  line: string;
  headline: string;
  body: string;
}[] = [
  {
    id: "industrial",
    name: "Industrial",
    line: "Inspection for energy, utilities, construction and smart-city sites.",
    headline: "Inspection that doesn't wait for a pilot.",
    body: "Docked and long-range drones fly scheduled routes over plants, pipelines and grids, flag leaks, heat and damage, and send findings to your team as work orders.",
  },
  {
    id: "security",
    name: "Security",
    line: "Patrol, first response and public safety, day and night.",
    headline: "Eyes on site, around the clock.",
    body: "Drones launch on schedule or on alert, stream live video to your control room, and wait for an operator to approve any response.",
  },
  {
    id: "defense",
    name: "Defense",
    line: "Interception and wide-area coverage in contested airspace.",
    headline: "Built for contested airspace.",
    body: "Autonomous platforms that keep working when GPS is jammed, from interceptors that protect a perimeter to swarms that cover wide areas.",
  },
];

// Specs and use cases follow the 2026 product catalogue (public/ArtemisUAV-Product-Catalogue.pdf).
// The homepage shows the first three specs, so list the major ones first.
const droneInABoxSpecs = [
  { label: "Endurance", value: "Up to 45 min" },
  { label: "Range", value: "Up to 30 km, unlimited via 4G" },
  { label: "Cruise speed", value: "Up to 70 km/h" },
  { label: "Cameras", value: "Daylight / thermal / night vision" },
  { label: "Docking", value: "Auto launch, land and dock" },
  { label: "Navigation", value: "Waypoint" },
  { label: "Readiness", value: "24/7 operation" },
  { label: "Integration", value: "Existing site systems" },
];

export const products: Record<Mode, Product[]> = {
  industrial: [
    {
      slug: "drone-in-a-box",
      name: "Drone-in-a-Box",
      description:
        "Persistent surveillance and rapid response from a self-contained dock, built to run around the clock. The dock launches, recovers and recharges its drone with no one on site, flies scheduled patrols or answers alerts, and connects to the infrastructure a site already runs.",
      specs: droneInABoxSpecs,
      useCases: ["Critical infrastructure monitoring", "Routine inspections", "Area surveillance", "Perimeter security"],
      stats: { speed: 70, endurance: 45, range: 30 },
      imageLabel: "Drone-in-a-Box station, lid open",
      image: "/images/DIAB.jpeg",
    },
    {
      slug: "long-range-vtol",
      name: "Long-Range VTOL",
      description:
        "Takes off like a multirotor and cruises like an aircraft, with no runway or launcher, so it can operate from small, remote sites. It flies its route autonomously while Artemis AI flags leaks, hot spots, intrusions and damage, and findings go to site teams as work orders.",
      specs: [
        { label: "Range", value: "Up to 150 km" },
        { label: "Flight time", value: "Up to 1.5 h" },
        { label: "Cruise speed", value: "Up to 160 km/h" },
        { label: "Airframe", value: "Fixed-wing VTOL, V-tail" },
        { label: "Cameras", value: "Normal, thermal, optical zoom, analog FPV" },
        { label: "Take-off", value: "Vertical, no runway" },
      ],
      useCases: ["Pipeline patrol and leak detection", "Power-line and grid inspection", "Corridor mapping"],
      stats: { speed: 160, endurance: 90, range: 150 },
      imageLabel: "Long-Range VTOL in flight",
      image: "/images/VTOL.jpeg",
    },
  ],
  security: [
    {
      slug: "drone-in-a-box",
      name: "Drone-in-a-Box Patrol",
      description:
        "Runs perimeter patrols around the clock, tracks and traces intruders with onboard AI, and launches on demand when an alarm goes off.",
      specs: droneInABoxSpecs,
      useCases: ["Perimeter security", "Area surveillance", "Rapid-response deployment", "Track and trace"],
      stats: { speed: 70, endurance: 45, range: 30 },
      imageLabel: "Drone-in-a-Box on perimeter patrol",
      image: "/images/DIAB.jpeg",
    },
  ],
  defense: [
    {
      slug: "ai-interceptor",
      name: "AI Interceptor",
      description:
        "A fast, AI-assisted interceptor for perimeter security and response to aerial threats. Its vertical-launch, rocket-style airframe pairs Artemis AI perception with a low-latency analog video link, and an operator approves every response. Delivered to 5 Corps, Karachi.",
      specs: [
        { label: "Top speed", value: "Up to 230 km/h" },
        { label: "Flight time", value: "Up to 20 min" },
        { label: "Camera", value: "Analog FPV" },
        { label: "Airframe", value: "Vertical launch, 4 rotors" },
        { label: "Guidance", value: "AI-assisted tracking" },
        { label: "Control", value: "Operator-approved" },
      ],
      useCases: ["Perimeter security", "Counter-drone response", "Critical site protection"],
      stats: { speed: 230, endurance: 20 },
      imageLabel: "AI Interceptor",
      image: "/images/Interceptor.jpg",
    },
    {
      slug: "mortar-dropping-drone",
      name: "Mortar Dropping Drone",
      description:
        "Heavy-lift drone for mortar delivery, built as a hexacopter or quadcopter to suit payload and mission. Rounds ride in a quick-load rack beneath the airframe and are released only on operator command, with Artemis flight control and mission logging.",
      specs: [
        { label: "Flight time", value: "Up to 40 min" },
        { label: "Operating altitude", value: "Up to 1,000 m" },
        { label: "Speed", value: "Up to 80 km/h" },
        { label: "Airframe", value: "Hexa or quad, per use case" },
        { label: "Payload", value: "Mortar rounds, calibre on request" },
        { label: "Release", value: "Operator-commanded" },
      ],
      useCases: ["Defense forces"],
      stats: { speed: 80, endurance: 40 },
      imageLabel: "Mortar dropping drone releasing a round",
      image: "/images/Mortar dropping drone.jpeg",
    },
    {
      slug: "swarm",
      name: "Swarm Drones",
      description:
        "Many drones, one mission. They launch automatically, form up and split the work between them, and because the intelligence is spread across the group there is no single point of failure.",
      specs: [
        { label: "Formation size", value: "Up to 45 drones" },
        { label: "Flight endurance", value: "Up to 45 min" },
        { label: "Max speed", value: "Up to 80 km/h" },
        { label: "Payload", value: "Up to 1 kg per drone" },
        { label: "Formation modes", value: "Line / pincer / saturation" },
        { label: "Autonomy", value: "Auto launch and formation flight" },
      ],
      useCases: ["Wide-area coverage", "Defense operations", "Collaborative target assignment"],
      stats: { speed: 80, endurance: 45, payload: 1 },
      imageLabel: "Drone swarm formation",
      image: "/images/Swarm.png",
    },
    {
      slug: "kamikaze-fpv",
      name: "Kamikaze FPV",
      description:
        "One FPV family, five to fifteen inches, so the airframe can be matched to the job. Smaller frames are quicker and lighter; larger frames fly longer and carry more. Every size runs Artemis in-house flight control and is flown by a trained operator over a live first-person video link.",
      specs: [
        { label: "Frame sizes", value: "5 to 15 inch" },
        { label: "Flight time", value: "20 to 40 min" },
        { label: "Payload", value: "300 g to 3 kg" },
        { label: "Max speed", value: "40 to 120 km/h" },
        { label: "Video", value: "Low-latency FPV" },
        { label: "Control", value: "Operator-piloted" },
      ],
      useCases: ["Defense forces", "Security forces"],
      stats: { speed: 120, endurance: 40, payload: 3 },
      imageLabel: "Kamikaze FPV family, 5 to 15 inch",
      image: "/images/Kamakaze.png",
    },
    {
      slug: "trainer-drone",
      name: "Trainer Drone",
      description:
        "Low-cost, impact-resistant drone for pilot instruction and tactical simulation, with full propeller guards and progressive control sensitivity.",
      specs: [
        { label: "Endurance", value: "Up to 25 min" },
        { label: "Max speed", value: "40 km/h" },
        { label: "Max altitude", value: "100 m" },
        { label: "Structure", value: "Impact-resistant" },
      ],
      useCases: ["Pilot skill development", "Tactical maneuver training", "Indoor flight drills", "Operator certification"],
      stats: { speed: 40, endurance: 25 },
      imageLabel: "Trainer drone with propeller guards",
    },
  ],
};

export type CatalogueProduct = Product & { missions: Mode[] };

/**
 * Every product once, with the missions it serves. A product listed under
 * several missions keeps its first listing's text and gathers every use case.
 */
export const allProducts: CatalogueProduct[] = (() => {
  const bySlug = new Map<string, CatalogueProduct>();
  for (const mission of missions) {
    for (const product of products[mission.id]) {
      const seen = bySlug.get(product.slug);
      if (!seen) {
        bySlug.set(product.slug, { ...product, missions: [mission.id] });
        continue;
      }
      seen.missions.push(mission.id);
      if (product.useCases) {
        seen.useCases = [...new Set([...(seen.useCases ?? []), ...product.useCases])];
      }
    }
  }
  return [...bySlug.values()];
})();

export function getProduct(slug: string) {
  return allProducts.find((p) => p.slug === slug);
}

export const productsPage = {
  eyebrow: "Products",
  title: "The fleet.",
  intro:
    "Every platform runs one autonomy stack and is built to order. Browse the fleet, or tell us what you need and we will configure one for your mission.",
};

export const services = {
  eyebrow: "Services",
  title: "Drone repair and upgrades.",
  intro:
    "Maintenance, diagnostics and upgrades that keep UAV fleets mission-ready, extend their life and lift their performance.",
  groups: [
    {
      title: "Repair and maintenance",
      items: [
        "Full drone diagnostics and fault detection",
        "Hardware repair: motors, ESCs, frames and electronics",
        "Flight controller and avionics troubleshooting",
        "Communication link and GPS restoration",
        "Battery health checks and recovery",
        "Rapid field and workshop support",
      ],
    },
    {
      title: "Upgrades and enhancements",
      items: [
        "Performance tuning for stability, response and endurance",
        "Payload integration: cameras, sensors and mission systems",
        "Autonomy upgrades: AI-assisted flight and navigation",
        "Range and communication improvements",
        "Structural reinforcement and mission-specific mods",
      ],
    },
  ],
};

/** Short fleet code shown on /products, e.g. "AU-03" */
export function fleetCode(slug: string) {
  return `AU-${String(allProducts.findIndex((p) => p.slug === slug) + 1).padStart(2, "0")}`;
}

/**
 * Jobs for the mission matcher on /products.
 * List the best-suited product first; order sets how strongly each one matches.
 */
export const jobs: { id: string; label: string; slugs: string[] }[] = [
  { id: "corridors", label: "Pipelines and corridors", slugs: ["long-range-vtol", "drone-in-a-box"] },
  { id: "sites", label: "Plants and industrial sites", slugs: ["drone-in-a-box", "long-range-vtol"] },
  { id: "perimeter", label: "Fences and perimeters", slugs: ["drone-in-a-box", "long-range-vtol"] },
  { id: "incidents", label: "Incidents and crowds", slugs: ["drone-in-a-box"] },
  { id: "airspace", label: "Hostile drones", slugs: ["ai-interceptor", "swarm"] },
  { id: "payload", label: "Precision payload delivery", slugs: ["mortar-dropping-drone", "swarm"] },
  { id: "training", label: "Training new pilots", slugs: ["trainer-drone"] },
];
