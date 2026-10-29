/*
  Emails the team when someone sends the contact form. The browser saves the
  message to Firebase first (lib/entries.ts); this sends the alert, and is the
  backup if that save fails.

  Uses Resend (resend.com). Set in the server environment:
    RESEND_API_KEY       API key
    CONTACT_NOTIFY_TO    where alerts go; comma-separate several addresses
    CONTACT_NOTIFY_FROM  optional sender on a domain verified in Resend,
                         default "Artemis UAV website <website@artemisuav.com>"
  Without the first two it does nothing and answers 204.
*/

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

/** At most a few messages per IP every ten minutes, per server instance. */
function rateLimited(ip: string) {
  const now = Date.now();
  if (recent.size > 5000) recent.clear();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_TO;
  if (!apiKey || !to) return new Response(null, { status: 204 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return new Response(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  // Honeypot: the hidden "website" field is only ever filled in by bots
  if (text(body.website, 200)) return new Response(null, { status: 202 });

  const name = text(body.name, 200).replace(/[\r\n]+/g, " ");
  const email = text(body.email, 320);
  const message = text(body.message, 5000);
  const entry = text(body.entry, 40);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(null, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_NOTIFY_FROM || "Artemis UAV website <website@artemisuav.com>",
      to: to.split(",").map((s) => s.trim()),
      reply_to: email,
      subject: `Website message from ${name}`,
      text: [
        message,
        "",
        `From: ${name} <${email}>`,
        `IP: ${ip}`,
        entry ? `Saved in Firebase as Submissions/${entry}` : "Not saved in Firebase (the save failed); this email is the only copy.",
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  return new Response(null, { status: res?.ok ? 202 : 502 });
}
