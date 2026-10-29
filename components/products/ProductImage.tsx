import Image from "next/image";
import { ImageSlot } from "@/components/ui/ImageSlot";
import type { Product } from "@/data/products";

type ProductImageProps = {
  product: Pick<Product, "image" | "imageLabel">;
  /** CSS aspect ratio, e.g. "4/3" */
  ratio: string;
  /** Rendered width hint for next/image, e.g. "(min-width: 1024px) 33vw, 100vw" */
  sizes?: string;
  priority?: boolean;
};

/**
 * A product's photo, or a placeholder until one is set in data/products.ts.
 * Photos come in different shapes, so the whole drone is shown (never cropped)
 * over a blurred, cropped copy of the same photo that fills the frame.
 */
export function ProductImage({ product, ratio, sizes = "100vw", priority = false }: ProductImageProps) {
  if (!product.image) return <ImageSlot label={product.imageLabel} ratio={ratio} className="!border-0" />;

  return (
    <div className="relative overflow-hidden" style={{ aspectRatio: ratio }}>
      <Image
        src={product.image}
        alt=""
        aria-hidden
        fill
        sizes="10vw"
        className="scale-110 object-cover opacity-80 blur-2xl"
      />
      <Image src={product.image} alt={product.imageLabel} fill sizes={sizes} priority={priority} className="object-contain" />
    </div>
  );
}
