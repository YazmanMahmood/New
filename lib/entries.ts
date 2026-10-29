// Form entries saved to the Realtime Database, each kind numbered in sequence:
//   Submissions/submission1, submission2 ...   (counter: submissionCounter)
//   CustomOrders/customorder1, customorder2 ... (counter: customOrderCounter)
//   CatalogueDownloads/download1, download2 ... (counter: downloadCounter)
// The Submissions path and counter match the old site, so numbering carries on.

import { getDb } from "@/lib/firebase";
import { getVisitor } from "@/lib/visitor";

const kinds = {
  submission: { node: "Submissions", counter: "submissionCounter", prefix: "submission" },
  customorder: { node: "CustomOrders", counter: "customOrderCounter", prefix: "customorder" },
  download: { node: "CatalogueDownloads", counter: "downloadCounter", prefix: "download" },
} as const;

export type EntryKind = keyof typeof kinds;

export type QuestionFields = { name: string; email: string; message: string };

export type CustomOrderFields = {
  request: { rangeKm: number; droneType: string; usage: string; notes: string };
  contact: { name: string; email: string; phone: string };
};

export type DownloadFields = { name: string; email: string; phone: string };

/** Lahore time, for reading entries in the Firebase console. */
const localTime = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date()) + " PKT";

/** Saves one entry and returns its key, e.g. "customorder3". */
export async function saveEntry(kind: "submission", fields: QuestionFields): Promise<string>;
export async function saveEntry(kind: "customorder", fields: CustomOrderFields): Promise<string>;
export async function saveEntry(kind: "download", fields: DownloadFields): Promise<string>;
export async function saveEntry(kind: EntryKind, fields: QuestionFields | CustomOrderFields | DownloadFields) {
  const { node, counter, prefix } = kinds[kind];
  const [db, { ref, runTransaction, set, serverTimestamp }, visitor] = await Promise.all([
    getDb(),
    import("firebase/database"),
    getVisitor(),
  ]);

  // Claim the next number atomically, so two people submitting at once never share one
  const result = await runTransaction(ref(db, counter), (n) => (typeof n === "number" ? n : 0) + 1);
  if (!result.committed) throw new Error("Could not number the entry");
  const number = result.snapshot.val() as number;
  const key = `${prefix}${number}`;

  await set(ref(db, `${node}/${key}`), {
    number,
    ...fields,
    page: location.pathname,
    submittedAt: serverTimestamp(),
    submittedAtLocal: localTime(),
    visitor,
  });
  return key;
}
