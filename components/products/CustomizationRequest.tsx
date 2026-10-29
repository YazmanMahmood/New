"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { contact } from "@/data/home";
import { saveEntry } from "@/lib/entries";

/*
  Customization request: range, drone type, usage and notes, then contact
  details. Saved to Firebase as CustomOrders/customorderN (see lib/entries.ts).
*/

const field =
  "theme-fade mt-4 w-full border border-line bg-bg px-4 py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-muted hover:border-fg focus:border-accent";
const question = "wide block text-lg font-bold tracking-tight";
const labelText = "narrow text-sm font-medium text-muted";

export function CustomizationRequest() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    // Honeypot: people never see this field, bots fill it in
    if (get("website")) return setStatus("sent");
    setStatus("sending");
    try {
      await saveEntry("customorder", {
        request: { rangeKm: Number(get("range")), droneType: get("type"), usage: get("usage"), notes: get("notes") },
        contact: { name: get("name"), email: get("email"), phone: get("phone") },
      });
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="customize" className="tone-b relative scroll-mt-20" aria-labelledby="customize-title">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Customization</Eyebrow>
            <h2 id="customize-title" className="wide mt-5 text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
              Built to order, configured for your mission.
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="leading-relaxed text-muted">
              Tell us how far it needs to fly, what kind of drone and what it&apos;s for. Our engineers will come back with a configuration and lead time.
            </p>
          </Reveal>
        </div>

        <form onSubmit={submit} className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 md:mt-12 lg:grid-cols-12">
          {/* The request */}
          <div className="space-y-8 lg:col-span-7">
            <label className="block">
              <span className={question}>1. Range</span>
              <span className="relative block">
                <input
                  name="range"
                  type="number"
                  required
                  min={0.1}
                  max={100000}
                  step="any"
                  inputMode="decimal"
                  placeholder="How far from base it needs to fly"
                  className={`${field} pr-14`}
                />
                <span className="narrow pointer-events-none absolute bottom-3 right-4 text-[15px] text-muted">km</span>
              </span>
            </label>

            <label className="block">
              <span className={question}>2. Type</span>
              <input name="type" required maxLength={200} placeholder="e.g. multirotor, fixed-wing VTOL, FPV" className={field} />
            </label>

            <label className="block">
              <span className={question}>3. Usage</span>
              <input name="usage" required maxLength={500} placeholder="What the drone will do" className={field} />
            </label>

            <label className="block">
              <span className={question}>4. Notes</span>
              <textarea
                name="notes"
                maxLength={5000}
                rows={5}
                placeholder="Payload, flight time, cameras, quantity, where it will operate, anything else we should know."
                className={`${field} resize-y`}
              />
            </label>
          </div>

          {/* Contact */}
          <div className="lg:col-span-5">
            <div className="theme-fade space-y-6 border border-line bg-bg p-6 md:p-8 lg:sticky lg:top-24">
              <p className="wide text-lg font-bold tracking-tight">Where should we reply?</p>
              <label className="block">
                <span className={labelText}>Name</span>
                <input name="name" required maxLength={200} autoComplete="name" className={`${field} !mt-2`} />
              </label>
              <label className="block">
                <span className={labelText}>Email</span>
                <input name="email" type="email" required maxLength={320} autoComplete="email" className={`${field} !mt-2`} />
              </label>
              <label className="block">
                <span className={labelText}>Phone (optional)</span>
                <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={`${field} !mt-2`} />
              </label>

              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <input name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="theme-fade group inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 bg-accent px-6 text-[15px] font-medium text-accent-ink transition-[filter] hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
              >
                {status === "sending" ? "Submitting…" : "Submit request"}
                <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </button>

              <p className={`text-sm leading-relaxed ${status === "error" ? "text-alarm" : "text-muted"}`} aria-live="polite">
                {status === "sent" && "Request received. Our engineers will get back to you with a configuration and lead time."}
                {status === "error" && `Couldn't submit. Try again, or email ${contact.email}.`}
              </p>
              <p className="text-xs leading-relaxed text-muted">
                With your request we record your IP address, approximate location and device, to handle orders and prevent abuse.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
