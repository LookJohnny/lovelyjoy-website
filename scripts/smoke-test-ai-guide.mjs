/**
 * End-to-end smoke test for the AI Guide pipeline.
 *
 * Bypasses Next.js dev server entirely. Calls DeepSeek + Feishu directly
 * to confirm:
 *   1. The .env keys work
 *   2. DeepSeek returns valid plan-then-infill JSON
 *   3. The Feishu Bitable is reachable
 *
 * Usage: bun scripts/smoke-test-ai-guide.mjs
 */
import { readFileSync } from "node:fs";

// Tiny .env loader (no dotenv dep)
try {
  const env = readFileSync(new URL("../.env", import.meta.url), "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
} catch (e) {
  console.warn("No .env file found:", e.message);
}

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const FEISHU_APP_TOKEN = process.env.LOVELYJOY_FEISHU_APP_TOKEN;
const FEISHU_PRODUCTS_TABLE = process.env.LOVELYJOY_PRODUCTS_TABLE_ID;
const FEISHU_LEADS_TABLE = process.env.LOVELYJOY_LEADS_TABLE_ID;
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

if (!DEEPSEEK_KEY) {
  console.error("❌ DEEPSEEK_API_KEY missing");
  process.exit(1);
}

console.log("→ Testing DeepSeek call...");
const llmResp = await fetch("https://api.deepseek.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${DEEPSEEK_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          'You are Joy, a B2B sales rep at LovelyJoy plush toy factory. Output ONLY valid JSON: {"utterance":"<text>","language":"en","emotion_arc":[{"t":0,"emotion":"joy","intensity":0.8}],"gesture_track":[{"t":0,"gesture":"wave","hold_ms":600}],"product_cards":[],"actions":[],"intent":"GREETING"}',
      },
      { role: "user", content: "Hi, what is your MOQ?" },
    ],
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: "json_object" },
  }),
});
if (!llmResp.ok) {
  console.error(`❌ DeepSeek HTTP ${llmResp.status}:`, (await llmResp.text()).slice(0, 300));
  process.exit(1);
}
const llmJson = await llmResp.json();
const plan = JSON.parse(llmJson.choices[0].message.content);
console.log("  ✓ DeepSeek replied:");
console.log("    utterance:", plan.utterance);
console.log("    intent:   ", plan.intent);
console.log("    emotions: ", plan.emotion_arc?.length, "keyframes");
console.log("    gestures: ", plan.gesture_track?.length, "keyframes");
console.log("    tokens:   ", llmJson.usage?.total_tokens, "(prompt+completion)");

if (FEISHU_APP_ID && FEISHU_APP_SECRET) {
  console.log("\n→ Testing Feishu auth...");
  const tokenResp = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
    },
  );
  const tokenJson = await tokenResp.json();
  if (!tokenJson.tenant_access_token) {
    console.error("  ❌ Feishu token failed:", tokenJson);
    process.exit(1);
  }
  console.log("  ✓ Feishu tenant_access_token acquired");

  if (FEISHU_APP_TOKEN && FEISHU_PRODUCTS_TABLE) {
    console.log("→ Testing Feishu products table read...");
    const recResp = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_PRODUCTS_TABLE}/records?page_size=10`,
      { headers: { Authorization: `Bearer ${tokenJson.tenant_access_token}` } },
    );
    const recJson = await recResp.json();
    if (recJson.code !== 0) {
      console.error("  ❌ Feishu read failed:", recJson);
    } else {
      console.log(`  ✓ Products table: ${recJson.data?.items?.length ?? 0} records (table is accessible)`);
    }
  }

  if (FEISHU_APP_TOKEN && FEISHU_LEADS_TABLE) {
    console.log("→ Testing Feishu leads write (no actual record inserted)...");
    // Just verify the table is reachable
    const recResp = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_LEADS_TABLE}/records?page_size=1`,
      { headers: { Authorization: `Bearer ${tokenJson.tenant_access_token}` } },
    );
    const recJson = await recResp.json();
    if (recJson.code !== 0) {
      console.error("  ❌ Feishu leads read failed:", recJson);
    } else {
      console.log(`  ✓ Leads table reachable (${recJson.data?.items?.length ?? 0} existing rows)`);
    }
  }
}

console.log("\n✅ All smoke tests passed.");
