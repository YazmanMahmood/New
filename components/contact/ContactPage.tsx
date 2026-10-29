"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { contact } from "@/data/home";
import { saveEntry } from "@/lib/entries";
import { track } from "@/lib/analytics";

/*
  Contact: the ways to reach us and a short message form. Lahore's local
  time ticks beside a pulsing signal so visitors know when we're likely to pick up.
*/

const ease = [0.16, 1, 0.3, 1] as const;

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`;

type Channel = { label: string; value: string; href: string; copy?: string; external?: boolean };

const channels: Channel[] = [
  ...contact.teams.flatMap((t) => [
    { label: `${t.name} · Email`, value: t.email, href: `mailto:${t.email}`, copy: t.email },
    { label: `${t.name} · Phone`, value: t.phone.display, href: `tel:${t.phone.href}`, copy: t.phone.display },
  ]),
  { label: "Office", value: contact.address, href: mapsHref, external: true },
  { label: "LinkedIn", value: "Artemis UAV", href: contact.linkedin, external: true },
];

const field =
  "theme-fade w-full border-0 border-b border-line bg-transparent py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-muted hover:border-fg focus:border-accent";

/** Lahore local time, filled in after mount so server and client markup match. */
function LahoreClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="narrow flex items-center gap-3 text-sm text-muted">
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-accent opacity-60 animate-ping" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      Lahore
      <span className="tabular-nums text-fg">{time ?? "--:--:--"}</span>
      PKT
    </p>
  );
}

/** Copies text and briefly confirms. */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      // Clipboard blocked; the link next to it still works
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="theme-fade narrow relative inline-flex h-10 min-w-[4.5rem] cursor-pointer items-center justify-center overflow-hidden border border-line px-3 text-xs font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:border-fg hover:text-fg"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={done ? "done" : "copy"}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={done ? "text-accent-text" : ""}
        >
          {done ? "Copied" : "Copy"}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {done ? `${label} copied` : ""}
      </span>
    </button>
  );
}

export function ContactPage() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Each block rises into place a beat after the one before. Reduced motion
  // keeps the same start state (so server and client markup match) but jumps straight to the end.
  const rise = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { duration: 0.8, delay: 0.1 + i * 0.1, ease },
  });

  // Saved to Firebase as Submissions/submissionN (see lib/entries.ts), then
  // /api/contact emails the team. Either one getting through counts as sent.
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    // Honeypot: people never see this field, bots fill it in
    if (get("website")) return setStatus("sent");
    setStatus("sending");
    const fields = { name: get("name"), email: get("email"), message: get("message") };
    const entry = await saveEntry("submission", fields).catch(() => null);
    const emailed = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, entry }),
    })
      .then((r) => r.status === 202)
      .catch(() => false);
    if (entry || emailed) {
      form.reset();
      setStatus("sent");
      track("generate_lead", { form: "contact" });
    } else {
      setStatus("error");
    }
  };

  return (
    <section className="tone-a relative min-h-screen overflow-hidden" aria-labelledby="contact-title">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-24 md:px-8 md:pb-28 md:pt-32">
        {/* Heading and local time */}
        <motion.div {...rise(0)} className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="tag">Contact</p>
            <h1 id="contact-title" className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
              Open a channel.
            </h1>
          </div>
          <LahoreClock />
        </motion.div>

        <div className="theme-fade mt-10 grid grid-cols-1 gap-14 border-t border-line pt-10 md:mt-12 md:pt-12 lg:grid-cols-12 lg:gap-12">
          {/* Ways to reach us */}
          <motion.ul {...rise(1)} className="lg:col-span-5">
            {channels.map((c) => (
              <li key={c.href}className="theme-fade flex items-center justify-between gap-4 border-b border-line py-5 first:pt-0">
                <div className="min-w-0">
                  <p className="narrow text-xs uppercase tracking-[0.16em] text-muted">{c.label}</p>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="group mt-1.5 inline-flex items-start gap-2 text-base leading-snug transition-colors hover:text-accent-text"
                  >
                    {c.value}
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="mt-1.5 h-3 w-3 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M4 12L12 4M6 4h6v6" />
                    </svg>
                  </a>
                </div>
                {c.copy && <CopyButton text={c.copy} label={c.label.toLowerCase()} />}
              </li>
            ))}
            <li className="pt-6 text-sm leading-relaxed text-muted">
              Need a drone built for your mission?{" "}
              <Link href="/products#customize" className="font-medium text-accent-text underline-offset-4 hover:underline">
                Send a customization request
              </Link>
              .
            </li>
          </motion.ul>

          {/* Short message */}
          <motion.form {...rise(2)} onSubmit={submit} className="lg:col-span-6 lg:col-start-7">
            <p className="narrow text-xs uppercase tracking-[0.16em] text-muted">Or leave a message</p>
            <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
              <label className="block">
                <span className="sr-only">Name</span>
                <input name="name" required maxLength={200} autoComplete="name" placeholder="Name" className={field} />
              </label>
              <label className="block">
                <span className="sr-only">Email</span>
                <input name="email" type="email" required maxLength={320} autoComplete="email" placeholder="Email" className={field} />
              </label>
            </div>
            <label className="block">
              <span className="sr-only">Message</span>
              <textarea name="message" required maxLength={5000} rows={4} placeholder="What can we help with?" className={`${field} resize-y`} />
            </label>
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="theme-fade group inline-flex h-12 cursor-pointer items-center gap-3 bg-accent px-6 text-[15px] font-medium text-accent-ink transition-[filter] hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
              >
                {status === "sending" ? "Sending…" : "Send"}
                <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </button>
              <AnimatePresence mode="wait">
                {(status === "sent" || status === "error") && (
                  <motion.p
                    key={status}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm ${status === "error" ? "text-alarm" : "text-muted"}`}
                    aria-live="polite"
                  >
                    {status === "sent" ? "Message sent. We'll get back to you soon." : `Couldn't send. Try again, or email ${contact.email}.`}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              With your message we record your IP address, approximate location and device, to handle enquiries and prevent abuse.
              See our{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-fg">
                privacy policy
              </Link>
              .
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
