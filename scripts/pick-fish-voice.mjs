/**
 * Query Fish Audio's model list and auto-pick a Chinese + English voice.
 *
 * Usage: FISH_API_KEY=... node scripts/pick-fish-voice.mjs
 *
 * Prints the reference_id of recommended voices so you can paste them
 * into .env as FISH_VOICE_ID_ZH / FISH_VOICE_ID_EN.
 */
const API = "https://api.fish.audio";

const KEY = process.env.FISH_API_KEY;
if (!KEY) {
  console.error("Set FISH_API_KEY in env");
  process.exit(1);
}

async function listModels() {
  // Fish Audio's model list endpoint. Returns pages of voice models.
  // We ask for a large page + filter client-side to avoid pagination.
  const resp = await fetch(`${API}/model?page_size=100&sort_by=score`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`list models ${resp.status}: ${text.slice(0, 300)}`);
  }
  return resp.json();
}

function pickBest(models, preferLangs, preferGender = "female") {
  // models is expected to have an items array
  const items = models?.items ?? models?.data ?? models ?? [];
  if (!Array.isArray(items)) return null;

  // Score each candidate
  const scored = items
    .map((m) => {
      const langs = (m.languages ?? []).map((l) => String(l).toLowerCase());
      const tags = (m.tags ?? []).map((t) => String(t).toLowerCase());
      const title = String(m.title ?? "").toLowerCase();
      const desc = String(m.description ?? "").toLowerCase();
      const text = title + " " + desc + " " + tags.join(" ");

      let score = 0;
      // Must have the target language
      const hasLang = preferLangs.some(
        (l) => langs.includes(l) || text.includes(l),
      );
      if (!hasLang) return null;
      score += 10;
      // Prefer female voice
      if (text.includes(preferGender)) score += 3;
      if (text.includes("女") || text.includes("female")) score += 3;
      // Prefer "professional / business / gentle / warm" tones for B2B
      for (const kw of ["business", "professional", "gentle", "warm", "商务", "温柔", "知性"]) {
        if (text.includes(kw)) score += 2;
      }
      // Avoid character / anime voices
      for (const kw of ["anime", "character", "loli", "萝莉", "二次元"]) {
        if (text.includes(kw)) score -= 3;
      }
      // Bonus for popularity signals
      if (typeof m.like_count === "number") score += Math.log10(m.like_count + 1);
      if (typeof m.used_count === "number") score += Math.log10(m.used_count + 1) * 0.5;

      return { m, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}

const models = await listModels();
console.log(
  `Fetched ${(models.items ?? models.data ?? models ?? []).length} voice models\n`,
);

const zh = pickBest(models, ["zh", "chinese", "mandarin", "中文"]);
const en = pickBest(models, ["en", "english"]);

console.log("=== Top 5 Chinese candidates ===");
for (const { m, score } of zh ?? []) {
  console.log(`  score=${score.toFixed(1)}  id=${m._id ?? m.id ?? "?"}  "${m.title}"`);
  if (m.description) console.log(`    ${m.description.slice(0, 120)}`);
}
console.log("\n=== Top 5 English candidates ===");
for (const { m, score } of en ?? []) {
  console.log(`  score=${score.toFixed(1)}  id=${m._id ?? m.id ?? "?"}  "${m.title}"`);
  if (m.description) console.log(`    ${m.description.slice(0, 120)}`);
}

const topZh = zh?.[0]?.m;
const topEn = en?.[0]?.m;
console.log("\n========================================================");
console.log("✅ Auto-picked voices. Add to .env:");
console.log("========================================================\n");
if (topZh) console.log(`FISH_VOICE_ID_ZH=${topZh._id ?? topZh.id}`);
if (topEn) console.log(`FISH_VOICE_ID_EN=${topEn._id ?? topEn.id}`);
console.log("");
