import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { posts } from "@/data/posts";

const BASE_URL = "https://lovelyjoy.cn";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["zh", "en"];
  const routes = ["", "/products", "/oem-odm", "/about", "/faq", "/contact", "/blog", "/plush-toy-oem", "/custom-plush-manufacturer", "/factory-capability", "/safety-certifications"];

  const entries: MetadataRoute.Sitemap = [];

  const staticLastModified = new Date('2026-04-03');

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: staticLastModified,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }

    // Product detail pages
    for (const product of products) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${product.id}`,
        lastModified: staticLastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    // Blog post pages
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
