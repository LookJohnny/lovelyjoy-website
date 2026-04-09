/**
 * TTS layer for the AI Sales Guide.
 *
 * Two engines, both Vercel/Node-friendly:
 *   - "edge"  → Microsoft Edge TTS via `msedge-tts` npm package
 *   - "fish"  → Fish Audio (https://fish.audio) via plain fetch
 *
 * PLUSH_TTS_ENGINE picks the primary. If fish is selected but the key/voice
 * id is missing, we auto-fall-back to edge.
 *
 * Output is always { audio: base64, mime, durationMs }.
 *
 * Runs on the Node.js serverless runtime (default for /app/api routes).
 */

import type { Locale } from "./types";

export interface TTSResult {
  audio: string;       // base64
  mime: string;        // "audio/mpeg"
  durationMs: number;  // estimated; frontend calibrates against real decode
}

const ENGINE = (process.env.PLUSH_TTS_ENGINE || "edge").toLowerCase();
const EDGE_VOICE_DEFAULT =
  process.env.PLUSH_EDGE_VOICE || "zh-CN-XiaoxiaoNeural";
const FISH_KEY = process.env.FISH_API_KEY || "";
const FISH_VOICE_ID = process.env.FISH_VOICE_ID || "";
const FISH_MODEL = process.env.FISH_MODEL || "s2-pro";

// Edge TTS voices per locale. The newer *Multilingual* variants are more
// expressive but `msedge-tts` may not carry them — we stick with the
// classic Neural voices that are known to stream successfully.
// If you want Fish Audio quality, set PLUSH_TTS_ENGINE=fish and fill in
// FISH_API_KEY + FISH_VOICE_ID(_XX).
const EDGE_VOICE_BY_LOCALE: Record<Locale, string> = {
  zh: process.env.PLUSH_EDGE_VOICE_ZH || "zh-CN-XiaoxiaoNeural",
  en: process.env.PLUSH_EDGE_VOICE_EN || "en-US-AriaNeural",
  ja: process.env.PLUSH_EDGE_VOICE_JA || "ja-JP-NanamiNeural",
  ko: process.env.PLUSH_EDGE_VOICE_KO || "ko-KR-SunHiNeural",
  es: process.env.PLUSH_EDGE_VOICE_ES || "es-ES-ElviraNeural",
};

// Fish Audio voice IDs per locale. Each entry is a reference_id from fish.audio.
// Falls back to the generic FISH_VOICE_ID if a locale-specific one is not set.
const FISH_VOICE_BY_LOCALE: Record<Locale, string> = {
  zh: process.env.FISH_VOICE_ID_ZH || FISH_VOICE_ID,
  en: process.env.FISH_VOICE_ID_EN || FISH_VOICE_ID,
  ja: process.env.FISH_VOICE_ID_JA || FISH_VOICE_ID,
  ko: process.env.FISH_VOICE_ID_KO || FISH_VOICE_ID,
  es: process.env.FISH_VOICE_ID_ES || FISH_VOICE_ID,
};

// ─────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────
export async function synthesize(text: string, locale: Locale): Promise<TTSResult> {
  if (!text?.trim()) {
    return { audio: "", mime: "audio/mpeg", durationMs: 0 };
  }

  const fishVoice = FISH_VOICE_BY_LOCALE[locale] || FISH_VOICE_ID;
  if (ENGINE === "fish" && FISH_KEY && fishVoice) {
    try {
      return await synthesizeFish(text, fishVoice);
    } catch (e) {
      console.warn("[ai-guide tts] Fish failed, falling back to Edge:", e);
    }
  }

  return synthesizeEdge(text, locale);
}

// ─────────────────────────────────────────────────────────────────
// Fish Audio
// Docs: https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech
//
// Local dev note: on a China-based dev machine api.fish.audio is usually
// unreachable direct and needs an HTTP proxy (e.g. Clash on 127.0.0.1:7897).
// Node's native fetch ignores HTTP_PROXY / HTTPS_PROXY env vars, so we
// detect the proxy and route the call through undici's ProxyAgent.
// On Vercel the proxy env is unset so we fall through to native fetch.
// ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _undiciCache: any = null;
async function fetchWithOptionalProxy(url: string, init: RequestInit): Promise<Response> {
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    "";
  if (!proxyUrl) {
    return fetch(url, init);
  }
  if (!_undiciCache) {
    try {
      _undiciCache = await import("undici");
    } catch (e) {
      console.warn("[ai-guide tts] undici unavailable, falling back to native fetch", e);
      return fetch(url, init);
    }
  }
  const { fetch: undiciFetch, ProxyAgent } = _undiciCache;
  const dispatcher = new ProxyAgent(proxyUrl);
  // undici's fetch shape is compatible enough with our use
  const resp = await undiciFetch(url, { ...init, dispatcher });
  return resp as unknown as Response;
}

async function synthesizeFish(text: string, voiceId: string): Promise<TTSResult> {
  const resp = await fetchWithOptionalProxy("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FISH_KEY}`,
      "Content-Type": "application/json",
      model: FISH_MODEL,
    },
    body: JSON.stringify({
      text,
      reference_id: voiceId,
      format: "mp3",
      mp3_bitrate: 128,
      sample_rate: 44100,
      latency: "balanced",
      normalize: true,
      prosody: { speed: 1.0, volume: 0, normalize_loudness: true },
    }),
  });
  if (!resp.ok) {
    throw new Error(`Fish ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  const buf = await resp.arrayBuffer();
  return {
    audio: bufferToBase64(buf),
    mime: "audio/mpeg",
    // 128 kbps mp3 ≈ 16 KB/s
    durationMs: Math.max(500, Math.round((buf.byteLength / 16000) * 1000)),
  };
}

// ─────────────────────────────────────────────────────────────────
// Microsoft Edge TTS (via msedge-tts npm package)
//
// We delegate the tricky WebSocket + SSML protocol to the maintained
// `msedge-tts` package. It returns a Node.js Readable audio stream
// which we collect into a single Uint8Array and base64-encode.
// ─────────────────────────────────────────────────────────────────
async function synthesizeEdge(text: string, locale: Locale): Promise<TTSResult> {
  const voice = EDGE_VOICE_BY_LOCALE[locale] ?? EDGE_VOICE_DEFAULT;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("msedge-tts");
  const Ctor = mod.MsEdgeTTS ?? mod.default?.MsEdgeTTS ?? mod.default;
  if (!Ctor) {
    throw new Error("msedge-tts: constructor not found on module");
  }
  const OUTPUT_FORMAT =
    mod.OUTPUT_FORMAT?.AUDIO_24KHZ_48KBITRATE_MONO_MP3 ??
    mod.default?.OUTPUT_FORMAT?.AUDIO_24KHZ_48KBITRATE_MONO_MP3 ??
    "audio-24khz-48kbitrate-mono-mp3";

  const tts = new Ctor();
  await tts.setMetadata(voice, OUTPUT_FORMAT);

  const { audioStream } = await tts.toStream(text);
  const chunks: Uint8Array[] = [];
  await new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioStream.on("data", (c: any) => {
      chunks.push(c instanceof Uint8Array ? c : new Uint8Array(c));
    });
    audioStream.on("end", () => resolve());
    audioStream.on("error", (e: Error) => reject(e));
    audioStream.on("close", () => {
      // Some implementations emit 'close' without 'end' — treat as success
      resolve();
    });
  });

  const total = chunks.reduce((n, c) => n + c.length, 0);
  if (total === 0) throw new Error("Edge TTS returned empty audio");
  const merged = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    merged.set(c, off);
    off += c.length;
  }

  // 48 kbps mp3 ≈ 6 KB/s
  const durationMs = Math.max(500, Math.round((merged.length / 6000) * 1000));
  return {
    audio: bufferToBase64(merged.buffer),
    mime: "audio/mpeg",
    durationMs,
  };
}

// ─────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────
function bufferToBase64(buf: ArrayBufferLike): string {
  const bytes = new Uint8Array(buf);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).btoa(binary);
}
