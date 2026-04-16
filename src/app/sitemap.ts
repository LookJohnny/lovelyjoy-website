import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { posts } from "@/data/posts";
import { cases } from "@/data/cases";

const BASE_URL = "https://lovelyjoy.cn";
const LOCALES = ["zh", "en", "ja", "ko", "es", "pt", "ar", "ru", "fr", "de", "it", "th", "id"] as const;

function buildLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = `${BASE_URL}/${l}${path}`;
  }
  languages["x-default"] = `${BASE_URL}/en${path}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/products",
    "/oem-odm",
    "/about",
    "/faq",
    "/contact",
    "/blog",
    "/plush-toy-oem",
    "/custom-plush-manufacturer",
    "/factory-capability",
    "/safety-certifications",
    "/plush-toy-manufacturer",
    "/yiwu-plush-factory",
    "/mascot-custom",
    "/gift-plush-custom",
    "/stuffed-animal-oem",
    "/cases",
  ];

  // `new Date()` evaluates at build time. Each production deploy refreshes
  // lastModified across all static routes, nudging Google to re-crawl.
  const buildDate = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Static routes
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: buildDate,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
        alternates: { languages: buildLanguages(route) },
      });
    }

    // Product detail pages
    for (const product of products) {
      const path = `/products/${product.id}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: buildDate,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: buildLanguages(path) },
      });
    }

    // Blog post pages — use the post's own date for lastModified
    for (const post of posts) {
      const path = `/blog/${post.slug}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: buildLanguages(path) },
      });
    }

    // Case study pages
    for (const c of cases) {
      const path = `/cases/${c.slug}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: buildDate,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: buildLanguages(path) },
      });
    }
  }

  return entries;
}
