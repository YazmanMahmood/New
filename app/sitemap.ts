import type { MetadataRoute } from "next";
import { allProducts } from "@/data/products";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/platform"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const products: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: absoluteUrl(`/products/${p.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
    ...(p.image ? { images: [absoluteUrl(encodeURI(p.image))] } : {}),
  }));

  return [...pages, ...products];
}
