# Artemis UAV website

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion.
Only the homepage is built so far; the project is set up as a multi-page site.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

## Where things live

| What | Where |
| --- | --- |
| Shared layout (navbar, footer, mode chip) | `app/layout.tsx`, `components/layout/` |
| Homepage | `app/page.tsx` |
| Homepage sections | `components/sections/` (Hero, ProblemSolution, HowItWorks, Applications, Capabilities, MissionSelector, CustomSolutions, BackedBy, CallToAction. Backer logos: add `logo` paths in `data/home.ts`) |
| Animated backgrounds | `components/ui/AmbientCanvas.tsx` (hero flight grid, CTA radar), `components/ui/SiteGlobe.tsx` (problem globe, uses `cobe`), `components/ui/MissionMap.tsx` (solution mission: authorize → take off → patrol → detect → alert) |
| All homepage text: hero, problem/solution, steps, capabilities, industries, CTA, contact | `data/home.ts` |
| Missions and products | `data/products.ts` |
| Colours and mission-mode themes | `app/globals.css` |
| Mission mode logic | `components/providers/ModeProvider.tsx` |

## Adding images

Every image spot is an `<ImageSlot label="..." ratio="..." />` with a label saying what goes there.
Put the file in `public/images/` and replace the slot with `next/image`:

```tsx
import Image from "next/image";

<div className="relative" style={{ aspectRatio: "21/9" }}>
  <Image src="/images/hero.jpg" alt="VTOL over an industrial site" fill className="object-cover" priority />
</div>
```

The logo placeholder is in `components/ui/LogoMark.tsx`. The hero background is an animated canvas in
`components/sections/Hero.tsx`; to use footage instead, drop a muted, looping `<video autoPlay muted loop playsInline>` into the same wrapper.

## Adding pages

Create a folder in `app/` with a `page.tsx`, e.g. `app/about/page.tsx`. It automatically gets the navbar,
footer and current mission mode. Navbar links already point to `/products`, `/platform`, `/about` and
`/contact`; until those exist they show the "This page is on its way" screen (`app/not-found.tsx`).
Product cards link to `/products/[slug]` (slugs are in `data/products.ts`).

## Mission modes

Clicking Industrial, Security or Defense sets `html[data-mode]`, which swaps the CSS variables in
`globals.css` and re-themes the whole site. The mode is kept in the URL (`/?mode=defense`) so it can be
shared. Build new sections with the theme utilities (`bg-bg`, `text-fg`, `text-muted`, `border-line`,
`bg-accent`, `text-accent-text`, `text-signal`, `text-alarm`) inside a `tone-a` or `tone-b` section
and they'll follow the mode automatically.

## Type

One family, Archivo, used at three widths: `wide` for headlines, normal for body text, `narrow` for spec labels.

## SEO, analytics and forms

| What | Where |
| --- | --- |
| Site URL, per-page title/description/canonical/Open Graph helper | `lib/site.ts` (`pageMetadata()`; use it in every new page) |
| Share images (1200×630, built at build time) | `app/opengraph-image.tsx`, `app/products/[slug]/opengraph-image.tsx` |
| Organization + WebSite schema | `components/seo/JsonLd.tsx`, rendered in `app/layout.tsx` |
| Breadcrumbs (visible trail + BreadcrumbList schema) | `components/seo/Breadcrumbs.tsx` |
| robots.txt, sitemap.xml | `app/robots.ts`, `app/sitemap.ts` (add new pages to the sitemap) |
| 301 redirects (www → bare domain, old URLs) | `redirects()` in `next.config.ts` |
| Google Analytics 4 | `components/layout/GoogleAnalytics.tsx`, `lib/analytics.ts` |
| Contact form email alerts | `app/api/contact/route.ts` |
| Privacy policy | `app/privacy/page.tsx` |

Settings go in `.env.local` or the host's environment; see `.env.example`.
