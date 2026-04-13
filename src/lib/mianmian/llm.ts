/**
 * LLM client for 棉棉 — 复用 Joy 的 OpenAI-compatible 调用模式。
 *
 * 默认 DeepSeek，可通过 PLUSH_LLM_PROVIDER 切换到 Qwen / Doubao。
 */
import { buildSystemPrompt, fallbackPlan } from "./persona";
import type { MianmianPlan, RAGFact } from "./types";

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
  history?: ChatMessage[];
  facts?: RAGFact[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

const PROVIDER_NAME = (
  process.env.PLUSH_LLM_PROVIDER || "deepseek"
).toLowerCase();
const PROVIDER = PROVIDERS[PROVIDER_NAME] ?? PROVIDERS.deepseek;
const API_KEY = process.env[PROVIDER.env_key] || "";
const MODEL = process.env.PLUSH_LLM_MODEL || PROVIDER.default_model;

function formatFacts(facts: RAGFact[] | undefined): string {
  if (!facts || facts.length === 0) {
    return `[已知商品]\n(暂无——请根据客人需求给出通用建议，或说"我帮您问下店长")`;
  }
  const lines = facts.map((f, i) => {
    const parts: string[] = [];
    parts.push(`[${i + 1}] id=${f.id} | ${f.title}`);
    if (f.price != null) parts.push(`价格=${f.price}`);
    if (f.size) parts.push(`尺寸=${f.size}`);
    if (f.material) parts.push(`材质=${f.material}`);
    if (f.age) parts.push(`适合年龄=${f.age}`);
    if (f.washable) parts.push(`可水洗=${f.washable}`);
    if (f.highlight) parts.push(`亮点=${f.highlight}`);
    if (f.stock) parts.push(`库存=${f.stock}`);
    return parts.join(" | ");
  });
  return `[已知商品]\n${lines.join("\n")}`;
}

export async function generatePlan(
  userText: string,
  opts: ChatOptions = {},
): Promise<
  MianmianPlan & {
    _meta: { latency_ms: number; provider: string; model: string };
  }
> {
  const start = Date.now();

  if (!API_KEY) {
    console.warn(`[mianmian] Missing ${PROVIDER.env_key}, returning fallback`);
    return {
      ...fallbackPlan(),
      _meta: { latency_ms: 0, provider: PROVIDER_NAME, model: MODEL },
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
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
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 25_000,
  );

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
      throw new Error(
        `${PROVIDER_NAME} ${resp.status}: ${text.slice(0, 300)}`,
      );
    }
    const json = await resp.json();
    const raw: string = json?.choices?.[0]?.message?.content ?? "";
    const parsed = parsePlan(raw);

    return {
      ...parsed,
      _meta: {
        latency_ms: Date.now() - start,
        provider: PROVIDER_NAME,
        model: MODEL,
      },
    };
  } catch (err) {
    console.error("[mianmian] LLM call failed:", err);
    return {
      ...fallbackPlan(),
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
// 解析 LLM 返回的 JSON
// ─────────────────────────────────────────────────────────────────
function parsePlan(raw: string): MianmianPlan {
  let text = (raw || "").trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  let data: Partial<MianmianPlan> = {};
  try {
    data = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        data = JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
  }

  if (!data || !data.utterance) {
    return fallbackPlan();
  }

  return {
    utterance: stripEmoji(String(data.utterance)).slice(0, 400),
    language: "zh",
    emotion_arc:
      Array.isArray(data.emotion_arc) && data.emotion_arc.length > 0
        ? data.emotion_arc
        : [{ t: 0.5, emotion: "neutral", intensity: 0.5 }],
    gesture_track:
      Array.isArray(data.gesture_track) && data.gesture_track.length > 0
        ? data.gesture_track
        : [{ t: 0.5, gesture: "idle", hold_ms: 500 }],
    product_cards: Array.isArray(data.product_cards)
      ? data.product_cards
      : [],
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
