"use client";

import { useId, useRef, useState } from "react";
import { catalogue } from "@/data/products";
import { saveEntry } from "@/lib/entries";

/*
  PDF download behind a short form: name, email and optional phone are saved
  to Firebase as CatalogueDownloads/downloadN (see lib/entries.ts), then the
  PDF downloads. The entry's "page" field shows which page it came from, so
  /about means the company profile. Defaults to the product catalogue; pass
  `doc` for another PDF. Details are remembered in this browser to prefill
  next time, shared across all these buttons.
*/

const REMEMBER_KEY = "artemis-catalogue-details";
const field =
  "theme-fade mt-2 w-full border border-line bg-bg px-4 py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-muted hover:border-fg focus:border-accent";
const labelText = "narrow text-sm font-medium text-muted";

type Details = { name: string; email: string; phone: string };

export type DownloadDoc = { href: string; fileName: string; label: string; tag: string };

function remembered(): Partial<Details> {
  try {
    return JSON.parse(localStorage.getItem(REMEMBER_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function startDownload(doc: DownloadDoc) {
  const a = document.createElement("a");
  a.href = doc.href;
  a.download = doc.fileName;
  document.body.append(a);
  a.click();
  a.remove();
}

export function CatalogueButton({
  variant = "primary",
  doc = { ...catalogue, tag: "Catalogue" },
}: {
  variant?: "primary" | "ghost";
  doc?: DownloadDoc;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [sending, setSending] = useState(false);
  const [prefill, setPrefill] = useState<Partial<Details>>({});

  const style =
    variant === "primary"
      ? "bg-accent text-accent-ink hover:brightness-110"
      : "border border-line text-fg hover:border-fg";

  const open = () => {
    setPrefill(remembered());
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    // Honeypot: people never see this field, bots fill it in
    if (get("website")) return close();

    const details = { name: get("name"), email: get("email"), phone: get("phone") };
    setSending(true);
    try {
      await saveEntry("download", details);
      try {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify(details));
      } catch {}
    } catch {
      // Saving failed on our side; still give them the PDF
    }
    setSending(false);
    startDownload(doc);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`theme-fade group inline-flex h-12 cursor-pointer items-center gap-3 px-6 text-[15px] font-medium transition-[filter,border-color] ${style}`}
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8 2v9M4 7l4 4 4-4M2 14h12" />
        </svg>
        {doc.label}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Click on the backdrop (the dialog element itself, outside the form) closes it
        onClick={(e) => e.target === e.currentTarget && close()}
        className="tone-a m-auto max-h-[calc(100svh-2rem)] w-[min(100%-2rem,30rem)] overflow-y-auto border border-line bg-bg p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={submit} className="relative p-6 md:p-8">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-10 w-10 cursor-pointer place-items-center text-muted transition-colors hover:text-fg"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

          <p className="tag">{doc.tag}</p>
          <h2 id={titleId} className="wide mt-3 text-2xl font-bold tracking-tight">
            {doc.label}
          </h2>
          <p className="mt-3 leading-relaxed text-muted">Tell us who you are and the PDF downloads straight away.</p>

          {/* key: remount with the remembered values each time it opens */}
          <div key={JSON.stringify(prefill)} className="mt-6 space-y-5">
            <label className="block">
              <span className={labelText}>Name</span>
              <input name="name" required maxLength={200} autoComplete="name" autoFocus defaultValue={prefill.name} className={field} />
            </label>
            <label className="block">
              <span className={labelText}>Email</span>
              <input name="email" type="email" required maxLength={320} autoComplete="email" defaultValue={prefill.email} className={field} />
            </label>
            <label className="block">
              <span className={labelText}>Phone (optional)</span>
              <input name="phone" type="tel" maxLength={40} autoComplete="tel" defaultValue={prefill.phone} className={field} />
            </label>
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="theme-fade group mt-7 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 bg-accent px-6 text-[15px] font-medium text-accent-ink transition-[filter] hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v9M4 7l4 4 4-4M2 14h12" />
            </svg>
            {sending ? "Preparing download…" : "Download PDF"}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            With your details we record your IP address, approximate location and device, to follow up and prevent abuse.
          </p>
        </form>
      </dialog>
    </>
  );
}
