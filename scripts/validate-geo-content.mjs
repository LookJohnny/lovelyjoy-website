#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const checks = [
  {
    file: "public/llms-full.txt",
    mustContain: "In-house design team: 50+ professional designers and pattern makers",
    reason: "the public company profile must use the agreed design-team figure",
  },
  {
    file: "public/llms-full.txt",
    mustNotContain: "15+ professional designers",
    reason: "the old conflicting design-team figure must not return",
  },
  {
    file: "src/app/[locale]/factory-capability/page.tsx",
    mustNotContain: "over 30 countries",
    reason: "the old conflicting export-market figure must not return",
  },
  {
    file: "src/app/[locale]/factory-capability/page.tsx",
    mustNotContain: "30多个国家",
    reason: "the old Chinese export-market figure must not return",
  },
  {
    file: "src/app/[locale]/plush-toy-manufacturer/page.tsx",
    mustNotContain: "All certifications are current",
    reason: "certificate validity must be verified from current documents",
  },
  {
    file: "src/app/[locale]/products/[id]/page.tsx",
    mustNotContain: '"@type": "Offer"',
    reason: "quote-only products must not emit an incomplete priced Offer",
  },
  {
    file: "src/app/[locale]/rfq-template/page.tsx",
    mustContain: '"@type": "HowTo"',
    reason: "the buyer resource must keep its matching structured data",
  },
  {
    file: "src/app/[locale]/safety-certifications/page.tsx",
    mustContain: "U.S. Consumer Product Safety Commission",
    reason: "the compliance guide must retain primary regulator sources",
  },
];

const failures = [];

for (const check of checks) {
  const content = await readFile(new URL(`../${check.file}`, import.meta.url), "utf8");
  if (check.mustContain && !content.includes(check.mustContain)) {
    failures.push(`${check.file}: missing required content — ${check.reason}`);
  }
  if (check.mustNotContain && content.includes(check.mustNotContain)) {
    failures.push(`${check.file}: contains prohibited content — ${check.reason}`);
  }
}

if (failures.length) {
  console.error("GEO content validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`GEO content validation passed (${checks.length} checks).`);
