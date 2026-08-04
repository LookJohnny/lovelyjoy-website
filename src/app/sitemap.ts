import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { posts } from "@/data/posts";
import { cases } from "@/data/cases";
import { authors } from "@/data/authors";
import { HREFLANG_MAP, INDEXABLE_LOCALES } from "@/lib/seo";

const BASE_URL = "https://lovelyjoy.cn";

// Real last-modified dates per route, derived from `git log -1 --format=%as`
// on each page directory (2026-08-04). 97% of URLs previously had no lastmod,
// so Google had no freshness signal to prioritize recrawls. Update the date
// here when a page's content meaningfully changes (or regenerate from git).
const ROUTE_LASTMOD: Record<string, string> = {
  "": "2026-08-04", // homepage — touched this release
  "/products": "2026-07-28",
  "/oem-odm": "2026-08-04",
  "/about": "2026-08-04",
  "/faq": "2026-07-28",
  "/contact": "2026-07-28",
  "/rfq-template": "2026-07-28",
  "/blog": "2026-07-30",
  "/plush-toy-oem": "2026-08-04",
  "/custom-plush-manufacturer": "2026-08-04",
  "/factory-capability": "2026-08-04",
  "/safety-certifications": "2026-07-28",
  "/plush-toy-manufacturer": "2026-08-04",
  "/yiwu-plush-factory": "2026-08-04",
  "/mascot-custom": "2026-08-04",
  "/gift-plush-custom": "2026-08-04",
  "/stuffed-animal-oem": "2026-08-04",
  "/oem-plush-manufacturer": "2026-08-04",
  "/cases": "2026-07-30",
};
// products.ts / cases.ts data files' last content commits.
const PRODUCTS_LASTMOD = "2026-06-26";
const CASES_LASTMOD = "2026-08-04";
const AUTHORS_LASTMOD = "2026-07-28";

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
    "/rfq-template",
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
    // Static routes. `changefreq`/`priority` were dropped — Google has ignored
    // both since 2022, and they only bloated the file.
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(ROUTE_LASTMOD[route] ?? PRODUCTS_LASTMOD),
        alternates: { languages: buildLanguages(route) },
      });
    }

    // Product detail pages
    for (const product of products) {
      const path = `/products/${product.id}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(PRODUCTS_LASTMOD),
        alternates: { languages: buildLanguages(path) },
      });
    }

    // Blog post pages — use the post's own date for lastModified
    for (const post of posts) {
      const path = `/blog/${post.slug}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(post.modifiedDate ?? post.date),
        alternates: { languages: buildLanguages(path) },
      });
    }

    // Case study pages
    for (const c of cases) {
      const path = `/cases/${c.slug}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(CASES_LASTMOD),
        alternates: { languages: buildLanguages(path) },
      });
    }

    // Author profile pages (E-E-A-T)
    for (const a of authors) {
      const path = `/authors/${a.slug}`;
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(AUTHORS_LASTMOD),
        alternates: { languages: buildLanguages(path) },
      });
    }
  }

  return entries;
}
