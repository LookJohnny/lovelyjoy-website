#!/usr/bin/env node
/**
 * IndexNow submitter for lovelyjoy.cn
 *
 * Notifies Bing, Yandex, Seznam, Naver (and any IndexNow-participating engine)
 * that URLs were added or updated. Relevant for the EN / RU / KO markets.
 *
 * Usage:
 *   node scripts/indexnow.mjs                 # submit a default core URL set
 *   node scripts/indexnow.mjs <url> [<url>…]  # submit specific URLs
 *   node scripts/indexnow.mjs --postbuild      # production-only, non-blocking
 *
 * Docs: https://www.indexnow.org/documentation
 */

const HOST = "lovelyjoy.cn";
const KEY = "4bd16546b615726898812dcf8aa8fae9"; // matches public/<KEY>.txt
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Core English B2B landing set — extend or pass URLs as CLI args.
const DEFAULT_URLS = [
  `https://${HOST}/en`,
  `https://${HOST}/en/products`,
  `https://${HOST}/en/oem-odm`,
  `https://${HOST}/en/factory-capability`,
  `https://${HOST}/en/safety-certifications`,
  `https://${HOST}/en/cases`,
  `https://${HOST}/en/contact`,
  `https://${HOST}/en/rfq-template`,
  `https://${HOST}/zh`,
  `https://${HOST}/zh/products`,
  `https://${HOST}/zh/oem-odm`,
  `https://${HOST}/zh/factory-capability`,
  `https://${HOST}/zh/safety-certifications`,
  `https://${HOST}/zh/cases`,
  `https://${HOST}/zh/contact`,
  `https://${HOST}/zh/rfq-template`,
];

const args = process.argv.slice(2);
const isPostbuild = args.includes("--postbuild");

// Vercel runs the npm lifecycle for preview and production builds. Only a
// production build should notify search engines; local and preview builds skip.
if (isPostbuild && process.env.VERCEL_ENV !== "production") {
  console.log("IndexNow → skipped (not a Vercel production build).");
  process.exit(0);
}

const urlList = args.filter((arg) => arg !== "--postbuild");
const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList.length > 0 ? urlList : DEFAULT_URLS,
};

try {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  console.log(`IndexNow → HTTP ${res.status} ${res.statusText}`);
  console.log(`Submitted ${payload.urlList.length} URL(s).`);
  if (!res.ok) {
    console.error(await res.text());
    if (!isPostbuild) process.exit(1);
  }
} catch (error) {
  console.error(`IndexNow → request failed: ${error.message}`);
  if (!isPostbuild) process.exit(1);
}
