import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { contact } from "@/data/home";
import { allProducts } from "@/data/products";

const companyLinks = [
  { href: "/products", label: "Products" },
  { href: "/platform", label: "Platform" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const missionLinks = [
  { href: "/?mode=industrial#missions", label: "Industrial" },
  { href: "/?mode=security#missions", label: "Security" },
  { href: "/?mode=defense#missions", label: "Defense" },
];

export function Footer() {
  return (
    <footer className="tone-a theme-fade border-t border-line !bg-none">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-3">
          <LogoMark />
          <p className="mt-5 max-w-xs leading-relaxed text-muted">
            Autonomous UAV systems for critical infrastructure, security and defense.
          </p>
        </div>

        <FooterList title="Company" className="md:col-span-2">
          {companyLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-block py-1.5 hover:text-fg">{l.label}</Link>
            </li>
          ))}
        </FooterList>

        <FooterList title="Platforms" className="md:col-span-2">
          {allProducts.map((p) => (
            <li key={p.slug}>
              <Link href={`/products/${p.slug}`} className="inline-block py-1.5 hover:text-fg">{p.name}</Link>
            </li>
          ))}
        </FooterList>

        <FooterList title="Missions" className="md:col-span-2">
          {missionLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-block py-1.5 hover:text-fg">{l.label}</Link>
            </li>
          ))}
        </FooterList>

        <FooterList title="Contact" className="md:col-span-3">
          {contact.teams.map((t) => (
            <li key={t.name} className="pb-2">
              <span className="narrow block pt-1.5 text-xs uppercase tracking-[0.16em]">{t.name}</span>
              <a href={`mailto:${t.email}`} className="block py-1 hover:text-fg">{t.email}</a>
              <a href={`tel:${t.phone.href}`} className="block py-1 hover:text-fg">{t.phone.display}</a>
            </li>
          ))}
          <li className="max-w-[16rem] py-1.5">{contact.address}</li>
          <li><a href={contact.linkedin} target="_blank" rel="noreferrer" className="inline-block py-1.5 hover:text-fg">LinkedIn</a></li>
        </FooterList>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="theme-fade flex flex-wrap justify-between gap-4 border-t border-line py-6 text-sm text-muted">
          <span>© {new Date().getFullYear()} Artemis UAV</span>
          <Link href="/privacy" className="hover:text-fg">Privacy policy</Link>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 space-y-1 text-sm text-muted">{children}</ul>
    </div>
  );
}
