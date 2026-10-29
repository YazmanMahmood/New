// Who sent a form: network (IP, area, ISP) and device details, stored with each entry.

export type Visitor = {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  /** VPN or proxy detected: "yes", "no" or "unknown" */
  proxy: string;
  device: string;
  os: string;
  browser: string;
  userAgent: string;
  language: string;
  screen: string;
  timezone: string;
  referrer: string;
};

const unknown = "unknown";

type Network = Pick<Visitor, "ip" | "city" | "region" | "country" | "isp" | "proxy">;

const countryName = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

/** Looks up IP and area. Tries two free services (both allow browser requests), gives up after a few seconds each. */
async function lookupNetwork(): Promise<Network> {
  const timeout = () => AbortSignal.timeout(4000);
  try {
    const r = await fetch("https://ipinfo.io/json", { signal: timeout() });
    if (r.ok) {
      const j = await r.json();
      if (j.ip && !j.bogon)
        return {
          ip: j.ip,
          city: j.city || unknown,
          region: j.region || unknown,
          country: j.country ? countryName(j.country) : unknown,
          isp: j.org || unknown,
          proxy: unknown,
        };
    }
  } catch {}
  try {
    const r = await fetch("https://free.freeipapi.com/api/v1/json", { signal: timeout() });
    if (r.ok) {
      const j = await r.json();
      if (j.ipAddress)
        return {
          ip: j.ipAddress,
          city: j.cityName || unknown,
          region: j.regionName || unknown,
          country: j.countryName || unknown,
          isp: j.asnOrganization || unknown,
          proxy: typeof j.isProxy === "boolean" ? (j.isProxy ? "yes" : "no") : unknown,
        };
    }
  } catch {}
  return { ip: unknown, city: unknown, region: unknown, country: unknown, isp: unknown, proxy: unknown };
}

/** Readable device, OS and browser from the user agent. */
function describeDevice(ua: string) {
  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? "Tablet" : /Mobi|iPhone|Android/i.test(ua) ? "Mobile" : "Desktop";
  const os =
    /Windows NT 10/.test(ua) ? "Windows 10/11"
    : /Windows/.test(ua) ? "Windows"
    : /iPhone|iPad|iPod/.test(ua) ? `iOS ${ua.match(/OS (\d+)[._]/)?.[1] ?? ""}`.trim()
    : /Mac OS X/.test(ua) ? "macOS"
    : /Android/.test(ua) ? `Android ${ua.match(/Android (\d+)/)?.[1] ?? ""}`.trim()
    : /CrOS/.test(ua) ? "ChromeOS"
    : /Linux/.test(ua) ? "Linux"
    : unknown;
  const browser =
    /Edg\/(\d+)/.test(ua) ? `Edge ${ua.match(/Edg\/(\d+)/)![1]}`
    : /OPR\/(\d+)/.test(ua) ? `Opera ${ua.match(/OPR\/(\d+)/)![1]}`
    : /SamsungBrowser\/(\d+)/.test(ua) ? `Samsung Internet ${ua.match(/SamsungBrowser\/(\d+)/)![1]}`
    : /Firefox\/(\d+)/.test(ua) ? `Firefox ${ua.match(/Firefox\/(\d+)/)![1]}`
    : /Chrome\/(\d+)/.test(ua) ? `Chrome ${ua.match(/Chrome\/(\d+)/)![1]}`
    : /Version\/(\d+).*Safari/.test(ua) ? `Safari ${ua.match(/Version\/(\d+)/)![1]}`
    : unknown;
  return { device, os, browser };
}

export async function getVisitor(): Promise<Visitor> {
  const ua = navigator.userAgent;
  return {
    ...(await lookupNetwork()),
    ...describeDevice(ua),
    userAgent: ua.slice(0, 500),
    language: navigator.language || unknown,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || unknown,
    referrer: document.referrer.slice(0, 300) || "direct",
  };
}
