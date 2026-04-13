"use client";

/**
 * AvatarKiosk — fullscreen kiosk-mode UI for "Joy", the LovelyJoy AI sales rep.
 *
 * Design rules (post feedback):
 *   - Fullscreen 3D avatar on a branded gradient background. Nothing else.
 *   - Auto-continuous voice listening after the first user tap (required by
 *     browser autoplay policies). Mic is paused while Joy is speaking to
 *     avoid feedback loops.
 *   - A single chat bubble at the bottom shows Joy's current utterance.
 *   - Product cards float briefly in the top-right when Joy recommends
 *     something, then auto-dismiss.
 *   - Lead form only appears as a modal when the LLM emits `collect_contact`.
 *   - Small status pill + locale chip in the corners. Nothing else.
 *
 * The 3D engine is the plan-then-infill animation loop from the earlier
 * version: emotion arc + gesture track keyframes from the LLM, interpolated
 * procedurally against the real TTS duration, with Web Audio amplitude
 * driving lip-sync and background layers handling idle breathing + blink.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import type { AIGuidePlan, Locale, ProductCard } from "@/lib/ai-guide/types";

// ─────────────────────────────────────────────────────────────────
// Dynamic three.js types (we load them inside the effect to keep the
// main bundle small and to avoid SSR).
// ─────────────────────────────────────────────────────────────────
type ThreeModule = typeof import("three");
type GLTFLoaderModule = typeof import("three/examples/jsm/loaders/GLTFLoader.js");
type VRMModule = typeof import("@pixiv/three-vrm");
type VRMAnimationModule = typeof import("@pixiv/three-vrm-animation");

// Procedural bone deltas per gesture. Values are radians ADDED to the
// A-pose rest. So e.g. `rightUpperArm.z: -1.25` on top of rest z=-1.25
// results in final z ≈ -2.5, which points the arm almost straight up.
const POSES: Record<string, Record<string, { x?: number; y?: number; z?: number }>> = {
  idle: {},
  // Wave: raise right upper arm up next to head, bend elbow, open hand
  wave: {
    rightUpperArm: { z: -1.4, x: -0.3 }, // rest -1.25 + -1.4 ≈ arm near shoulder height, forward
    rightLowerArm: { y: 1.2, x: -0.3 },  // bend elbow up ~70°
    rightHand: { z: -0.3 },
    head: { z: 0.06, y: -0.08 },
  },
  nod: {
    head: { x: 0.3 },
    neck: { x: 0.12 },
  },
  shake_head: {
    head: { y: 0.4 },
    neck: { y: 0.18 },
  },
  // Point left (as character sees it) — raise arm sideways, elbow bent
  point_left: {
    leftUpperArm: { x: -0.5, z: -0.4 },  // rest +1.25 + -0.4 → ~45° out from body
    leftLowerArm: { y: -0.6 },
    leftHand: { z: 0.1 },
    head: { y: 0.3 },
    chest: { y: 0.08 },
  },
  point_right: {
    rightUpperArm: { x: -0.5, z: 0.4 },  // rest -1.25 + 0.4 → ~45° out on right
    rightLowerArm: { y: 0.6 },
    rightHand: { z: -0.1 },
    head: { y: -0.3 },
    chest: { y: -0.08 },
  },
  // Think: right hand to chin, head tilted
  think: {
    rightUpperArm: { x: -0.6, z: 0.2 },
    rightLowerArm: { x: -1.8, y: 0.9 },
    rightHand: { x: -0.2, y: 0.3 },
    head: { x: 0.08, y: -0.12, z: 0.18 },
  },
  // Celebrate: both arms up and out
  celebrate: {
    leftUpperArm: { x: -0.5, z: -1.2 },   // rest +1.25 + -1.2 ≈ 0, then X up → arm up
    rightUpperArm: { x: -0.5, z: 1.2 },
    leftLowerArm: { y: -0.4 },
    rightLowerArm: { y: 0.4 },
    head: { x: -0.12 },
  },
  bow: {
    spine: { x: 0.4 },
    chest: { x: 0.18 },
    neck: { x: 0.1 },
    head: { x: 0.35 },
  },
};

const BONE_NAMES = [
  "hips", "spine", "chest", "upperChest", "neck", "head",
  "leftShoulder", "leftUpperArm", "leftLowerArm", "leftHand",
  "rightShoulder", "rightUpperArm", "rightLowerArm", "rightHand",
] as const;

const EMOTION_TO_EXPR: Record<string, string> = {
  joy: "happy",
  excited: "happy",
  surprise: "surprised",
  curious: "surprised",
  relaxed: "relaxed",
  determined: "angry",
  embarrassed: "sad",
  neutral: "neutral",
};
const ALL_EXPR = ["happy", "sad", "angry", "surprised", "relaxed", "neutral"];

// Browser locale → Web Speech recognition locale
const BCP47: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  es: "es-ES",
};

interface AvatarKioskProps {
  locale: Locale;
}

type Mode = "idle" | "listening" | "thinking" | "speaking";
type LoadState =
  | { kind: "loading"; progress: number }
  | { kind: "ready" }
  | { kind: "error"; message: string };

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export default function AvatarKiosk({ locale }: AvatarKioskProps) {
  const t = useTranslations("aiGuide");

  // ────── Refs (non-state runtime objects) ──────
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const threeRef = useRef<{
    renderer?: unknown;
    scene?: unknown;
    camera?: unknown;
    vrm?: unknown;
    mixer?: unknown;                       // THREE.AnimationMixer
    actions?: unknown[];                   // AnimationAction[] for each VRMA clip
    clipDurations?: number[];              // duration of each clip
    currentClipIdx?: number;               // which clip is currently active
    clipStartedAt?: number;                // elapsedGlobal when current clip began
    rest: Record<string, { x: number; y: number; z: number }>;
    rafId?: number;
    disposed: boolean;
  }>({ rest: {}, disposed: false });

  const planRef = useRef<{ plan: AIGuidePlan | null; startedAt: number; totalMs: number }>({
    plan: null,
    startedAt: 0,
    totalMs: 0,
  });

  const audioRef = useRef<{
    ctx: AudioContext | null;
    analyser: AnalyserNode | null;
    data: Uint8Array<ArrayBuffer> | null;
    amplitude: number;
    currentSource: AudioBufferSourceNode | null;
  }>({ ctx: null, analyser: null, data: null, amplitude: 0, currentSource: null });

  const recognitionRef = useRef<unknown>(null);
  const shouldListenRef = useRef(false);
  // Mic permission is OPT-IN. We never auto-request it — the user has to
  // click the mic icon to enable voice input. See handleEnableMic below.
  const [micState, setMicState] = useState<"off" | "on" | "denied">("off");
  const [showMicHelp, setShowMicHelp] = useState(false);

  // Keep latest history in a ref so the speech-recognition onresult
  // closure doesn't need to be rebuilt every turn (which would drop
  // the live recognition object).
  const historyRef = useRef<ChatHistoryItem[]>([]);

  // ────── React state ──────
  const [loadState, setLoadState] = useState<LoadState>({ kind: "loading", progress: 0 });
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [bubble, setBubble] = useState<string>("");
  const [cards, setCards] = useState<ProductCard[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const cardTimerRef = useRef<number | null>(null);

  // Mirror of `mode` for the tick loop closure (which captures
  // state at mount time). setMode updates both so the animation
  // loop can react to listening/thinking/speaking state changes.
  const modeRef = useRef<Mode>("idle");
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ─────────────────────────────────────────────────────────────
  // 3D scene init
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [THREE, VRM, VRMA, GLTFLoaderMod] = await Promise.all([
          import("three") as Promise<ThreeModule>,
          import("@pixiv/three-vrm") as Promise<VRMModule>,
          import("@pixiv/three-vrm-animation") as Promise<VRMAnimationModule>,
          import("three/examples/jsm/loaders/GLTFLoader.js") as Promise<GLTFLoaderModule>,
        ]);
        if (cancelled) return;
        const container = canvasContainerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        // Waist-up framing — professional brand ambassador shot.
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
        camera.position.set(0, 1.42, 1.25);
        camera.lookAt(0, 1.4, 0);

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        // Explicit transparent clear so the aurora blobs behind the canvas
        // are visible through the scene background.
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const resize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(1, h);
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        // Warm ambient + key light + cool fill (matches LovelyJoy palette)
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const key = new THREE.DirectionalLight(0xfff6e5, 1.2);
        key.position.set(1, 2, 1);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x8ecae6, 0.5);
        fill.position.set(-1, 0.6, 1);
        scene.add(fill);

        // Load VRM with progress + proper error surface
        const loader = new GLTFLoaderMod.GLTFLoader();
        loader.register((parser) => new VRM.VRMLoaderPlugin(parser));
        // Same loader also handles VRMA files thanks to the animation plugin
        loader.register((parser) => new VRMA.VRMAnimationLoaderPlugin(parser));

        // Helper: load a VRMA file and return an AnimationClip bound to our VRM
        const loadVRMA = async (
          url: string,
          targetVrm: unknown,
        ): Promise<import("three").AnimationClip | null> => {
          return new Promise((resolve) => {
            loader.load(
              url,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (gltf: any) => {
                const vrmAnimations = gltf.userData.vrmAnimations;
                if (!vrmAnimations || vrmAnimations.length === 0) {
                  console.warn(`[ai-guide] ${url} has no vrmAnimations`);
                  resolve(null);
                  return;
                }
                try {
                  const clip = VRMA.createVRMAnimationClip(
                    vrmAnimations[0],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    targetVrm as any,
                  );
                  resolve(clip);
                } catch (e) {
                  console.error(`[ai-guide] createVRMAnimationClip failed for ${url}`, e);
                  resolve(null);
                }
              },
              undefined,
              (err) => {
                console.warn(`[ai-guide] VRMA load failed ${url}`, err);
                resolve(null);
              },
            );
          });
        };

        loader.load(
          "/images/ai-guide/avatar.vrm",
          (gltf) => {
            if (cancelled) return;
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const vrm = (gltf.userData as any).vrm;
              if (!vrm) throw new Error("gltf.userData.vrm is missing");
              VRM.VRMUtils.removeUnnecessaryVertices(gltf.scene);
              VRM.VRMUtils.combineSkeletons(gltf.scene);
              vrm.scene.rotation.y = Math.PI;
              scene.add(vrm.scene);

              // Eye contact: make the character track the camera so she
              // always appears to look at the viewer. Critical for a
              // brand-ambassador presence — without this she looks absent.
              if (vrm.lookAt) {
                // Target an invisible anchor at the camera position
                const target = new THREE.Object3D();
                target.position.copy(camera.position);
                scene.add(target);
                vrm.lookAt.target = target;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (threeRef.current as any).lookAtTarget = target;
              }

              // ──────────── CRITICAL: apply A-pose as the rest pose ────────────
              // VRM bind pose is T-pose (arms straight out). That's never what a
              // talking character should idle in. We apply a natural A-pose
              // (upper arms down, slight shoulder settle, micro elbow bend) and
              // then snapshot these rotations as the new "rest" that all idle
              // motion + gesture deltas are layered over.
              // Minimal, clean A-pose — just upper arms down + tiny shoulder
              // drop. Do NOT rotate forearms (Y-axis is pronation which
              // causes palms-forward "surrender" look) or bend elbows
              // procedurally (needs animation data to look right).
              // If this still looks stiff the answer is VRMA animations, not
              // more bone hacks.
              const APOSE: Record<string, { x?: number; y?: number; z?: number }> = {
                leftShoulder:  { z: 0.06 },
                rightShoulder: { z: -0.06 },
                leftUpperArm:  { z: 1.18 },
                rightUpperArm: { z: -1.18 },
                spine:         { x: 0.02 },
              };
              for (const [name, delta] of Object.entries(APOSE)) {
                const node = vrm.humanoid?.getNormalizedBoneNode(name);
                if (!node) continue;
                if (delta.x !== undefined) node.rotation.x = delta.x;
                if (delta.y !== undefined) node.rotation.y = delta.y;
                if (delta.z !== undefined) node.rotation.z = delta.z;
              }

              // Snapshot the corrected pose as the baseline rest
              const rest: Record<string, { x: number; y: number; z: number }> = {};
              for (const name of BONE_NAMES) {
                const node = vrm.humanoid?.getNormalizedBoneNode(name);
                if (node) {
                  rest[name] = {
                    x: node.rotation.x,
                    y: node.rotation.y,
                    z: node.rotation.z,
                  };
                }
              }
              threeRef.current.rest = rest;
              threeRef.current.vrm = vrm;
              setLoadState({ kind: "ready" });

              // ──────────── Load all 7 VRMA clips and rotate with crossfade ────────────
              // The AIWaifu VRMA files are dance/emote loops. Single-clip
              // looping shows a hard "teleport back to frame 0" snap. The
              // fix is to rotate through all 7 clips: each clip plays once
              // (LoopOnce), and 0.6s before its end we crossfade into the
              // next clip in the rotation. Crossfades absorb pose
              // discontinuities and the character never visibly snaps.
              //
              // Use `?vrma=none` to disable the dance and fall back to
              // pure procedural idle.
              const vrmaParam = new URLSearchParams(window.location.search).get("vrma");
              const vrmaDisabled = vrmaParam === "none" || vrmaParam === "0";

              if (!vrmaDisabled) {
                (async () => {
                  const urls = [1, 2, 3, 4, 5, 6, 7].map(
                    (i) => `/images/ai-guide/VRMA_0${i}.vrma`,
                  );
                  const clips = await Promise.all(urls.map((u) => loadVRMA(u, vrm)));
                  if (cancelled) return;
                  const validClips = clips.filter(
                    (c): c is import("three").AnimationClip => c !== null,
                  );
                  if (validClips.length === 0) {
                    console.warn("[ai-guide] no VRMA clips loaded, using procedural idle");
                    return;
                  }

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const mixer = new THREE.AnimationMixer(vrm.scene as any);
                  const actions = validClips.map((clip) => {
                    const action = mixer.clipAction(clip);
                    action.setLoop(THREE.LoopOnce, 1);
                    action.clampWhenFinished = true;
                    action.enabled = false;
                    action.setEffectiveWeight(0);
                    return action;
                  });

                  // Start playing the first clip at full weight
                  const first = actions[0];
                  first.reset();
                  first.enabled = true;
                  first.setEffectiveWeight(1);
                  first.play();

                  threeRef.current.mixer = mixer;
                  threeRef.current.actions = actions;
                  threeRef.current.clipDurations = validClips.map((c) => c.duration);
                  threeRef.current.currentClipIdx = 0;
                  threeRef.current.clipStartedAt = elapsedGlobal;

                  console.log(
                    `[ai-guide] Loaded ${validClips.length} VRMA clips, durations: ${validClips
                      .map((c) => c.duration.toFixed(1))
                      .join(", ")}s`,
                  );
                })();
              } else {
                console.log("[ai-guide] VRMA disabled via ?vrma=none — using procedural idle");
              }
            } catch (err) {
              console.error("[ai-guide] VRM post-load error", err);
              setLoadState({
                kind: "error",
                message: `VRM parse failed: ${(err as Error).message}`,
              });
            }
          },
          (xhr) => {
            if (xhr.lengthComputable) {
              const p = Math.min(1, xhr.loaded / xhr.total);
              setLoadState({ kind: "loading", progress: p });
            }
          },
          (err) => {
            console.error("[ai-guide] VRM load error", err);
            setLoadState({
              kind: "error",
              message: `Failed to load /images/ai-guide/avatar.vrm (${(err as Error).message ?? "unknown"})`,
            });
          },
        );

        threeRef.current.renderer = renderer;
        threeRef.current.scene = scene;
        threeRef.current.camera = camera;

        // ──────────────────────────────────────────────────────────
        // Animation loop — multi-layer "alive" motion system
        //
        //   final_rotation[bone] = rest[bone]
        //                        + idle_offset[bone]   (mode-aware sine)
        //                        + gesture_delta[bone] * gestureWeight
        //
        // "Aliveness" comes from NINE overlapping layers, each small:
        //   1. Mode-aware idle (different sine amplitudes per mode)
        //   2. Saccade eye jitter (tiny lookAt target drift)
        //   3. Random glance-away events (every 4-8s, 400ms long)
        //   4. Double-blink probability (10% chance of a second blink)
        //   5. Blink frequency changes by mode
        //   6. Breathing smile baseline (happy 0.16→0.22 @ 0.15Hz)
        //   7. Chest + shoulder breath rise
        //   8. Speech-reactive head bob (amplitude-linked)
        //   9. Random subtle head tilt every 8-15s
        // ──────────────────────────────────────────────────────────
        const clock = new THREE.Clock();
        let elapsedGlobal = 0;
        let blinkTimer = 0;
        let blinkActive = 0;
        let blinkPhaseCount = 0;                // for double-blink logic
        let nextGlanceAt = 4 + Math.random() * 3;
        let glanceUntil = 0;
        let glanceOffset = { x: 0, y: 0 };
        let nextTiltAt = 8 + Math.random() * 7;
        let tiltEndAt = 0;
        let activeTilt = { x: 0, y: 0, z: 0 };

        // Current active gesture + its timing, updated each frame
        const gestureState: {
          name: string | null;
          startedAt: number;
          endAt: number;
          weight: number; // smoothed 0..1
        } = { name: null, startedAt: 0, endAt: 0, weight: 0 };

        const tick = () => {
          if (threeRef.current.disposed) return;
          const dt = clock.getDelta();
          elapsedGlobal += dt;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const vrm = threeRef.current.vrm as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mixer = threeRef.current.mixer as any;
          const hasMixer = !!mixer;

          if (vrm) {
            // ──────── Drive body animation ────────
            // If VRMA clips are loaded, let the AnimationMixer drive the
            // whole body, AND rotate to the next clip with crossfade
            // before the current clip ends — this eliminates the visible
            // "snap back to frame 0" you get from a single LoopRepeat clip.
            if (hasMixer) {
              mixer.update(dt);

              // Crossfade to next clip in rotation
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const ref = threeRef.current as any;
              const actions = ref.actions as Array<{
                reset: () => unknown;
                enabled: boolean;
                play: () => unknown;
                setEffectiveWeight: (w: number) => unknown;
                crossFadeTo: (other: unknown, dur: number, warp: boolean) => unknown;
              }>;
              const durations: number[] = ref.clipDurations;
              const curIdx: number = ref.currentClipIdx;
              const startedAt: number = ref.clipStartedAt;
              const FADE = 0.6;

              if (actions && actions.length > 1) {
                const elapsedClip = elapsedGlobal - startedAt;
                const curDur = durations[curIdx];
                if (elapsedClip > curDur - FADE) {
                  // Time to start the next clip
                  const nextIdx = (curIdx + 1) % actions.length;
                  const next = actions[nextIdx];
                  next.reset();
                  next.enabled = true;
                  next.setEffectiveWeight(0);
                  next.play();
                  // Crossfade current → next over FADE seconds
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (actions[curIdx] as any).crossFadeTo(next, FADE, true);
                  ref.currentClipIdx = nextIdx;
                  ref.clipStartedAt = elapsedGlobal;
                }
              } else if (actions && actions.length === 1) {
                // Only one clip — just loop it (no crossfade possible).
                // Reset when it ends.
                const elapsedClip = elapsedGlobal - startedAt;
                if (elapsedClip > durations[0] - 0.05) {
                  actions[0].reset();
                  actions[0].setEffectiveWeight(1);
                  actions[0].play();
                  ref.clipStartedAt = elapsedGlobal;
                }
              }
            }

            // ──────── Mode-aware procedural idle ────────
            // Base sine bank + mode modifier. Different modes produce
            // different body language:
            //   idle:      subtle neutral breath
            //   listening: slight forward lean + attentive nod
            //   thinking:  head tilted up + slight sway
            //   speaking:  more active head bob + shoulder micro-shift
            const t = elapsedGlobal;
            const currentMode = modeRef.current;

            // Breath amplitude — larger than before so it's *visible*
            const breath = Math.sin(t * 1.3) * 0.020;          // ~1.1°
            const breathShoulder = Math.abs(Math.sin(t * 1.3)) * 0.012;

            const bodySway = Math.sin(t * 0.42) * 0.008;
            const headSwayX = Math.sin(t * 0.57) * 0.010;
            const headSwayY = Math.sin(t * 0.49 + 0.7) * 0.014;
            const headSwayZ = Math.sin(t * 0.73 + 1.4) * 0.008;
            const armFloat = Math.sin(t * 1.3 + 0.3) * 0.006;

            // Mode modifiers (additive head position / chest lean)
            let modeLeanX = 0;    // chest/head forward-back
            let modeHeadX = 0;    // head pitch
            let modeHeadY = 0;    // head yaw
            let modeHeadZ = 0;    // head roll
            let speechBob = 0;    // driven by TTS amplitude

            if (currentMode === "listening") {
              modeLeanX = 0.035;                 // subtle forward lean
              modeHeadX = 0.02 + Math.sin(t * 0.9) * 0.008;
            } else if (currentMode === "thinking") {
              modeHeadX = -0.05;                 // look up slightly
              modeHeadY = 0.08;                  // turn away
              modeHeadZ = 0.05;                  // head tilt
            } else if (currentMode === "speaking") {
              // Speech-driven head bob — amplitude * small multiplier
              speechBob = Math.min(0.025, audioRef.current.amplitude * 0.08);
              modeHeadX = Math.sin(t * 2.1) * 0.015;
              modeHeadY = Math.sin(t * 1.7 + 0.5) * 0.012;
            }

            // ──────── Random soft head tilt every 8-15s ────────
            if (t > nextTiltAt && tiltEndAt === 0) {
              // Start a new tilt that lasts ~2.5s
              tiltEndAt = t + 2.5;
              activeTilt = {
                x: (Math.random() - 0.5) * 0.04,
                y: (Math.random() - 0.5) * 0.05,
                z: (Math.random() - 0.5) * 0.06,
              };
            }
            if (tiltEndAt > 0 && t > tiltEndAt) {
              tiltEndAt = 0;
              activeTilt = { x: 0, y: 0, z: 0 };
              nextTiltAt = t + 8 + Math.random() * 7;
            }

            const idle: Record<string, { x: number; y: number; z: number }> = hasMixer
              ? {}
              : {
                  hips: { x: 0, y: bodySway * 0.4, z: 0 },
                  spine: { x: modeLeanX + breath * 0.2, y: bodySway * 0.3, z: 0 },
                  chest: { x: modeLeanX * 0.5 + breath * 0.6, y: 0, z: bodySway * 0.2 },
                  upperChest: { x: breath * 0.4, y: 0, z: 0 },
                  neck: { x: headSwayX * 0.3 + modeHeadX * 0.3, y: headSwayY * 0.3, z: 0 },
                  head: {
                    x: headSwayX + modeHeadX + speechBob + activeTilt.x,
                    y: headSwayY + modeHeadY + activeTilt.y,
                    z: headSwayZ + modeHeadZ + activeTilt.z,
                  },
                  leftShoulder: { x: 0, y: 0, z: breathShoulder * 0.5 },
                  rightShoulder: { x: 0, y: 0, z: -breathShoulder * 0.5 },
                  leftUpperArm: { x: armFloat, y: 0, z: 0 },
                  rightUpperArm: { x: armFloat, y: 0, z: 0 },
                  leftLowerArm: { x: 0, y: 0, z: 0 },
                  rightLowerArm: { x: 0, y: 0, z: 0 },
                  leftHand: { x: 0, y: 0, z: 0 },
                  rightHand: { x: 0, y: 0, z: 0 },
                };

            // ──────── Blinks with natural variation ────────
            // Mode-aware frequency: speaking and listening → faster blinks
            // (closer to real ~4-5s), thinking → longer gaps (~7-10s).
            // 10% chance of a double-blink sequence for extra realism.
            blinkTimer += dt;
            const blinkInterval =
              currentMode === "thinking" ? 7 + Math.random() * 3
              : currentMode === "speaking" || currentMode === "listening" ? 3 + Math.random() * 2
              : 4 + Math.random() * 3;

            if (blinkTimer > blinkInterval && blinkActive <= 0) {
              blinkActive = 0.16;
              blinkTimer = 0;
              // 10% chance of double-blink — queue a second blink
              blinkPhaseCount = Math.random() < 0.1 ? 1 : 0;
            }
            if (blinkActive > 0) {
              blinkActive -= dt;
              const v = Math.sin((1 - blinkActive / 0.16) * Math.PI);
              vrm.expressionManager?.setValue("blink", v);
              if (blinkActive <= 0 && blinkPhaseCount > 0) {
                // Fire the second blink of a double-blink
                blinkActive = 0.15;
                blinkPhaseCount = 0;
              }
            } else {
              vrm.expressionManager?.setValue("blink", 0);
            }

            // ──────── Saccade + random glance on lookAt target ────────
            // Real humans never stare fixed — eyes micro-drift every frame
            // and occasionally glance away for a moment. Moving the VRM's
            // lookAt target makes both eyeballs AND head subtly track.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lookAtTarget = (threeRef.current as any).lookAtTarget;
            if (lookAtTarget) {
              // Continuous saccade — slow sine drift in X and Y
              const sacX = Math.sin(t * 0.83 + 2.1) * 0.06;
              const sacY = Math.sin(t * 0.67 + 0.4) * 0.03;

              // Trigger a new random glance-away every 4-8s
              if (t > nextGlanceAt && glanceUntil === 0) {
                glanceOffset = {
                  x: (Math.random() - 0.5) * 0.35,
                  y: (Math.random() - 0.3) * 0.18,
                };
                glanceUntil = t + 0.35 + Math.random() * 0.25;
              }
              let glX = 0;
              let glY = 0;
              if (glanceUntil > 0) {
                if (t < glanceUntil) {
                  // Ease in/out the glance
                  const glancePhase =
                    1 - Math.abs((t - (glanceUntil - 0.3)) / 0.3);
                  const ease = Math.max(0, glancePhase);
                  glX = glanceOffset.x * ease;
                  glY = glanceOffset.y * ease;
                } else {
                  glanceUntil = 0;
                  nextGlanceAt = t + 4 + Math.random() * 4;
                }
              }

              // Thinking state: hold a deliberate look-away
              let modeGazeX = 0;
              let modeGazeY = 0;
              if (currentMode === "thinking") {
                modeGazeX = 0.2;
                modeGazeY = 0.12;
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cam = threeRef.current.camera as any;
              lookAtTarget.position.set(
                cam.position.x + sacX + glX + modeGazeX,
                cam.position.y + sacY + glY + modeGazeY,
                cam.position.z,
              );
            }

            // ──────── Plan-driven emotion + gesture ────────
            const cur = planRef.current.plan;
            let targetGesture: string | null = null;

            // Breathing baseline smile — the ambassador's happy resting
            // expression gently varies over time so her face never looks
            // flat. Range 0.14 ~ 0.24 at ~0.15 Hz.
            const baselineHappy = 0.19 + Math.sin(t * 0.94) * 0.05;

            if (cur) {
              const elapsedPlan = performance.now() - planRef.current.startedAt;
              const total = Math.max(800, planRef.current.totalMs);
              const r = Math.min(1, elapsedPlan / total);

              // Emotion expression — CLAMP intensity so eyes don't fully close.
              // VRM "happy" preset at intensity 1.0 squeezes eyes into
              // "笑眼 >_<" mode which looks weird. We cap the active emotion
              // at 0.55 and layer it over the baseline smile.
              const em = sampleEmotion(cur.emotion_arc, r);
              const exprName = EMOTION_TO_EXPR[em.emotion] || "neutral";
              const clampedIntensity = Math.min(0.55, em.intensity);
              for (const e of ALL_EXPR) {
                if (e === exprName) continue;
                if (e === "happy") continue; // keep happy for baseline handling
                vrm.expressionManager?.setValue(e, 0);
              }
              if (exprName === "happy") {
                vrm.expressionManager?.setValue(
                  "happy",
                  Math.max(baselineHappy, clampedIntensity),
                );
              } else {
                vrm.expressionManager?.setValue("happy", baselineHappy);
                vrm.expressionManager?.setValue(exprName, clampedIntensity);
              }

              // Sample current gesture keyframe
              targetGesture = sampleGesture(cur.gesture_track, elapsedPlan, total);

              // ──────── Lip sync (multi-vowel cycling) ────────
              // Real speech alternates between vowel shapes. We drive the
              // amplitude down from the audio analyser, then cycle through
              // aa/ih/ou/ee/oh at ~6Hz to simulate tongue/jaw movement.
              // Amplitude multiplier is low (×1.8) and capped at 0.45 so the
              // mouth never cartoonishly flies open.
              const rawAmp = audioRef.current.amplitude;
              const mouthOpen = Math.min(0.45, rawAmp * 1.8);
              const vowels = ["aa", "ih", "ou", "ee", "oh"];
              const vowelIdx = Math.floor(elapsedGlobal * 6) % vowels.length;
              for (let i = 0; i < vowels.length; i++) {
                vrm.expressionManager?.setValue(
                  vowels[i],
                  i === vowelIdx ? mouthOpen : 0,
                );
              }

              if (elapsedPlan > total + 300) {
                for (const v of vowels) vrm.expressionManager?.setValue(v, 0);
                planRef.current.plan = null;
              }
            } else {
              // No plan → zero all vowels, keep a subtle baseline smile
              for (const v of ["aa", "ih", "ou", "ee", "oh"]) {
                vrm.expressionManager?.setValue(v, 0);
              }
              vrm.expressionManager?.setValue("happy", baselineHappy);
              for (const e of ALL_EXPR) {
                if (e !== "happy") vrm.expressionManager?.setValue(e, 0);
              }
            }

            // ──────── Gesture weight envelope (smooth fade in / hold / fade out) ────────
            const FADE_IN = 0.25;
            const FADE_OUT = 0.4;
            if (targetGesture && targetGesture !== gestureState.name) {
              // New gesture starting
              gestureState.name = targetGesture;
              gestureState.startedAt = elapsedGlobal;
              gestureState.endAt = 0;
            } else if (!targetGesture && gestureState.name && gestureState.endAt === 0) {
              // Gesture ended, begin fade-out
              gestureState.endAt = elapsedGlobal;
            }

            let weightTarget = 0;
            if (gestureState.name) {
              const sinceStart = elapsedGlobal - gestureState.startedAt;
              if (gestureState.endAt === 0) {
                // fade in
                weightTarget = Math.min(1, sinceStart / FADE_IN);
              } else {
                // fade out
                const sinceEnd = elapsedGlobal - gestureState.endAt;
                weightTarget = Math.max(0, 1 - sinceEnd / FADE_OUT);
                if (weightTarget <= 0) {
                  gestureState.name = null;
                  gestureState.endAt = 0;
                }
              }
            }
            // smooth the weight itself
            gestureState.weight += (weightTarget - gestureState.weight) * (1 - Math.exp(-dt * 10));

            const activePose = gestureState.name ? POSES[gestureState.name] : null;
            const gestureWeight = gestureState.weight;

            // ──────── Apply layered final rotation per bone ────────
            // Two modes:
            //   (a) mixer-driven: bones already hold idle animation values
            //       from mixer.update() above. We only ADD the gesture delta
            //       on top, weighted.
            //   (b) procedural (no VRMA): bones are whatever we left them
            //       at last frame. We lerp toward rest + idle + gesture.
            const lerpRate = 1 - Math.exp(-dt * 8);
            for (const name of BONE_NAMES) {
              const node = vrm.humanoid?.getNormalizedBoneNode(name);
              if (!node) continue;
              const gestureBone = (activePose && activePose[name]) || { x: 0, y: 0, z: 0 };

              if (hasMixer) {
                // Additive: mixer provides base, we nudge toward (base + gesture*weight)
                const gx = (gestureBone.x || 0) * gestureWeight;
                const gy = (gestureBone.y || 0) * gestureWeight;
                const gz = (gestureBone.z || 0) * gestureWeight;
                node.rotation.x += gx * lerpRate;
                node.rotation.y += gy * lerpRate;
                node.rotation.z += gz * lerpRate;
              } else {
                // Pure procedural fallback
                const restBone = threeRef.current.rest[name] || { x: 0, y: 0, z: 0 };
                const idleBone = idle[name] || { x: 0, y: 0, z: 0 };
                const tx = restBone.x + idleBone.x + (gestureBone.x || 0) * gestureWeight;
                const ty = restBone.y + idleBone.y + (gestureBone.y || 0) * gestureWeight;
                const tz = restBone.z + idleBone.z + (gestureBone.z || 0) * gestureWeight;
                node.rotation.x += (tx - node.rotation.x) * lerpRate;
                node.rotation.y += (ty - node.rotation.y) * lerpRate;
                node.rotation.z += (tz - node.rotation.z) * lerpRate;
              }
            }

            // Chest vertical breath (position, not rotation) — only in procedural mode
            if (!hasMixer) {
              const chest = vrm.humanoid?.getNormalizedBoneNode("chest");
              if (chest) chest.position.y = breath * 0.5;
            }

            vrm.update(dt);
          }
          renderer.render(scene, camera);
          threeRef.current.rafId = requestAnimationFrame(tick);
        };
        tick();

        return () => {
          window.removeEventListener("resize", resize);
        };
      } catch (err) {
        console.error("[ai-guide] three init failed", err);
        setLoadState({
          kind: "error",
          message: `three.js init failed: ${(err as Error).message}`,
        });
      }
    })();

    return () => {
      cancelled = true;
      threeRef.current.disposed = true;
      if (threeRef.current.rafId) cancelAnimationFrame(threeRef.current.rafId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = threeRef.current.renderer as any;
      if (r) {
        r.domElement?.parentNode?.removeChild(r.domElement);
        r.dispose?.();
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Lock body scroll + hide the site Header/Footer while in kiosk.
  //
  // We used to do this with document.querySelector("header").style =
  // "display:none" but React can overwrite inline styles on re-render.
  // Injecting a <style> tag with !important is the robust way to
  // guarantee the chrome stays hidden for the lifetime of the mount.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevBg = document.body.style.background;
    document.body.style.overflow = "hidden";
    // Kill any bleed from the page body behind the fixed overlay
    document.body.style.background = "transparent";

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-ai-guide-kiosk", "");
    styleEl.textContent = `
      body > header, body > footer,
      body [data-nav-header], body [data-site-footer] {
        display: none !important;
      }
      html, body {
        overflow: hidden !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.background = prevBg;
      styleEl.remove();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Audio amplitude polling for lip sync
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = window.setInterval(() => {
      const a = audioRef.current;
      if (a.analyser && a.data) {
        a.analyser.getByteFrequencyData(a.data);
        let sum = 0;
        for (let i = 0; i < a.data.length; i++) sum += a.data[i];
        a.amplitude = sum / a.data.length / 255;
      }
    }, 30);
    return () => window.clearInterval(id);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Audio playback
  // ─────────────────────────────────────────────────────────────
  const playAudio = useCallback(async (b64: string): Promise<void> => {
    if (!b64) return;
    if (!audioRef.current.ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      audioRef.current.ctx = ctx;
      audioRef.current.analyser = analyser;
      audioRef.current.data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    }
    const ctx = audioRef.current.ctx!;
    if (ctx.state === "suspended") await ctx.resume();

    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const audioBuf = await ctx.decodeAudioData(buf.buffer);

    const src = ctx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(audioRef.current.analyser!);
    audioRef.current.analyser!.connect(ctx.destination);
    audioRef.current.currentSource = src;

    if (planRef.current.plan) planRef.current.totalMs = audioBuf.duration * 1000;

    await new Promise<void>((resolve) => {
      src.onended = () => {
        audioRef.current.amplitude = 0;
        audioRef.current.currentSource = null;
        resolve();
      };
      src.start();
    });
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Plan kickoff
  // ─────────────────────────────────────────────────────────────
  const startPlan = useCallback((plan: AIGuidePlan, fallbackMs = 1500) => {
    planRef.current.plan = plan;
    planRef.current.startedAt = performance.now();
    planRef.current.totalMs = fallbackMs;
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Speech recognition helpers (declared here, wired up below).
  // We manage it via refs because start/stop must be callable from
  // the sendChat closure without recreating the recognition object.
  // ─────────────────────────────────────────────────────────────
  const startRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = recognitionRef.current as any;
    if (!rec) return;
    try {
      rec.start();
      setMode((m) => (m === "thinking" || m === "speaking" ? m : "listening"));
    } catch {
      // already started — ignore
    }
  }, []);

  const stopRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = recognitionRef.current as any;
    if (!rec) return;
    try {
      rec.stop();
    } catch {}
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Chat API call
  // ─────────────────────────────────────────────────────────────
  const sendChat = useCallback(
    async (text: string, opts: { isWelcome?: boolean } = {}) => {
      if (!text.trim() && !opts.isWelcome) return;
      stopRecognition();
      setMode("thinking");
      setBubble("");

      try {
        const url = opts.isWelcome ? "/api/ai-guide/welcome" : "/api/ai-guide/chat";
        const body = opts.isWelcome
          ? { locale }
          : {
              text,
              locale,
              history: historyRef.current.slice(-6),
            };
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const plan = data.plan as AIGuidePlan;

        // Show bubble + follow-up
        const bubbleText = plan.follow_up
          ? `${plan.utterance}\n\n${plan.follow_up}`
          : plan.utterance;
        setBubble(bubbleText);

        // Product cards: show briefly then auto-dismiss
        if (plan.product_cards && plan.product_cards.length) {
          setCards(plan.product_cards);
          if (cardTimerRef.current) window.clearTimeout(cardTimerRef.current);
          cardTimerRef.current = window.setTimeout(() => setCards([]), 12000);
        }

        // Collect contact action
        for (const act of plan.actions || []) {
          if (act.type === "collect_contact") setShowLeadForm(true);
        }

        // Kick off animation
        startPlan(plan, 1500);

        // Update history (not for the welcome trigger)
        if (!opts.isWelcome && text.trim()) {
          const next: ChatHistoryItem[] = [
            ...historyRef.current,
            { role: "user", content: text },
            { role: "assistant", content: plan.utterance },
          ];
          historyRef.current = next.slice(-12);
        }

        // Play audio, gate mic while speaking
        if (data.audio) {
          setMode("speaking");
          await playAudio(data.audio);
        }
      } catch (err) {
        console.error("[ai-guide] chat failed", err);
        setBubble(t("lead.error"));
      } finally {
        setMode("idle");
        // Resume listening if we're still in the started session
        if (shouldListenRef.current) {
          window.setTimeout(() => startRecognition(), 400);
        }
      }
    },
    [locale, playAudio, startPlan, startRecognition, stopRecognition, t],
  );

  // ─────────────────────────────────────────────────────────────
  // Web Speech API setup (continuous, auto-restarting)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn("[ai-guide] SpeechRecognition not available — falling back to no-mic mode");
      return;
    }
    const rec = new SR();
    rec.lang = BCP47[locale] ?? "en-US";
    rec.continuous = false; // easier to get clean 'final' events
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      if (last?.isFinal) {
        const text = (last[0]?.transcript ?? "").trim();
        if (text) sendChat(text);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      // Terminal errors: mic was denied at the system or browser level.
      // We stop auto-listen and switch to denied state — the user can
      // click the mic button to see the unblock instructions.
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        console.warn("[ai-guide] microphone blocked:", e.error);
        shouldListenRef.current = false;
        setMicState("denied");
        return;
      }
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("[ai-guide] recognition error:", e.error);
      }
    };
    rec.onend = () => {
      if (!shouldListenRef.current) {
        setMode((m) => (m === "thinking" || m === "speaking" ? m : "idle"));
        return;
      }
      setMode((m) => {
        if (m === "thinking" || m === "speaking") return m;
        window.setTimeout(() => {
          if (shouldListenRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            try { (recognitionRef.current as any)?.start(); } catch {}
          }
        }, 250);
        return "listening";
      });
    };

    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, [locale, sendChat]);

  // ─────────────────────────────────────────────────────────────
  // Tap-to-start: ONLY unlocks audio playback and fires the welcome.
  // Mic permission is NOT requested here — that's opt-in via the mic
  // icon. This avoids the "persistent mic banner" UX disaster.
  // ─────────────────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    if (started) return;
    setStarted(true);

    if (!audioRef.current.ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      audioRef.current.ctx = ctx;
      audioRef.current.analyser = analyser;
      audioRef.current.data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    }
    try { await audioRef.current.ctx?.resume(); } catch {}

    // Check if mic was previously granted — if so, auto-enable listening
    if (navigator.permissions?.query) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = await navigator.permissions.query({ name: "microphone" as any });
        if (status.state === "granted") {
          shouldListenRef.current = true;
          setMicState("on");
          setTimeout(() => startRecognition(), 600);
        }
      } catch {
        // Some browsers don't support querying 'microphone' — silently skip
      }
    }

    await sendChat("", { isWelcome: true });
  }, [started, sendChat, startRecognition]);

  // ─────────────────────────────────────────────────────────────
  // Mic button handler — smart: check permission state first, then
  // either start listening, trigger the prompt, or show instructions.
  // ─────────────────────────────────────────────────────────────
  const handleMicToggle = useCallback(async () => {
    // Already on → turn off
    if (micState === "on") {
      shouldListenRef.current = false;
      stopRecognition();
      setMicState("off");
      return;
    }

    // Query current permission state first
    let permState: PermissionState | "unknown" = "unknown";
    if (navigator.permissions?.query) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = await navigator.permissions.query({ name: "microphone" as any });
        permState = status.state;
        // Listen for future changes (user fixes it in settings)
        status.onchange = () => {
          if (status.state === "granted") {
            setMicState("on");
            shouldListenRef.current = true;
            startRecognition();
          } else if (status.state === "denied") {
            setMicState("denied");
            shouldListenRef.current = false;
          }
        };
      } catch {}
    }

    if (permState === "denied") {
      setMicState("denied");
      setShowMicHelp(true);
      return;
    }

    // permState is 'prompt' or 'granted' or 'unknown' — try getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) track.stop();
      setMicState("on");
      shouldListenRef.current = true;
      setTimeout(() => startRecognition(), 200);
    } catch (err) {
      console.warn("[ai-guide] getUserMedia failed:", err);
      setMicState("denied");
      setShowMicHelp(true);
    }
  }, [micState, startRecognition, stopRecognition]);

  // Re-trigger welcome if locale changes mid-session
  useEffect(() => {
    if (started) {
      historyRef.current = [];
      sendChat("", { isWelcome: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 overflow-hidden z-50"
      style={{
        // Soft creamy base that the blobs sit on top of — NOT pure white, or
        // the blobs disappear into it regardless of blend mode.
        background: "linear-gradient(135deg, #FFE8D4 0%, #E8F4FA 50%, #FFD9E4 100%)",
      }}
    >
      {/* Animated background: 4 slow-drifting color blobs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
      </div>

      {/* 3D canvas fills the viewport */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0"
        aria-label={t("aria.avatar")}
      />

      {/* Tap-to-start overlay (autoplay gate) */}
      {!started && loadState.kind !== "error" && (
        <button
          type="button"
          onClick={handleStart}
          disabled={loadState.kind !== "ready"}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px] bg-white/20 transition disabled:cursor-wait"
        >
          {loadState.kind === "loading" && (
            <>
              <div className="w-20 h-20 rounded-full border-4 border-[#B5DCF0] border-t-[#6AB4D8] animate-spin" />
              <div className="text-[#5D4037] font-semibold text-lg">
                {t("status.connecting")}
              </div>
              <div className="text-[#8a7178] text-sm">
                {Math.round(loadState.progress * 100)}%
              </div>
            </>
          )}
          {loadState.kind === "ready" && (
            <>
              <div className="w-24 h-24 rounded-full bg-[#8ECAE6] grid place-items-center shadow-[0_0_40px_rgba(142,202,230,0.6)] animate-pulse">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
              </div>
              <div className="text-[#5D4037] font-bold text-2xl">{t("hero.title")}</div>
              <div className="text-[#795548] text-sm max-w-md text-center px-6">
                {t("hero.subtitle")}
              </div>
              <div className="mt-2 px-5 py-2 rounded-full bg-[#8ECAE6] text-white text-sm font-semibold shadow">
                {t("hero.startBtn")}
              </div>
            </>
          )}
        </button>
      )}

      {/* VRM load error overlay */}
      {loadState.kind === "error" && (
        <div className="absolute inset-0 grid place-items-center p-8">
          <div className="bg-white rounded-2xl p-6 max-w-md shadow-xl border border-red-100">
            <div className="text-red-500 font-bold mb-2">3D Avatar Load Failed</div>
            <div className="text-sm text-[#5D4037] break-words">{loadState.message}</div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#8ECAE6] text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Tiny brand chip top-left */}
      <div className="absolute top-4 left-4 text-[#5D4037] pointer-events-none">
        <div className="text-xs font-semibold tracking-wide opacity-60">LOVELYJOY</div>
        <div className="text-sm font-bold">{t("hero.title")}</div>
      </div>

      {/* Status pill top-right — only shows thinking/speaking, not idle */}
      {started && (mode === "thinking" || mode === "speaking") && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              mode === "thinking" ? "bg-amber-400 animate-pulse" : "bg-sky-400 animate-pulse"
            }`}
          />
          <span className="text-[#5D4037]">
            {mode === "thinking" ? t("status.thinking") : t("status.speaking")}
          </span>
        </div>
      )}

      {/* Product cards float at top-right (under status pill) */}
      {started && cards.length > 0 && (
        <div className="absolute top-16 right-4 w-72 flex flex-col gap-2 pointer-events-none">
          {cards.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="bg-white/90 backdrop-blur rounded-2xl p-3 shadow-lg border border-white/60 flex gap-3 animate-[fadeIn_0.3s_ease]"
            >
              <div className="w-14 h-14 rounded-lg bg-[#F0F8FB] grid place-items-center text-2xl shrink-0 overflow-hidden">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  "🧸"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#5D4037] text-sm truncate">
                  {c.title}
                </div>
                {c.tagline && (
                  <div className="text-xs text-[#8a7178] mt-0.5 line-clamp-2">
                    {c.tagline}
                  </div>
                )}
                {c.reason && (
                  <div className="inline-block text-[10px] text-[#6AB4D8] bg-[#E8F4FA] mt-1 px-2 py-0.5 rounded-full">
                    {c.reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mic toggle — always visible when started. One small circular button
          in the bottom-right corner. Opt-in voice input. */}
      {started && (
        <button
          type="button"
          onClick={handleMicToggle}
          title={
            micState === "on"
              ? locale === "zh" ? "关闭语音" : "Turn voice off"
              : micState === "denied"
              ? locale === "zh" ? "查看如何启用麦克风" : "How to enable microphone"
              : locale === "zh" ? "启用语音对话" : "Enable voice chat"
          }
          className={`absolute bottom-5 right-5 w-12 h-12 rounded-full grid place-items-center shadow-lg backdrop-blur transition ${
            micState === "on"
              ? "bg-[#8ECAE6] text-white hover:bg-[#6AB4D8]"
              : micState === "denied"
              ? "bg-white/80 text-[#dc2626] hover:bg-white"
              : "bg-white/80 text-[#6AB4D8] hover:bg-white"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            {micState === "denied" && (
              <line x1="3" y1="3" x2="21" y2="21" stroke="#dc2626" strokeWidth="2.5" />
            )}
          </svg>
        </button>
      )}

      {/* Mic help modal — shown only when user clicks the denied-state mic
          button. Teaches them to unblock permission in Chrome settings. */}
      {showMicHelp && (
        <MicHelpModal locale={locale} onClose={() => setShowMicHelp(false)} />
      )}

      {/* No chat bubble in kiosk mode — voice only. `bubble` state is still
          tracked internally in case we want to surface errors, but we do
          not render it to keep the UI pure 3D + background. */}

      {/* Lead form modal (appears when LLM emits collect_contact) */}
      {showLeadForm && (
        <LeadFormModal locale={locale} onClose={() => setShowLeadForm(false)} />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Aurora background: 4 blurred saturated blobs drifting slowly ─── */
        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.85;
          will-change: transform;
        }
        .aurora-blob-1 {
          width: 60vmax;
          height: 60vmax;
          background: #8ECAE6; /* sky-brand */
          top: -15%;
          left: -20%;
          animation: drift1 32s ease-in-out infinite;
        }
        .aurora-blob-2 {
          width: 55vmax;
          height: 55vmax;
          background: #FFB494; /* warm peach */
          top: -10%;
          right: -20%;
          animation: drift2 40s ease-in-out infinite;
        }
        .aurora-blob-3 {
          width: 58vmax;
          height: 58vmax;
          background: #FBD5E1; /* soft pink */
          bottom: -25%;
          left: 10%;
          animation: drift3 36s ease-in-out infinite;
        }
        .aurora-blob-4 {
          width: 50vmax;
          height: 50vmax;
          background: #C9A6E8; /* soft lavender */
          bottom: -15%;
          right: 5%;
          animation: drift4 44s ease-in-out infinite;
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(12vw, 8vh) scale(1.08); }
          66%      { transform: translate(-6vw, 14vh) scale(0.95); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-15vw, 10vh) scale(1.05); }
          66%      { transform: translate(-8vw, -6vh) scale(0.92); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(8vw, -10vh) scale(1.04); }
          66%      { transform: translate(16vw, 6vh) scale(0.98); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-10vw, -12vh) scale(1.06); }
          66%      { transform: translate(4vw, -4vh) scale(0.94); }
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-blob { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Keyframe samplers
// ─────────────────────────────────────────────────────────────────
function sampleEmotion(
  arc: AIGuidePlan["emotion_arc"] | undefined,
  ratio: number,
): { emotion: string; intensity: number } {
  if (!arc || arc.length === 0) return { emotion: "neutral", intensity: 0.5 };
  if (ratio <= arc[0].t) return { emotion: arc[0].emotion, intensity: arc[0].intensity };
  if (ratio >= arc[arc.length - 1].t) {
    const last = arc[arc.length - 1];
    return { emotion: last.emotion, intensity: last.intensity };
  }
  for (let i = 0; i < arc.length - 1; i++) {
    if (ratio >= arc[i].t && ratio < arc[i + 1].t) {
      const a = arc[i];
      const b = arc[i + 1];
      const u = (ratio - a.t) / Math.max(1e-6, b.t - a.t);
      return {
        emotion: u < 0.5 ? a.emotion : b.emotion,
        intensity: a.intensity * (1 - u) + b.intensity * u,
      };
    }
  }
  const last = arc[arc.length - 1];
  return { emotion: last.emotion, intensity: last.intensity };
}

function sampleGesture(
  track: AIGuidePlan["gesture_track"] | undefined,
  elapsedMs: number,
  totalMs: number,
): string | null {
  if (!track || track.length === 0) return null;
  let active: string | null = null;
  for (const k of track) {
    const kMs = k.t * totalMs;
    const hold = k.hold_ms || 600;
    if (elapsedMs >= kMs - 100 && elapsedMs <= kMs + hold) {
      active = k.gesture;
    }
  }
  return active;
}

// ─────────────────────────────────────────────────────────────────
// Mic help modal — shown when Chrome has persistent mic denial and
// clicking the button does nothing. Explains the manual unblock flow.
// ─────────────────────────────────────────────────────────────────
function MicHelpModal({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const copy: Record<Locale, { title: string; body: string[]; close: string }> = {
    zh: {
      title: "如何启用麦克风",
      body: [
        "您的浏览器之前拒绝了麦克风权限，需要手动重新允许：",
        "1. 点击地址栏左边的 🔒 锁图标",
        "2. 找到「麦克风」→ 改为「允许」",
        "3. 刷新本页面",
        "Mac 用户可能还需要在「系统设置 → 隐私与安全 → 麦克风」为浏览器开启权限。",
        "也可以继续浏览，不开麦克风我依然会主动跟您打招呼。",
      ],
      close: "知道了",
    },
    en: {
      title: "How to enable microphone",
      body: [
        "Your browser has previously blocked microphone access. To re-enable it:",
        "1. Click the 🔒 lock icon in the address bar",
        "2. Find 'Microphone' → set to 'Allow'",
        "3. Reload this page",
        "On Mac you may also need to grant microphone permission to your browser in System Settings → Privacy & Security → Microphone.",
        "You can also keep browsing without the mic — I'll still greet you.",
      ],
      close: "Got it",
    },
    ja: {
      title: "マイクの有効化方法",
      body: [
        "ブラウザがマイクアクセスをブロックしています。再許可の方法：",
        "1. アドレスバー左の 🔒 アイコンをクリック",
        "2. 「マイク」→「許可」に変更",
        "3. ページを再読み込み",
        "Mac では「システム設定 → プライバシーとセキュリティ → マイク」でブラウザにも権限を付与する必要があります。",
        "マイクなしでもご挨拶はお送りします。",
      ],
      close: "了解しました",
    },
    ko: {
      title: "마이크 활성화 방법",
      body: [
        "브라우저가 이전에 마이크 접근을 차단했습니다. 다시 허용하려면：",
        "1. 주소창 왼쪽 🔒 잠금 아이콘 클릭",
        "2. '마이크' 찾아서 '허용'으로 설정",
        "3. 페이지 새로고침",
        "Mac에서는 '시스템 설정 → 개인정보 → 마이크'에서도 브라우저 권한을 허용해야 합니다.",
        "마이크 없이도 인사는 드립니다.",
      ],
      close: "알겠습니다",
    },
    es: {
      title: "Cómo activar el micrófono",
      body: [
        "Su navegador bloqueó el acceso al micrófono. Para volver a permitirlo:",
        "1. Haga clic en el icono 🔒 del candado en la barra de direcciones",
        "2. Busque 'Micrófono' → cambie a 'Permitir'",
        "3. Recargue esta página",
        "En Mac también debe dar permiso al navegador en Configuración del Sistema → Privacidad → Micrófono.",
        "También puede seguir navegando sin micrófono.",
      ],
      close: "Entendido",
    },
  };
  const c = copy[locale] ?? copy.en;

  return (
    <div
      className="fixed inset-0 bg-black/40 grid place-items-center z-[60] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-[#5D4037] mb-3 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
          </svg>
          {c.title}
        </h2>
        <div className="space-y-2 text-sm text-[#5D4037] leading-relaxed">
          {c.body.map((line, i) => (
            <p key={i} className={i === 0 ? "font-medium" : ""}>{line}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full bg-[#8ECAE6] hover:bg-[#6AB4D8] text-white py-2.5 rounded-lg text-sm font-semibold transition"
        >
          {c.close}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Lead form modal
// ─────────────────────────────────────────────────────────────────
function LeadFormModal({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = useTranslations("aiGuide.lead");
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);

  async function submit() {
    if (!form.email.trim()) return;
    setSubmitting(true);
    try {
      const resp = await fetch("/api/ai-guide/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale, source: "ai-guide" }),
      });
      const data = await resp.json();
      setDone(data.ok ? "ok" : "err");
      if (data.ok) window.setTimeout(onClose, 2500);
    } catch {
      setDone("err");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold text-[#5D4037] mb-1">{t("title")}</h2>
        <p className="text-sm text-[#8a7178] mb-4">{t("subtitle")}</p>

        {done === "ok" ? (
          <div className="text-center py-6 text-[#6AB4D8] font-semibold">
            {t("success")}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t("company")}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#F5EDE0] focus:outline-none focus:ring-2 focus:ring-[#8ECAE6] text-sm"
            />
            <input
              type="text"
              placeholder={t("name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#F5EDE0] focus:outline-none focus:ring-2 focus:ring-[#8ECAE6] text-sm"
            />
            <input
              type="email"
              placeholder={t("email")}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#F5EDE0] focus:outline-none focus:ring-2 focus:ring-[#8ECAE6] text-sm"
            />
            <input
              type="tel"
              placeholder={t("phone")}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#F5EDE0] focus:outline-none focus:ring-2 focus:ring-[#8ECAE6] text-sm"
            />
            <textarea
              rows={3}
              placeholder={t("message")}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#F5EDE0] focus:outline-none focus:ring-2 focus:ring-[#8ECAE6] text-sm resize-none"
            />
            {done === "err" && <p className="text-sm text-red-500">{t("error")}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border border-[#DDB892] text-[#5D4037] py-2 rounded-lg text-sm font-semibold"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !form.email}
                className="flex-1 bg-[#8ECAE6] disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#6AB4D8] transition"
              >
                {submitting ? "..." : t("submit")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
