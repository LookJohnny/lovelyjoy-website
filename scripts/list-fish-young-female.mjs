/**
 * List YOUNG Chinese female voices from Fish Audio.
 * Stronger filter than the earlier script — we require both
 * "young" AND female signals, and penalize "middle-aged" / "mature".
 *
 * Usage:
 *   FISH_API_KEY=xxx HTTPS_PROXY=http://127.0.0.1:7897 node scripts/list-fish-young-female.mjs
 */
import { fetch, ProxyAgent } from "undici";

const API = "https://api.fish.audio";
const KEY = process.env.FISH_API_KEY;
if (!KEY) {
  console.error("Set FISH_API_KEY");
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

// Fetch across multiple query strategies to get a big pool
async function pool() {
  const urls = [
    `${API}/model?page_size=100&language=zh&sort_by=task_count&tag=female`,
    `${API}/model?page_size=100&language=zh&sort_by=score&tag=female`,
    `${API}/model?page_size=100&language=zh&sort_by=task_count&tag=young`,
    `${API}/model?page_size=100&language=zh&sort_by=score&tag=young`,
  ];
  const all = new Map();
  for (const u of urls) {
    try {
      const d = await getJson(u);
      for (const m of d.items ?? []) if (!all.has(m._id)) all.set(m._id, m);
    } catch (e) {
      console.warn("fetch fail:", e.message);
    }
  }
  return [...all.values()];
}

function score(m) {
  const title = String(m.title ?? "").toLowerCase();
  const desc = String(m.description ?? "").toLowerCase();
  const tags = (m.tags ?? []).map((t) => String(t).toLowerCase());
  const all = title + " " + desc + " " + tags.join(" ");

  // Hard requirement: female
  if (!tags.includes("female")) return -1000;
  // Hard requirement: NOT male
  if (tags.includes("male") && !title.includes("女")) return -1000;

  let s = 0;

  // Young signals (strict)
  if (tags.includes("young")) s += 8;
  if (/young|年轻|少女|女孩子|女生|小女|萌妹|甜美/.test(all)) s += 5;

  // Name contains "女" or "姐" — but de-prefer 老/熟 (old/mature)
  if (/女孩|女生|少女/.test(title)) s += 4;

  // De-prefer older voices
  if (tags.includes("middle-aged")) s -= 15;
  if (tags.includes("elderly") || tags.includes("old")) s -= 30;
  if (/mature|old|middle-aged|老|熟|大妈|中年/.test(all)) s -= 10;

  // Prefer conversational / friendly / warm over formal news anchor
  for (const kw of [
    "conversational",
    "friendly",
    "gentle",
    "warm",
    "soft",
    "cute",
    "bright",
    "sweet",
    "温柔",
    "甜美",
    "治愈",
    "活泼",
    "清新",
    "可爱",
  ]) {
    if (all.includes(kw)) s += 1.5;
  }

  // De-prefer news-anchor authoritative style (sounds older)
  for (const kw of ["news", "authoritative", "narration", "documentary", "新闻", "权威", "纪录片", "播音", "announcer"]) {
    if (all.includes(kw)) s -= 2;
  }

  // Popularity weak signal
  if (typeof m.task_count === "number") s += Math.log10(m.task_count + 1);

  return s;
}

const candidates = (await pool())
  .map((m) => ({ m, s: score(m) }))
  .filter((x) => x.s > 0)
  .sort((a, b) => b.s - a.s)
  .slice(0, 12);

console.log(`\n==== Top 12 YOUNG Chinese female voices ====\n`);
for (let i = 0; i < candidates.length; i++) {
  const { m, s } = candidates[i];
  const tags = (m.tags ?? []).slice(0, 8).join(",");
  const sample = m.samples?.[0]?.audio ?? "(no sample)";
  const desc = (m.description ?? "").slice(0, 110).replace(/\s+/g, " ");
  console.log(`[${i + 1}] score=${s.toFixed(1)}  tasks=${m.task_count ?? 0}  ${m.title}`);
  console.log(`    id:     ${m._id}`);
  console.log(`    tags:   ${tags}`);
  console.log(`    desc:   ${desc}`);
  console.log(`    sample: ${sample}`);
  console.log();
}
