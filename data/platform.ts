// Platform page content. Wording follows the 2026 product catalogue (public/ArtemisUAV-Product-Catalogue.pdf).

export const platform = {
  eyebrow: "Platform",
  title: "One stack. Every airframe.",
  intro:
    "Every Artemis drone runs on the same in-house stack of AI perception, flight control and fleet software. The aircraft change to fit the mission; the intelligence stays the same, and a human operator stays in charge.",
};

/** The stack, top to bottom, as in the catalogue. */
export const layers = [
  {
    id: "human",
    number: "04",
    title: "Human in the loop",
    body: "Routine flights run on their own. An operator approves any response to an alert.",
    points: [
      "Operator approves every response",
      "Payload release only on operator command",
      "Alerts reach the control room for review",
    ],
  },
  {
    id: "fleet",
    number: "03",
    title: "Fleet & mission management",
    body: "Scheduling, multi-site operations and reporting.",
    points: [
      "Scheduled patrols and on-demand launches",
      "Many sites run from one control layer",
      "Findings sent to site teams as work orders",
    ],
  },
  {
    id: "perception",
    number: "02",
    title: "AI perception & autonomy",
    body: "AI models, computer vision and autonomy algorithms.",
    points: [
      "Flags leaks, hot spots, intrusions and damage",
      "Anomaly detection with track and trace",
      "Decentralized swarm intelligence",
    ],
  },
  {
    id: "flight",
    number: "01",
    title: "Flight control",
    body: "In-house control software and flight systems.",
    points: [
      "Auto launch, land and docking",
      "Waypoint navigation for repeatable routes",
      "Runs every airframe, from 5-inch FPV to fixed-wing VTOL",
    ],
  },
];

export const platformStats = [
  { value: "Up to 100", label: "assets supervised by one operator" },
  { value: "24/7", label: "persistent autonomous coverage" },
];
