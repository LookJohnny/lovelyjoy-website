/**
 * POST /api/ai-guide/chat
 *
 *   { text: string, locale: "zh"|"en"|"ja"|"ko"|"es", history?: [...] }
 *
 * Returns:
 *   { plan: AIGuidePlan, audio: base64, mime, durationMs }
 *
 * Pipeline: searchProducts → generatePlan (LLM) → synthesize (TTS) → respond.
 */
import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai-guide/llm";
import { searchProducts } from "@/lib/ai-guide/feishu";
import { synthesize } from "@/lib/ai-guide/tts";
import type { Locale, RAGFact } from "@/lib/ai-guide/types";

// Force Node runtime — Edge TTS WS + Feishu fetch are easier on Node
export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_LOCALES: Locale[] = ["zh", "en", "ja", "ko", "es"];

interface ChatBody {
  text?: string;
  locale?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  skipAudio?: boolean;
}

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const localeRaw = (body.locale ?? "en").toLowerCase();
  const locale: Locale = ALLOWED_LOCALES.includes(localeRaw as Locale)
    ? (localeRaw as Locale)
    : "en";

  // 1. RAG: pull top product facts
  let facts: RAGFact[] = [];
  try {
    facts = await searchProducts(text, 4);
  } catch (e) {
    console.warn("[ai-guide chat] searchProducts failed:", e);
  }

  // 2. LLM: generate plan
  const plan = await generatePlan(text, {
    locale,
    facts,
    history: body.history,
  });

  // 3. TTS (skippable for fast iteration / future streaming)
  let audio = "";
  let mime = "audio/mpeg";
  let durationMs = 0;
  if (!body.skipAudio) {
    try {
      const t = await synthesize(plan.utterance, locale);
      audio = t.audio;
      mime = t.mime;
      durationMs = t.durationMs;
    } catch (e) {
      console.warn("[ai-guide chat] synthesize failed:", e);
    }
  }

  return NextResponse.json({
    plan,
    audio,
    mime,
    durationMs,
    facts,
  });
}
