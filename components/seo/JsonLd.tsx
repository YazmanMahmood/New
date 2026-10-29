import { contact } from "@/data/home";
import { absoluteUrl, siteName, siteUrl } from "@/lib/site";

/** Renders schema.org structured data. "<" is escaped so text can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Who Artemis is, for Google's knowledge panel and rich results. Rendered once, in the root layout. */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: absoluteUrl("/images/logo.png"),
      description: "AI-native autonomous drones for industrial inspection, security and defense.",
      foundingDate: "2024",
      email: contact.email,
      telephone: contact.teams[0].phone.href,
      address: {
        "@type": "PostalAddress",
        streetAddress: "15 MM Alam Road, Vogue Towers, Gulberg III",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
      // One per team, in schema.org's wording ("sales", "customer support")
      contactPoint: contact.teams.map((t) => ({
        "@type": "ContactPoint",
        contactType: t.name === "Support" ? "customer support" : t.name.toLowerCase(),
        email: t.email,
        telephone: t.phone.href,
        availableLanguage: ["en", "ur"],
      })),
      sameAs: [contact.linkedin],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
