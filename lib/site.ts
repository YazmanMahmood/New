import type { Metadata } from "next";

/** Production origin. Canonicals, the sitemap and structured data are built from it. */
export const siteUrl = "https://artemisuav.com";
export const siteName = "Artemis UAV";

/** Absolute URL for a site path, e.g. "/about" → "https://artemisuav.com/about". */
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

/** Shortens text to fit a meta description (~155 characters), breaking on a word. */
export function summarize(text: string, max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}

type PageMetaInput = {
  /** Page name; the layout adds " | Artemis UAV". Leave out for the homepage. */
  title?: string;
  description: string;
  /** Site path, e.g. "/products/swarm". Becomes the canonical URL. */
  path: string;
  /** Share image path, when the page has its own opengraph-image route */
  image?: string;
};

/** Site-wide share image, rendered by app/opengraph-image.tsx */
const defaultImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Artemis UAV: autonomous drones for critical infrastructure",
};

/**
 * Title, description, canonical, Open Graph and Twitter tags for one page.
 * Child metadata replaces the layout's openGraph object instead of merging it,
 * so every page sets the whole thing. The share image is the site default
 * (app/opengraph-image.tsx) unless `image` points at the page's own.
 */
export function pageMetadata({ title, description, path, image }: PageMetaInput): Metadata {
  const desc = summarize(description);
  const images = [image ? { ...defaultImage, url: image, alt: title ?? defaultImage.alt } : defaultImage];
  const shareTitle = title ? `${title} | ${siteName}` : `${siteName} | Autonomous drones for critical infrastructure`;
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description: desc,
      url: path,
      siteName,
      locale: "en_US",
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: desc, images },
  };
}
