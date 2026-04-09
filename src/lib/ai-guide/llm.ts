/**
 * LLM client for Joy — calls a Chinese cloud LLM via OpenAI-compatible HTTP.
 *
 * Default provider: DeepSeek (deepseek-chat = DeepSeek-V3). Strongest Chinese,
 * cheap, no proxy needed from China. Switchable via PLUSH_LLM_PROVIDER env.
 *
 * No SDK is used — we hand-roll fetch() so the route stays Edge-runtime safe
 * (Vercel Edge Functions don't support Node-only SDKs without bundling).
 */
import { buildSystemPrompt, fallbackPlan } from "./persona";
import type { AIGuidePlan, Locale, RAGFact } from "./types";

interface ProviderConfig {
  base_url: string;
  default_model: string;
  env_key: string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  deepseek: {
    base_url: "https://api.deepseek.com/v1",
    default_model: "deepseek-chat",
    env_key: "DEEPSEEK_API_KEY",
  },
  qwen: {
    base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    default_model: "qwen-plus",
    env_key: "DASHSCOPE_API_KEY",
  },
  doubao: {
    base_url: "https://ark.cn-beijing.volces.com/api/v3",
    default_model: "doubao-1-5-pro-32k",
    env_key: "ARK_API_KEY",
  },
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  locale: Locale;
  history?: ChatMessage[];
  facts?: RAGFact[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

const PROVIDER_NAME = (process.env.PLUSH_LLM_PROVIDER || "deepseek").toLowerCase();
const PROVIDER = PROVIDERS[PROVIDER_NAME] ?? PROVIDERS.deepseek;
const API_KEY = process.env[PROVIDER.env_key] || "";
const MODEL = process.env.PLUSH_LLM_MODEL || PROVIDER.default_model;

function formatFacts(facts: RAGFact[] | undefined): string {
  if (!facts || facts.length === 0) {
    return "[PRODUCT FACTS]\n(none — keep recommendations general or ask the buyer to clarify)";
  }
  const lines = facts.map((f, i) => {
    const parts: string[] = [];
    parts.push(`[${i + 1}] id=${f.id} | ${f.title}`);
    if (f.category) parts.push(`category=${f.category}`);
    if (f.material) parts.push(`material=${f.material}`);
    if (f.sizes) parts.push(`sizes=${f.sizes}`);
    if (f.moq) parts.push(`moq=${f.moq}`);
    if (f.lead_time) parts.push(`lead_time=${f.lead_time}`);
    if (f.certifications && f.certifications.length)
      parts.push(`certs=${f.certifications.join(",")}`);
    if (f.description) parts.push(`desc=${f.description.slice(0, 120)}`);
    return parts.join(" | ");
  });
  return `[PRODUCT FACTS]\n${lines.join("\n")}`;
}

export async function generatePlan(
  userText: string,
  opts: ChatOptions,
): Promise<AIGuidePlan & { _meta: { latency_ms: number; provider: string; model: string } }> {
  const start = Date.now();

  if (!API_KEY) {
    console.warn(`[ai-guide] Missing ${PROVIDER.env_key}, returning fallback`);
    return {
      ...fallbackPlan(opts.locale),
      _meta: {
        latency_ms: 0,
        provider: PROVIDER_NAME,
        model: MODEL,
      },
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(opts.locale) },
    { role: "system", content: formatFacts(opts.facts) },
    ...(opts.history ?? []),
    { role: "user", content: userText },
  ];

  const body = {
    model: MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 800,
    stream: false,
    response_format: { type: "json_object" },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 25_000);

  try {
    const resp = await fetch(`${PROVIDER.base_url}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`${PROVIDER_NAME} ${resp.status}: ${text.slice(0, 300)}`);
    }
    const json = await resp.json();
    const raw: string = json?.choices?.[0]?.message?.content ?? "";
    const parsed = parsePlan(raw, opts.locale);

    return {
      ...parsed,
      _meta: {
        latency_ms: Date.now() - start,
        provider: PROVIDER_NAME,
        model: MODEL,
      },
    };
  } catch (err) {
    console.error("[ai-guide] LLM call failed:", err);
    return {
      ...fallbackPlan(opts.locale),
      _meta: {
        latency_ms: Date.now() - start,
        provider: PROVIDER_NAME,
        model: MODEL,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────────
// Parse and validate the JSON the LLM returned
// ─────────────────────────────────────────────────────────────────
function parsePlan(raw: string, locale: Locale): AIGuidePlan {
  let text = (raw || "").trim();
  // Strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  let data: Partial<AIGuidePlan> = {};
  try {
    data = JSON.parse(text);
  } catch {
    // Try to extract the largest JSON object
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        data = JSON.parse(m[0]);
      } catch {
        // give up — return fallback below
      }
    }
  }

  if (!data || !data.utterance) {
    return fallbackPlan(locale);
  }

  // Strip emoji from utterance — they get read aloud by TTS
  const cleanUtterance = stripEmoji(String(data.utterance)).slice(0, 400);

  return {
    utterance: cleanUtterance,
    language: (data.language as Locale) || locale,
    emotion_arc:
      Array.isArray(data.emotion_arc) && data.emotion_arc.length > 0
        ? data.emotion_arc
        : [{ t: 0.5, emotion: "neutral", intensity: 0.5 }],
    gesture_track:
      Array.isArray(data.gesture_track) && data.gesture_track.length > 0
        ? data.gesture_track
        : [{ t: 0.5, gesture: "idle", hold_ms: 500 }],
    product_cards: Array.isArray(data.product_cards) ? data.product_cards : [],
    actions: Array.isArray(data.actions) ? data.actions : [],
    intent: data.intent ?? "SMALL_TALK",
    follow_up: data.follow_up ?? "",
  };
}

const EMOJI_RE =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

function stripEmoji(s: string): string {
  return s.replace(EMOJI_RE, "").replace(/\s{2,}/g, " ").trim();
}
