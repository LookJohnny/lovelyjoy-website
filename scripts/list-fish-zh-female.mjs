/**
 * List candidate Chinese female voices from Fish Audio with sample URLs
 * so the user can preview and pick the right one manually.
 *
 * Usage:
 *   FISH_API_KEY=xxx HTTPS_PROXY=http://127.0.0.1:7897 node scripts/list-fish-zh-female.mjs
 *
 * Outputs numbered list with:
 *   - ID, name
 *   - tags
 *   - task_count (popularity)
 *   - sample audio URL (preview in browser)
 */
import { fetch, ProxyAgent } from "undici";

const API = "https://api.fish.audio";
const KEY = process.env.FISH_API_KEY;
if (!KEY) {
  console.error("Set FISH_API_KEY in env");
  process.exit(1);
}

const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

async function getJson(url) {
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}` },
    dispatcher,
  });
  if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);
  return resp.json();
}

// Fetch multiple pages + multiple sort strategies to get a big candidate pool
async function fetchPool() {
  const urls = [
    `${API}/model?page_size=100&language=zh&sort_by=task_count&tag=female`,
    `${API}/model?page_size=100&language=zh&sort_by=score&tag=female`,
    `${API}/model?page_size=100&language=zh&sort_by=like_count&tag=female`,
  ];
  const all = new Map();
  for (const u of urls) {
    try {
      const d = await getJson(u);
      for (const m of d.items ?? []) {
        if (!all.has(m._id)) all.set(m._id, m);
      }
    } catch (e) {
      console.warn("fetch failed:", u, e.message);
    }
  }
  return [...all.values()];
}

function scoreFemaleBusiness(m) {
  const title = String(m.title ?? "").toLowerCase();
  const desc = String(m.description ?? "").toLowerCase();
  const tags = (m.tags ?? []).map((t) => String(t).toLowerCase());
  const all = title + " " + desc + " " + tags.join(" ");

  let s = 0;

  // Strong female signals
  if (tags.includes("female")) s += 5;
  if (/女|female|woman|girl|lady|miss|ms\./.test(all)) s += 3;

  // Strong male de-boost (many models have wrong tags)
  if (tags.includes("male") && !tags.includes("female")) s -= 100;
  if (/\b(male|man|boy|mr\.|gentleman)\b/.test(desc)) s -= 5;

  // Business / professional signals
  for (const kw of [
    "business",
    "professional",
    "advertisement",
    "announcer",
    "broadcast",
    "narration",
    "商务",
    "播音",
    "知性",
    "专业",
    "新闻",
    "主持",
  ]) {
    if (all.includes(kw)) s += 2;
  }

  // Gentle / warm tone
  for (const kw of ["gentle", "warm", "calm", "soft", "温柔", "温暖", "柔和"]) {
    if (all.includes(kw)) s += 1;
  }

  // Avoid
  for (const kw of [
    "character",
    "anime",
    "loli",
    "萝莉",
    "二次元",
    "sexy",
    "cute",
    "萌",
    "娇",
  ]) {
    if (all.includes(kw)) s -= 2;
  }

  // Popularity
  if (typeof m.task_count === "number") s += Math.log10(m.task_count + 1);
  if (typeof m.like_count === "number") s += Math.log10(m.like_count + 1) * 0.5;

  return s;
}

const pool = await fetchPool();
console.log(`Pool size: ${pool.length} (deduped across 3 sort strategies)\n`);

const scored = pool
  .map((m) => ({ m, s: scoreFemaleBusiness(m) }))
  .filter((x) => x.s > 0)
  .sort((a, b) => b.s - a.s)
  .slice(0, 12);

console.log("==== Top 12 Chinese female B2B candidates ====\n");
for (let i = 0; i < scored.length; i++) {
  const { m, s } = scored[i];
  const tags = (m.tags ?? []).slice(0, 7).join(",");
  const sample = m.samples?.[0]?.audio ?? "(no sample)";
  const desc = (m.description ?? "").slice(0, 100).replace(/\s+/g, " ");
  console.log(
    `[${i + 1}] score=${s.toFixed(1)}  tasks=${m.task_count ?? 0}  ${m.title}`,
  );
  console.log(`    id:     ${m._id}`);
  console.log(`    tags:   ${tags}`);
  console.log(`    desc:   ${desc}`);
  console.log(`    sample: ${sample}`);
  console.log();
}
