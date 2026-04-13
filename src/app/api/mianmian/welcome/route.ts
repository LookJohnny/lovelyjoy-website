/**
 * POST /api/mianmian/welcome
 *
 * 迎宾触发：客人靠近时/页面加载时调用。
 */
import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/mianmian/llm";
import { synthesize } from "@/lib/ai-guide/tts";
import { WELCOME_TRIGGER } from "@/lib/mianmian/persona";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const plan = await generatePlan(WELCOME_TRIGGER);

  let audio = "";
  let mime = "audio/mpeg";
  let durationMs = 0;
  try {
    const t = await synthesize(plan.utterance, "zh");
    audio = t.audio;
    mime = t.mime;
    durationMs = t.durationMs;
  } catch (e) {
    console.warn("[mianmian welcome] tts failed:", e);
  }

  return NextResponse.json({ plan, audio, mime, durationMs });
}
