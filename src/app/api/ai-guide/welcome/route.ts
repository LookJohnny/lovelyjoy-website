/**
 * POST /api/ai-guide/welcome
 *
 *   { locale: "zh"|"en"|"ja"|"ko"|"es" }
 *
 * Triggered when a buyer first lands on the AI guide page (or clicks "Start").
 * Returns the same shape as /chat — plan + audio.
 */
import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai-guide/llm";
import { synthesize } from "@/lib/ai-guide/tts";
import { WELCOME_TRIGGER } from "@/lib/ai-guide/persona";
import type { Locale } from "@/lib/ai-guide/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED: Locale[] = ["zh", "en", "ja", "ko", "es"];

export async function POST(req: Request) {
  let locale: Locale = "en";
  try {
    const body = await req.json();
    const v = String(body?.locale ?? "en").toLowerCase();
    if (ALLOWED.includes(v as Locale)) locale = v as Locale;
  } catch {
    // ignore — keep default
  }

  const plan = await generatePlan(WELCOME_TRIGGER[locale], { locale });

  let audio = "";
  let mime = "audio/mpeg";
  let durationMs = 0;
  try {
    const t = await synthesize(plan.utterance, locale);
    audio = t.audio;
    mime = t.mime;
    durationMs = t.durationMs;
  } catch (e) {
    console.warn("[ai-guide welcome] tts failed:", e);
  }

  return NextResponse.json({ plan, audio, mime, durationMs });
}
