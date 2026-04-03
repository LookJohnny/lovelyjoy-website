import type { MetadataRoute } from "next";
import { products } from "@/data/products";

const BASE_URL = "https://lovelyjoy.cn";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["zh", "en"];
  const routes = ["", "/products", "/oem-odm", "/about", "/faq", "/contact"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }

    // Product detail pages
    for (const product of products) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
