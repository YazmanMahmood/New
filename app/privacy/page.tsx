import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { contact } from "@/data/home";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "How Artemis UAV collects, uses and protects the information you share through artemisuav.com, including contact forms, catalogue downloads and analytics.",
  path: "/privacy",
});

const updated = "25 October 2026";

/*
  Keep this in step with what the site really does: the form fields in
  lib/entries.ts, the visitor details in lib/visitor.ts and the analytics tag
  in components/layout/GoogleAnalytics.tsx. Change `updated` when you edit it.
*/
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: (
      <p>
        Artemis UAV (&quot;Artemis&quot;, &quot;we&quot;, &quot;us&quot;) builds autonomous drones and runs artemisuav.com. Our office is at{" "}
        {contact.address}. This policy explains what we collect when you use the site, why, and the choices you have.
      </p>
    ),
  },
  {
    title: "What you give us",
    body: (
      <>
        <p>We only collect personal details you choose to send through one of our forms:</p>
        <ul>
          <li>
            <strong>Contact form:</strong> your name, email address and message.
          </li>
          <li>
            <strong>Customization requests:</strong> your name, email address and phone number, plus the drone type, range,
            intended use and notes you describe.
          </li>
          <li>
            <strong>Catalogue downloads:</strong> your name, email address and phone number.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "What we record with a form",
    body: (
      <>
        <p>
          When you submit a form we also record technical details with it, so we can handle enquiries and spot spam and
          abuse:
        </p>
        <ul>
          <li>your IP address, approximate city, region and country, internet provider, and whether a VPN or proxy appears to be in use;</li>
          <li>your device type, operating system, browser, language, screen size and time zone;</li>
          <li>the page you sent the form from, the site that referred you, and the time of submission.</li>
        </ul>
        <p>
          The IP and location lookup is made by your browser to ipinfo.io, or to freeipapi.com if the first is unavailable.
          We don&apos;t record these details if you browse without submitting a form.
        </p>
      </>
    ),
  },
  {
    title: "Analytics and cookies",
    body: (
      <>
        <p>
          We use Google Analytics 4 to understand how the site is used, such as which pages are visited, how visitors arrive
          and which device types they use. Google Analytics sets first-party cookies (named <code>_ga</code> and{" "}
          <code>_ga_*</code>) and processes your IP address to estimate location; Google Analytics 4 does not log or store IP
          addresses. We don&apos;t use advertising cookies or sell data to advertisers.
        </p>
        <p>
          You can block or delete cookies in your browser settings, or install Google&apos;s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
            Analytics opt-out add-on
          </a>
          . The site works fully without them. The site also stores your chosen mission mode in the page address, not in a
          cookie.
        </p>
      </>
    ),
  },
  {
    title: "How we use it",
    body: (
      <ul>
        <li>to reply to your enquiry, prepare quotes and follow up on demos or customization requests;</li>
        <li>to send the catalogue you asked for and, where relevant, follow up about it;</li>
        <li>to keep the site secure and filter spam and abuse;</li>
        <li>to understand and improve how the site performs.</li>
      </ul>
    ),
  },
  {
    title: "Where it is stored and who sees it",
    body: (
      <>
        <p>
          Form submissions are stored in Google Firebase Realtime Database, a service run by Google, and may be processed on
          servers outside your country. Access is limited to the Artemis team members who handle enquiries.
        </p>
        <p>
          We share data only with the service providers named in this policy (Google for hosting form data and analytics,
          and the IP lookup services), when the law requires it, or with your agreement. We don&apos;t sell personal data.
        </p>
      </>
    ),
  },
  {
    title: "How long we keep it",
    body: (
      <p>
        We keep enquiries and the details recorded with them for as long as we need them to respond and to maintain our
        business records, and then delete them. Google Analytics data is kept for the retention period set in our Analytics
        account.
      </p>
    ),
  },
  {
    title: "Your choices and rights",
    body: (
      <p>
        You can ask us what personal data we hold about you, ask us to correct or delete it, or tell us to stop contacting
        you. Email <a href={`mailto:${contact.email}`}>{contact.email}</a> and we will respond within 30 days. Depending on
        where you live, you may also have the right to complain to your local data protection authority.
      </p>
    ),
  },
  {
    title: "Security",
    body: (
      <p>
        The site is served over HTTPS, and our database only accepts new form entries in the expected format; it cannot be
        read from the public site. No method of transmission or storage is completely secure, but we take reasonable steps
        to protect what you send us.
      </p>
    ),
  },
  {
    title: "Children",
    body: <p>This site is meant for businesses and government buyers. We don&apos;t knowingly collect data from anyone under 16.</p>,
  },
  {
    title: "Changes to this policy",
    body: <p>If we change how we handle personal data, we will update this page and the date at the top.</p>,
  },
  {
    title: "Contact",
    body: (
      <p>
        Questions about this policy: <a href={`mailto:${contact.email}`}>{contact.email}</a>, {contact.teams.map((t) => t.phone.display).join(" or ")}, or write to us
        at {contact.address}. You can also use our <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <section className="tone-a relative" aria-labelledby="privacy-title">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-8 md:pb-28 md:pt-36">
        <Breadcrumbs items={[{ name: "Privacy policy", path: "/privacy" }]} />
        <h1 id="privacy-title" className="wide mt-8 text-[clamp(2.2rem,4.4vw,3.75rem)] font-bold leading-[1] tracking-[-0.03em]">
          Privacy policy
        </h1>
        <p className="narrow mt-5 text-sm text-muted">Last updated {updated}</p>

        <div className="theme-fade mt-12 border-t border-line">
          {sections.map((s) => (
            <div key={s.title} className="theme-fade grid gap-4 border-b border-line py-10 lg:grid-cols-12 lg:gap-12">
              <h2 className="wide text-xl font-bold tracking-tight lg:col-span-4">{s.title}</h2>
              <div className="prose-policy space-y-4 leading-relaxed text-muted lg:col-span-7 lg:col-start-6">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
