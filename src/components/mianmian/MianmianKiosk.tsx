"use client";

/**
 * MianmianKiosk — 棉棉 · 爱儿采毛绒玩具品牌形象大使
 *
 * Rive 2D 动画角色 + plan-then-infill 对话系统：
 *   - Rive 状态机驱动 lip-sync (isTalking boolean)
 *   - 粉色主题 + 侧边栏 + 快捷问题 + 商品卡
 *   - 摄像头客流检测自动迎宾
 *   - 手机号留资
 *   - Web Speech 语音输入
 *
 * 换角色只需替换 /images/mianmian/chatbot.riv 文件，
 * 确保状态机名和 input 名一致即可。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";
import type { MianmianPlan, ProductCard } from "@/lib/mianmian/types";

// ─── Rive config (换角色时调这里) ───
const RIVE_FILE = "/images/mianmian/chatbot.riv";
const STATE_MACHINE = "Lip Sync";
const INPUT_TALKING = "isTalking";

// ─── Quick questions ───
const QUICK_QUESTIONS = [
  { label: "送3岁宝宝", q: "我想买个送3岁宝宝的，预算100以内" },
  { label: "送男朋友", q: "有没有适合送男朋友的" },
  { label: "办公室解压", q: "办公室解压用什么好" },
  { label: "可水洗的", q: "可以水洗的有哪些" },
];

// ─── Camera detection constants ───
const DETECT_FPS = 2;
const DETECT_W = 160;
const DETECT_H = 120;
const MOTION_THRESHOLD = 30;
const MOTION_RATIO = 0.04;
const COOLDOWN_S = 60;
const IDLE_RESET_S = 30;

type Mode = "idle" | "listening" | "thinking" | "speaking";

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export default function MianmianKiosk() {
  // ─── State ───
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bubble, setBubble] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [cards, setCards] = useState<ProductCard[]>([]);
  const [micState, setMicState] = useState<"off" | "on" | "denied">("off");
  const [showQR, setShowQR] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  // Camera detection
  const [detectEnabled, setDetectEnabled] = useState(false);
  const [detectStatus, setDetectStatus] = useState("检测关");

  // ─── Refs ───
  const historyRef = useRef<ChatHistoryItem[]>([]);
  const shouldListenRef = useRef(false);
  const recognitionRef = useRef<unknown>(null);
  const cardTimerRef = useRef<number | null>(null);
  const audioRef = useRef<{
    ctx: AudioContext | null;
    currentSource: AudioBufferSourceNode | null;
  }>({ ctx: null, currentSource: null });
  const camVideoRef = useRef<HTMLVideoElement | null>(null);
  const detectRef = useRef<{
    stream: MediaStream | null;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    prevFrame: ImageData | null;
    timer: number | null;
    lastGreetTime: number;
    lastMotionTime: number;
    customerPresent: boolean;
  }>({
    stream: null, canvas: null, ctx: null, prevFrame: null,
    timer: null, lastGreetTime: 0, lastMotionTime: 0, customerPresent: false,
  });

  // ─── Rive avatar ───
  const { RiveComponent, rive } = useRive({
    src: RIVE_FILE,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  const isTalkingInput = useStateMachineInput(
    rive,
    STATE_MACHINE,
    INPUT_TALKING,
  );

  // Sync speaking state → Rive state machine
  useEffect(() => {
    if (isTalkingInput) isTalkingInput.value = isSpeaking;
  }, [isSpeaking, isTalkingInput]);

  // ─── Lock body scroll, hide site chrome ───
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const style = document.createElement("style");
    style.setAttribute("data-mianmian-kiosk", "");
    style.textContent = `body > header, body > footer, body [data-nav-header], body [data-site-footer] { display: none !important; } html, body { overflow: hidden !important; }`;
    document.head.appendChild(style);
    return () => { document.body.style.overflow = prev; style.remove(); };
  }, []);

  // ─── Audio playback ───
  const ensureAudioCtx = useCallback(() => {
    if (!audioRef.current.ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      audioRef.current.ctx = new Ctx();
    }
  }, []);

  const playAudio = useCallback(async (b64: string): Promise<void> => {
    if (!b64) return;
    ensureAudioCtx();
    const ctx = audioRef.current.ctx!;
    if (ctx.state === "suspended") await ctx.resume();

    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const audioBuf = await ctx.decodeAudioData(buf.buffer);

    const src = ctx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(ctx.destination);
    audioRef.current.currentSource = src;

    setIsSpeaking(true);
    await new Promise<void>((resolve) => {
      src.onended = () => {
        setIsSpeaking(false);
        audioRef.current.currentSource = null;
        resolve();
      };
      src.start();
    });
  }, [ensureAudioCtx]);

  // ─── Speech recognition ───
  const startRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = recognitionRef.current as any;
    if (!rec) return;
    try { rec.start(); setMode((m) => (m === "thinking" || m === "speaking" ? m : "listening")); } catch {}
  }, []);

  const stopRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { (recognitionRef.current as any)?.stop(); } catch {}
  }, []);

  // ─── Chat API ───
  const sendChat = useCallback(
    async (text: string, opts: { isWelcome?: boolean } = {}) => {
      if (!text.trim() && !opts.isWelcome) return;
      stopRecognition();
      setMode("thinking");
      setBubble(""); setFollowUp("");

      try {
        const url = opts.isWelcome ? "/api/mianmian/welcome" : "/api/mianmian/chat";
        const body = opts.isWelcome ? {} : { text, history: historyRef.current.slice(-6) };
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const plan = data.plan as MianmianPlan;

        setBubble(plan.utterance || "");
        setFollowUp(plan.follow_up || "");

        if (plan.product_cards?.length) {
          setCards(plan.product_cards);
          if (cardTimerRef.current) window.clearTimeout(cardTimerRef.current);
          cardTimerRef.current = window.setTimeout(() => setCards([]), 15000);
        }

        for (const act of plan.actions || []) {
          if (act.type === "show_qr") setShowQR(true);
          if (act.type === "collect_phone") setShowPhoneForm(true);
        }

        if (!opts.isWelcome && text.trim()) {
          const next: ChatHistoryItem[] = [
            ...historyRef.current,
            { role: "user" as const, content: text },
            { role: "assistant" as const, content: plan.utterance },
          ];
          historyRef.current = next.slice(-12);
        }

        if (data.audio) {
          setMode("speaking");
          await playAudio(data.audio);
        }
      } catch (err) {
        console.error("[mianmian] chat failed", err);
        setBubble("不好意思，出了点小问题，您再试试？");
      } finally {
        setMode("idle");
        if (shouldListenRef.current) window.setTimeout(() => startRecognition(), 400);
      }
    },
    [playAudio, startRecognition, stopRecognition],
  );

  // Web Speech setup
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      if (last?.isFinal) { const t = (last[0]?.transcript ?? "").trim(); if (t) sendChat(t); }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { shouldListenRef.current = false; setMicState("denied"); }
    };
    rec.onend = () => {
      if (!shouldListenRef.current) { setMode((m) => (m === "thinking" || m === "speaking" ? m : "idle")); return; }
      setMode((m) => {
        if (m === "thinking" || m === "speaking") return m;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.setTimeout(() => { if (shouldListenRef.current) try { (recognitionRef.current as any)?.start(); } catch {} }, 250);
        return "listening";
      });
    };
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} recognitionRef.current = null; };
  }, [sendChat]);

  // ─── Start ───
  const handleStart = useCallback(async () => {
    if (started) return;
    setStarted(true);
    ensureAudioCtx();
    try { await audioRef.current.ctx?.resume(); } catch {}
    if (navigator.permissions?.query) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = await navigator.permissions.query({ name: "microphone" as any });
        if (status.state === "granted") { shouldListenRef.current = true; setMicState("on"); setTimeout(() => startRecognition(), 600); }
      } catch {}
    }
    await sendChat("", { isWelcome: true });
  }, [started, sendChat, startRecognition, ensureAudioCtx]);

  // Mic toggle
  const handleMicToggle = useCallback(async () => {
    if (micState === "on") { shouldListenRef.current = false; stopRecognition(); setMicState("off"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) track.stop();
      setMicState("on"); shouldListenRef.current = true; setTimeout(() => startRecognition(), 200);
    } catch { setMicState("denied"); }
  }, [micState, startRecognition, stopRecognition]);

  // ─── Camera detection ───
  const sendWelcome = useCallback(() => sendChat("", { isWelcome: true }), [sendChat]);

  const detectFrame = useCallback(() => {
    const d = detectRef.current;
    const video = camVideoRef.current;
    if (!d.stream || !video || video.readyState < 2 || !d.ctx) return;
    d.ctx.drawImage(video, 0, 0, DETECT_W, DETECT_H);
    const frame = d.ctx.getImageData(0, 0, DETECT_W, DETECT_H);
    if (!d.prevFrame) { d.prevFrame = frame; return; }
    const prev = d.prevFrame.data, cur = frame.data;
    let changed = 0;
    for (let i = 0; i < cur.length; i += 4) {
      const g1 = (prev[i] * 299 + prev[i + 1] * 587 + prev[i + 2] * 114) / 1000;
      const g2 = (cur[i] * 299 + cur[i + 1] * 587 + cur[i + 2] * 114) / 1000;
      if (Math.abs(g1 - g2) > MOTION_THRESHOLD) changed++;
    }
    d.prevFrame = frame;
    const now = Date.now();
    if (changed / (DETECT_W * DETECT_H) > MOTION_RATIO) {
      d.lastMotionTime = now;
      if (!d.customerPresent) d.customerPresent = true;
      const cd = COOLDOWN_S - (now - d.lastGreetTime) / 1000;
      if (cd <= 0) { d.lastGreetTime = now; setDetectStatus("顾客来了!"); sendWelcome(); setTimeout(() => setDetectStatus(`冷却 ${COOLDOWN_S}s`), 2000); }
      else setDetectStatus(`冷却 ${Math.ceil(cd)}s`);
    } else {
      if (d.customerPresent && now - d.lastMotionTime > IDLE_RESET_S * 1000) { d.customerPresent = false; setDetectStatus("等待顾客..."); }
      if (d.lastGreetTime > 0) { const cd = COOLDOWN_S - (now - d.lastGreetTime) / 1000; if (cd > 0) setDetectStatus(`冷却 ${Math.ceil(cd)}s`); else setDetectStatus(d.customerPresent ? "顾客在场" : "等待顾客..."); }
    }
  }, [sendWelcome]);

  const startDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" } });
      if (camVideoRef.current) camVideoRef.current.srcObject = stream;
      const canvas = document.createElement("canvas"); canvas.width = DETECT_W; canvas.height = DETECT_H;
      const d = detectRef.current;
      d.stream = stream; d.canvas = canvas; d.ctx = canvas.getContext("2d", { willReadFrequently: true }); d.prevFrame = null;
      d.timer = window.setInterval(detectFrame, 1000 / DETECT_FPS);
      setDetectEnabled(true); setDetectStatus("等待顾客...");
    } catch (e) { setDetectStatus("摄像头不可用"); }
  }, [detectFrame]);

  const stopDetection = useCallback(() => {
    const d = detectRef.current;
    if (d.timer) { clearInterval(d.timer); d.timer = null; }
    if (d.stream) { d.stream.getTracks().forEach((t) => t.stop()); d.stream = null; }
    if (camVideoRef.current) camVideoRef.current.srcObject = null;
    d.prevFrame = null; d.customerPresent = false;
    setDetectEnabled(false); setDetectStatus("检测关");
  }, []);

  useEffect(() => () => stopDetection(), [stopDetection]);

  // ─── Render ───
  return (
    <div className="fixed inset-0 overflow-hidden z-50" style={{ background: "linear-gradient(135deg, #fff5f7 0%, #ffeef3 60%, #fff0e0 100%)" }}>
      {/* Rive avatar — fills the left area */}
      <div className="absolute inset-0" style={{ right: started ? "380px" : "0" }}>
        <RiveComponent style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Tap-to-start overlay */}
      {!started && (
        <button type="button" onClick={handleStart}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px] bg-white/20 transition z-10">
          <div className="w-24 h-24 rounded-full bg-[#ff8aa8] grid place-items-center shadow-[0_0_40px_rgba(255,138,168,0.6)] animate-pulse">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          </div>
          <div className="text-[#3a2a30] font-bold text-2xl">棉棉</div>
          <div className="text-[#8a7178] text-sm">爱儿采 · 毛绒玩具品牌形象大使</div>
          <div className="mt-2 px-5 py-2 rounded-full bg-[#ff8aa8] text-white text-sm font-semibold shadow">开始对话</div>
        </button>
      )}

      {/* Brand chip */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="text-[#ff8aa8] text-lg font-bold">棉棉</div>
        <div className="text-xs text-[#8a7178]">爱儿采 · 毛绒玩具</div>
      </div>

      {/* Status pill */}
      {started && (mode === "thinking" || mode === "speaking") && (
        <div className="absolute top-4 right-[396px] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm text-xs font-medium z-10">
          <span className={`w-2 h-2 rounded-full ${mode === "thinking" ? "bg-amber-400 animate-pulse" : "bg-pink-400 animate-pulse"}`} />
          <span className="text-[#3a2a30]">{mode === "thinking" ? "思考中..." : "说话中..."}</span>
        </div>
      )}

      {/* Chat bubble */}
      {started && bubble && (
        <div className="absolute left-6 right-[396px] bottom-24 bg-white rounded-2xl p-4 shadow-lg z-10" style={{ maxHeight: "30vh" }}>
          <div className="text-[#3a2a30] text-lg leading-relaxed">{bubble}</div>
          {followUp && <div className="text-[#8a7178] text-sm mt-2">{followUp}</div>}
        </div>
      )}

      {/* Bottom bar: mic + reset */}
      {started && (
        <div className="absolute bottom-4 left-0 right-[380px] flex justify-center gap-3 z-10">
          <button type="button" onClick={handleMicToggle}
            className={`w-14 h-14 rounded-full grid place-items-center shadow-lg transition ${micState === "on" ? "bg-[#ff8aa8] text-white" : "bg-white/80 text-[#ff8aa8]"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          </button>
          <button type="button" onClick={() => { setBubble(""); setFollowUp(""); setCards([]); historyRef.current = []; sendChat("", { isWelcome: true }); }}
            className="px-4 py-2 rounded-full bg-white/80 text-[#8a7178] text-sm font-medium shadow">重置</button>
        </div>
      )}

      {/* Detection control */}
      {started && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 rounded-xl px-3 py-1.5 backdrop-blur shadow text-xs text-[#8a7178] z-10">
          <span className={`w-2 h-2 rounded-full ${detectEnabled ? "bg-green-400" : "bg-gray-400"}`} />
          <span>{detectStatus}</span>
          <button type="button" onClick={() => { if (detectEnabled) stopDetection(); else { ensureAudioCtx(); startDetection(); } }}
            className={`px-2 py-0.5 rounded border text-[10px] ${detectEnabled ? "bg-[#ff8aa8] text-white border-[#ff8aa8]" : "border-[#ffd6e0] text-[#ff8aa8]"}`}>
            {detectEnabled ? "关闭" : "自动迎宾"}
          </button>
        </div>
      )}

      {/* Camera preview */}
      {detectEnabled && (
        <div className="absolute bottom-14 left-4 w-32 h-24 rounded-lg border-2 border-[#ffd6e0] overflow-hidden shadow z-10">
          <video ref={camVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        </div>
      )}

      {/* Right sidebar */}
      {started && (
        <aside className="absolute top-0 right-0 bottom-0 w-[380px] bg-white border-l border-[#ffe2eb] overflow-y-auto p-5 z-10">
          <h2 className="text-xs text-[#8a7178] font-semibold mb-3">试试这样问</h2>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q.label} type="button" onClick={() => sendChat(q.q)}
                className="bg-[#ffd6e0] text-[#3a2a30] rounded-xl p-3 text-sm text-left hover:bg-[#ffc4d3] transition">{q.label}</button>
            ))}
          </div>
          <h2 className="text-xs text-[#8a7178] font-semibold mb-3">推荐商品</h2>
          {cards.length > 0 ? (
            <div className="space-y-3">
              {cards.slice(0, 3).map((c) => (
                <div key={c.id} className="bg-[#fff8fa] border border-[#ffe2eb] rounded-2xl p-3 flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#ffe2eb] grid place-items-center text-2xl shrink-0 overflow-hidden">
                    {c.image ? <img src={c.image} alt={c.title} className="w-full h-full object-cover" /> : "🧸"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-[#3a2a30]">{c.title}</div>
                    {c.price != null && <div className="text-[#ff8aa8] font-bold text-base">¥{c.price}</div>}
                    {c.tagline && <div className="text-[10px] text-[#8a7178] mt-0.5">{c.tagline}</div>}
                    {c.reason && <div className="inline-block text-[10px] text-[#ff8aa8] bg-[#fff0f4] mt-1 px-2 py-0.5 rounded-full">{c.reason}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-[#8a7178] text-sm py-6">和我聊几句，我会推荐最合适的款式给你~</div>
          )}
        </aside>
      )}

      {/* QR modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-[60] p-4 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#3a2a30] mb-3">扫码加店长微信</h3>
            <div className="w-56 h-56 mx-auto rounded-2xl border-2 border-dashed border-[#ffd6e0] bg-[#fff5f7] grid place-items-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent("https://aiercai.example.com/wechat")}`} width={220} height={220} alt="QR" />
            </div>
            <p className="text-[#8a7178] text-xs mt-2">领取 ¥20 新客券</p>
            <button type="button" onClick={() => setShowQR(false)} className="mt-4 px-6 py-2 bg-[#ff8aa8] text-white rounded-lg text-sm font-semibold">好的</button>
          </div>
        </div>
      )}

      {/* Phone form */}
      {showPhoneForm && <PhoneFormModal onClose={() => setShowPhoneForm(false)} />}

      <style jsx>{`
        @media (max-width: 900px) {
          aside { position: fixed !important; top: auto !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; max-height: 45vh !important; border-left: none !important; border-top: 1px solid #ffe2eb; }
        }
      `}</style>
    </div>
  );
}

// ─── Phone lead form ───
function PhoneFormModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);

  async function submit() {
    if (!/^1\d{10}$/.test(phone)) return;
    setSubmitting(true);
    try {
      const resp = await fetch("/api/mianmian/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, note: "新品到货通知" }),
      });
      const data = await resp.json();
      setDone(data.ok ? "ok" : "err");
      if (data.ok) setTimeout(onClose, 2000);
    } catch { setDone("err"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-[60] p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-[#3a2a30] mb-1">留个手机号</h2>
        <p className="text-sm text-[#8a7178] mb-4">新品到货第一时间通知你~</p>
        {done === "ok" ? (
          <div className="text-center py-6 text-[#ff8aa8] font-semibold">收到！会第一时间通知你~</div>
        ) : (
          <>
            <input type="tel" placeholder="138xxxxxxxx" maxLength={11} inputMode="numeric"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#fff5f7] border border-[#ffd6e0] text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#ff8aa8]" />
            {done === "err" && <p className="text-sm text-red-500 mt-2">提交失败，请重试</p>}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={onClose} className="flex-1 bg-white border border-[#ffd6e0] text-[#3a2a30] py-2 rounded-lg text-sm font-semibold">取消</button>
              <button type="button" onClick={submit} disabled={submitting || !/^1\d{10}$/.test(phone)}
                className="flex-1 bg-[#ff8aa8] disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#ff6b8a] transition">
                {submitting ? "..." : "提交"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
