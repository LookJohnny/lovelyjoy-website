import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { posts } from "@/data/posts";
import { cases } from "@/data/cases";
import { authors } from "@/data/authors";
import { HREFLANG_MAP, INDEXABLE_LOCALES } from "@/lib/seo";

const BASE_URL = "https://lovelyjoy.cn";

function buildLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of INDEXABLE_LOCALES) {
    // Keep sitemap alternates identical to the indexable <head> alternates.
    languages[HREFLANG_MAP[l] ?? l] = `${BASE_URL}/${l}${path}`;
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
    "/oem-plush-manufacturer",
    "/cases",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of INDEXABLE_LOCALES) {
    // Static routes
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
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
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: buildLanguages(path) },
      });
    }

    // Author profile pages (E-E-A-T)
    for (const a of authors) {
      const path = `/authors/${a.slug}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        changeFrequency: "monthly",
        priority: 0.4,
        alternates: { languages: buildLanguages(path) },
      });
    }
  }

  return entries;
}
