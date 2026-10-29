type ImageSlotProps = {
  /** What image belongs here, e.g. "VTOL over an industrial site" */
  label: string;
  /** CSS aspect ratio, e.g. "16/9". Leave out to fill the parent. */
  ratio?: string;
  className?: string;
  labelPosition?: "bottom-left" | "top-right";
};

/**
 * Placeholder for an image that will be added later.
 * To replace: put the file in /public/images and swap this for
 * <Image src="/images/your-file.jpg" alt="..." fill className="object-cover" />
 * inside a relatively positioned wrapper of the same size.
 */
export function ImageSlot({ label, ratio, className = "", labelPosition = "bottom-left" }: ImageSlotProps) {
  const pos = labelPosition === "top-right" ? "items-start justify-end text-right" : "items-end";
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${label}`}
      className={`image-slot theme-fade flex ${pos} ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <span className="narrow relative m-4 max-w-[70%] text-xs leading-relaxed">
        Image: {label}
        {ratio && <span className="opacity-60"> ({ratio.replace("/", ":")})</span>}
      </span>
    </div>
  );
}
