import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

const styles = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  ghost: "border border-line text-fg hover:border-fg",
};

/** Call-to-action link. Internal routes use next/link; hashes, mailto and external links use <a>. */
export function ButtonLink({ href, children, variant = "primary", className = "" }: ButtonLinkProps) {
  const classes = `theme-fade group inline-flex h-12 items-center gap-3 px-6 text-[15px] font-medium transition-[filter,border-color] ${styles[variant]} ${className}`;
  const content = (
    <>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 8h11M9 4l4 4-4 4" />
      </svg>
    </>
  );

  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {content}
    </a>
  );
}
