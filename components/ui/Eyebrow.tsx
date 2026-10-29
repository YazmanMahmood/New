/** Tag above a section heading. */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`tag ${className}`}>{children}</p>;
}
