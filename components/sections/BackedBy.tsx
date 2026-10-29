import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { backers } from "@/data/home";

/**
  Organisations backing Artemis. Shows a logo when one is set, otherwise the name.
  The logos are opaque artwork on their own backgrounds, so each sits on a white
  tile that reads the same in every mode.
*/
export function BackedBy() {
  return (
    <section id="backers" className="tone-a theme-fade scroll-mt-16 border-y border-line !bg-none" aria-labelledby="backers-title">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-14 md:px-8 md:py-16 lg:flex-row lg:items-center lg:gap-12">
        <h2 id="backers-title" className="tag shrink-0">
          {backers.eyebrow}
        </h2>
        <Reveal className="flex-1">
          <ul className="theme-fade grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
            {backers.items.map((b) => (
              <li key={b.name} className="flex min-h-24 flex-col items-center justify-center gap-3 bg-bg px-4 py-6 text-center md:min-h-28">
                {b.logo ? (
                  <>
                    <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-sm bg-white md:h-24 md:w-24">
                      <Image src={b.logo} alt="" width={225} height={225} className="h-full w-full object-contain" />
                    </span>
                    <span className="narrow text-xs uppercase tracking-[0.12em] text-muted">{b.name}</span>
                  </>
                ) : (
                  <span className="wide text-lg font-bold tracking-tight md:text-xl">{b.name}</span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
