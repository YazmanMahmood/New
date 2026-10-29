/**
 * The Artemis eagle PNG used as a mask filled with the current text colour,
 * so it reads on light and dark surfaces in every mode.
 */
export const logoMask: React.CSSProperties = {
  maskImage: "url(/images/logo.webp)",
  WebkitMaskImage: "url(/images/logo.webp)",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
};

/** Eagle, optionally followed by the ARTEMIS wordmark. */
export function LogoMark({ className = "", wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span aria-hidden className="block h-7 w-[70px] bg-current" style={logoMask} />
      {wordmark && <span className="wide text-[15px] font-bold uppercase tracking-[0.08em]">Artemis</span>}
    </span>
  );
}
