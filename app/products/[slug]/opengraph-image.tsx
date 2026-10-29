import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { ShareCard } from "@/components/seo/ShareCard";
import { allProducts, getProduct, missions } from "@/data/products";

// Share image for a product: name and missions beside its photo. Rendered at build time.
export const alt = "Artemis UAV product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

const mime: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export default async function ProductOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  const publicDir = join(process.cwd(), "public");
  const logo = await readFile(join(publicDir, "images/logo-white.png"));
  if (!product) return new ImageResponse(<ShareCard logo={logo} kicker="Artemis UAV" title="Autonomous drones." />, size);

  let photo: string | undefined;
  if (product.image) {
    const file = await readFile(join(publicDir, product.image));
    photo = `data:${mime[extname(product.image).toLowerCase()]};base64,${file.toString("base64")}`;
  }
  const kicker = product.missions.map((id) => missions.find((m) => m.id === id)!.name).join(" · ");
  return new ImageResponse(<ShareCard logo={logo} kicker={kicker} title={product.name} photo={photo} />, size);
}
