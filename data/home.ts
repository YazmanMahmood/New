// Homepage content. Edit text and numbers here without touching components.

export const hero = {
  eyebrow: "Autonomous UAV systems",
  title: "One autonomy stack for critical infrastructure.",
  intro:
    "Drones that fly, detect and report on their own, so one operator can watch a hundred sites. Built in Lahore.",
};

export const problem = {
  title: "Manual inspection can't keep up.",
  intro:
    "Pipelines, plants, grids and construction sites need continuous monitoring. Human-piloted drones do not scale across large, remote, repeated missions.",
  points: [
    {
      value: "1:1",
      label: "One operator per asset.",
      note: "Manual flight scales linearly with every new site.",
    },
    {
      value: "~2 wks",
      label: "Between inspection cycles.",
      note: "Anomalies develop unseen in the gaps.",
    },
    {
      value: "Late",
      label: "Problems found after they escalate.",
      note: "Every flight needs a pilot on site. Heat, distance and remote terrain limit how often sites are checked, so leaks, hot spots and intrusions surface between visits.",
    },
  ],
  closing: "The cost of watching everything manually is the opportunity.",
};

export const solution = {
  title: "One operator. A hundred assets.",
  today: "One pilot flies every mission by hand, one drone flies line-of-sight, and one asset gets checked every two weeks or so.",
  artemis: "One operator approves decisions. The autonomy stack flies, detects and reports. Over a hundred assets are watched around the clock.",
  stats: [
    { value: "100+", label: "assets supervised per operator" },
    { value: "24/7", label: "persistent autonomous coverage" },
    { value: "<1%", label: "manual piloting. AI flies, humans approve." },
    { value: "50–70%", label: "lower cost per acre covered*" },
  ],
  footnote: "*Artemis estimate, compared with manually piloted inspection.",
};

export const process = {
  eyebrow: "How it works",
  title: "From launch to report, without a pilot.",
  intro: "Every mission runs the same four steps. The stack does the flying; your operator makes the calls.",
  steps: [
    {
      icon: "launch",
      title: "Launch",
      body: "Drones leave the dock on a schedule, or the moment a sensor raises an alert.",
    },
    {
      icon: "fly",
      title: "Fly",
      body: "The autonomy stack plans the route and flies it, steering around obstacles on the way.",
    },
    {
      icon: "detect",
      title: "Detect",
      body: "Onboard AI flags leaks, heat, damage and intruders while the drone is still in the air.",
    },
    {
      icon: "report",
      title: "Report",
      body: "Findings reach your team as work orders or a live feed. An operator approves any response.",
    },
  ],
} as const;

export const capabilities = {
  eyebrow: "The stack",
  title: "Everything a mission needs, in one system.",
  intro: "The airframe changes with the mission. The software that flies it doesn't.",
  items: [
    {
      icon: "detect",
      title: "Onboard AI detection",
      body: "Spots leaks, hot spots, damage and intruders on the drone itself, in real time.",
    },
    {
      icon: "dock",
      title: "Auto-docking and charging",
      body: "Lands, recharges and relaunches from a weatherproof station, with no one on site.",
    },
    {
      icon: "operator",
      title: "Operator in the loop",
      body: "The AI flies and flags. A person approves every response that matters.",
    },
    {
      icon: "swarm",
      title: "Swarm coordination",
      body: "Many drones share one picture of the area and split the work between them.",
    },
  ],
} as const;

// An item with video: "name" plays /videos/name.mp4 (poster: /videos/name-poster.webp)
export const applications = {
  eyebrow: "Applications",
  title: "Where the stack goes to work.",
  intro: "The same autonomy runs every one of these jobs. Only the airframe and sensors change.",
  items: [
    {
      mission: "Industrial",
      title: "Pipeline monitoring",
      body: "Long routes flown on schedule to catch leaks, encroachment and ground movement early.",
      imageLabel: "Drone following a pipeline corridor",
    },
    {
      mission: "Industrial",
      title: "Power and grid inspection",
      body: "Lines, towers and substations checked for hot spots and damage without shutting anything down.",
      imageLabel: "Thermal view of a transmission tower",
      video: "solar-farm",
    },
    {
      mission: "Industrial",
      title: "Construction and smart cities",
      body: "Progress mapping, site surveys and city assets tracked flight after flight.",
      imageLabel: "Aerial map of a construction site",
      video: "site-mapping",
    },
    {
      mission: "Security",
      title: "Perimeter patrol",
      body: "Fences and gates patrolled day and night, with intruders flagged to the control room.",
      imageLabel: "Night patrol over a fenced perimeter",
      video: "perimeter-patrol",
    },
    {
      mission: "Security",
      title: "First response",
      body: "Drones reach an alarm or incident first and stream live video before a team arrives.",
      imageLabel: "Drone arriving at an incident",
    },
    {
      mission: "Defense",
      title: "Airspace protection",
      body: "Interceptors and wide-area swarms that guard a perimeter against hostile drones.",
      imageLabel: "Interceptor drone in flight",
    },
  ] as { mission: string; title: string; body: string; imageLabel: string; video?: string }[],
};

export const customSolutions = {
  eyebrow: "Custom solutions",
  title: "Built around your site.",
  intro: "Need something we don't list? We design custom systems with you and take them from first conversation to full deployment, one step at a time.",
  steps: [
    { title: "Plan", body: "We learn your site, your assets and what needs watching, then agree on goals and success measures." },
    { title: "Design", body: "We choose or adapt the airframe, sensors and docking, and map out routes and coverage." },
    { title: "Integrate", body: "We connect the system to your control room, cameras, alarms and work-order tools." },
    { title: "Demo", body: "We fly it over your own site so your team sees real results before committing." },
    { title: "Deploy", body: "We install the docks, train your operators and hand over a working system." },
    { title: "Support", body: "We monitor performance, ship updates and scale coverage as your needs grow." },
  ],
};

export const backers = {
  eyebrow: "Backed by",
  // Logos live in /public/images/backers; leave logo out to show the name instead
  items: [
    { name: "Ignite NIC Lahore", logo: "/images/backers/nic-lahore.png" },
    { name: "Pakistan Army", logo: "/images/backers/pakistan-army.png" },
    { name: "Ministry of IT & Telecom", logo: "/images/backers/moitt.png" },
    { name: "Tech Destination Pakistan", logo: "/images/backers/tech-destination-pakistan.png" },
  ] as { name: string; logo?: string }[],
};

export const cta = {
  eyebrow: "Get in touch",
  title: "See it fly over your site.",
  body: "Tell us what you need watched. We'll show you how the stack covers it, and how many sites one operator can run.",
};

export const contact = {
  // Main address, used in buttons, error messages and structured data
  email: "umair@artemisuav.com",
  // Who to reach for what: listed on the contact page, in the footer and in structured data
  teams: [
    { name: "Sales", email: "umair@artemisuav.com", phone: { display: "+92 310 4768835", href: "+923104768835" } },
    { name: "Support", email: "yazman@artemisuav.com", phone: { display: "+92 335 0952023", href: "+923350952023" } },
  ],
  address: "15 MM Alam Road, Vogue Towers, Gulberg III, Lahore, Pakistan",
  linkedin: "https://www.linkedin.com/company/artemisuav",
};
