/**
 * POST /api/mianmian/chat
 *
 *   { text: string, history?: [...] }
 *
 * Pipeline: searchProducts → generatePlan (LLM) → synthesize (TTS) → respond.
 */
import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/mianmian/llm";
import { searchProducts } from "@/lib/mianmian/feishu";
import { synthesize } from "@/lib/ai-guide/tts";
import type { RAGFact } from "@/lib/mianmian/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatBody {
  text?: string;
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

  // 1. RAG
  let facts: RAGFact[] = [];
  try {
    facts = await searchProducts(text, 4);
  } catch (e) {
    console.warn("[mianmian chat] searchProducts failed:", e);
  }

  // 2. LLM
  const plan = await generatePlan(text, { facts, history: body.history });

  // 3. TTS
  let audio = "";
  let mime = "audio/mpeg";
  let durationMs = 0;
  if (!body.skipAudio) {
    try {
      const t = await synthesize(plan.utterance, "zh");
      audio = t.audio;
      mime = t.mime;
      durationMs = t.durationMs;
    } catch (e) {
      console.warn("[mianmian chat] synthesize failed:", e);
    }
  }

  return NextResponse.json({ plan, audio, mime, durationMs, facts });
}
