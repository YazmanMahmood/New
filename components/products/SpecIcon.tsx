// Line icons for product specs, matched on the spec label
const specIcons = {
  time: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0", "M12 7v5l3 2"],
  range: ["M12 20v-6", "M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M7.5 16.5a6.4 6.4 0 0 1 0-9M16.5 7.5a6.4 6.4 0 0 1 0 9", "M4.6 19.4a10.5 10.5 0 0 1 0-14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8"],
  speed: ["M4 17a8 8 0 1 1 16 0", "M12 17l4-5", "M3 17h2M19 17h2"],
  payload: ["M4 8l8-4 8 4v8l-8 4-8-4z", "M4 8l8 4 8-4", "M12 12v8"],
  altitude: ["M3 20l6-10 4 6 3-4 5 8z", "M16 4v5M14 6l2-2 2 2"],
  sensor: ["M3 8h4l2-3h6l2 3h4v11H3z", "M9 13a3 3 0 1 0 6 0a3 3 0 1 0-6 0"],
  airframe: ["M12 3v18", "M3 11l9-2 9 2", "M8 20l4-2 4 2"],
  launch: ["M4 20h16", "M12 16V4", "M8 8l4-4 4 4"],
  wind: ["M3 9h12a3 3 0 1 0-3-3", "M3 15h15a3 3 0 1 1-3 3"],
  spec: ["M5 12l5 5 9-10"],
};

function pathsFor(label: string) {
  const l = label.toLowerCase();
  if (/time|endurance/.test(l)) return specIcons.time;
  if (/range/.test(l)) return specIcons.range;
  if (/wind/.test(l)) return specIcons.wind;
  if (/speed/.test(l)) return specIcons.speed;
  if (/payload/.test(l)) return specIcons.payload;
  if (/altitude/.test(l)) return specIcons.altitude;
  if (/sensor|camera|video/.test(l)) return specIcons.sensor;
  if (/frame|structure|formation/.test(l)) return specIcons.airframe;
  if (/launch|take-off|docking|deployment/.test(l)) return specIcons.launch;
  return specIcons.spec;
}

export function SpecIcon({ label, className = "h-5 w-5" }: { label: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`theme-fade shrink-0 text-accent-text ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {pathsFor(label).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
