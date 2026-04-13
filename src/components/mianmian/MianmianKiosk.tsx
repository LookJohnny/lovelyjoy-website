"use client";

/**
 * MianmianKiosk — 棉棉 · 毛绒玩具品牌形象大使全屏 Kiosk UI。
 *
 * 基于 AvatarKiosk (Joy) 的 plan-then-infill 动画引擎改造：
 *   - 粉色/珊瑚主题 (#ff8aa8)
 *   - 对话气泡 + 侧边栏快捷问题 + 商品卡
 *   - 摄像头客流检测自动迎宾
 *   - 手机号留资（非邮箱）
 *   - 中文 only
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { MianmianPlan, ProductCard } from "@/lib/mianmian/types";

type ThreeModule = typeof import("three");
type GLTFLoaderModule = typeof import("three/examples/jsm/loaders/GLTFLoader.js");
type VRMModule = typeof import("@pixiv/three-vrm");
type VRMAnimationModule = typeof import("@pixiv/three-vrm-animation");

// ─── Procedural bone deltas per gesture (radians, additive on A-pose rest) ───
const POSES: Record<string, Record<string, { x?: number; y?: number; z?: number }>> = {
  idle: {},
  wave: {
    rightUpperArm: { z: -1.4, x: -0.3 },
    rightLowerArm: { y: 1.2, x: -0.3 },
    rightHand: { z: -0.3 },
    head: { z: 0.06, y: -0.08 },
  },
  nod: { head: { x: 0.3 }, neck: { x: 0.12 } },
  shake_head: { head: { y: 0.4 }, neck: { y: 0.18 } },
  point_left: {
    leftUpperArm: { x: -0.5, z: -0.4 },
    leftLowerArm: { y: -0.6 },
    leftHand: { z: 0.1 },
    head: { y: 0.3 },
    chest: { y: 0.08 },
  },
  point_right: {
    rightUpperArm: { x: -0.5, z: 0.4 },
    rightLowerArm: { y: 0.6 },
    rightHand: { z: -0.1 },
    head: { y: -0.3 },
    chest: { y: -0.08 },
  },
  think: {
    rightUpperArm: { x: -0.6, z: 0.2 },
    rightLowerArm: { x: -1.8, y: 0.9 },
    rightHand: { x: -0.2, y: 0.3 },
    head: { x: 0.08, y: -0.12, z: 0.18 },
  },
  celebrate: {
    leftUpperArm: { x: -0.5, z: -1.2 },
    rightUpperArm: { x: -0.5, z: 1.2 },
    leftLowerArm: { y: -0.4 },
    rightLowerArm: { y: 0.4 },
    head: { x: -0.12 },
  },
  heart: {
    leftUpperArm: { x: -0.7, z: -0.6 },
    rightUpperArm: { x: -0.7, z: 0.6 },
    leftLowerArm: { x: -1.5, y: -0.6 },
    rightLowerArm: { x: -1.5, y: 0.6 },
    head: { x: 0.05, z: 0.05 },
  },
  clap: {
    leftUpperArm: { x: -1.0, z: -0.5 },
    rightUpperArm: { x: -1.0, z: 0.5 },
    leftLowerArm: { x: -0.6, y: -0.5 },
    rightLowerArm: { x: -0.6, y: 0.5 },
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
  joy: "happy", excited: "happy", surprise: "surprised",
  curious: "surprised", relaxed: "relaxed", determined: "angry",
  embarrassed: "sad", sad: "sad", neutral: "neutral",
};
const ALL_EXPR = ["happy", "sad", "angry", "surprised", "relaxed", "neutral"];

type Mode = "idle" | "listening" | "thinking" | "speaking";
type LoadState =
  | { kind: "loading"; progress: number }
  | { kind: "ready" }
  | { kind: "error"; message: string };

interface ChatHistoryItem { role: "user" | "assistant"; content: string }

// ─── Quick question shortcuts ───
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

export default function MianmianKiosk() {
  // ─── Refs ───
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const threeRef = useRef<{
    renderer?: unknown; scene?: unknown; camera?: unknown; vrm?: unknown;
    mixer?: unknown; actions?: unknown[]; clipDurations?: number[];
    currentClipIdx?: number; clipStartedAt?: number;
    rest: Record<string, { x: number; y: number; z: number }>;
    rafId?: number; disposed: boolean;
  }>({ rest: {}, disposed: false });

  const planRef = useRef<{ plan: MianmianPlan | null; startedAt: number; totalMs: number }>({
    plan: null, startedAt: 0, totalMs: 0,
  });

  const audioRef = useRef<{
    ctx: AudioContext | null; analyser: AnalyserNode | null;
    data: Uint8Array<ArrayBuffer> | null; amplitude: number;
    currentSource: AudioBufferSourceNode | null;
  }>({ ctx: null, analyser: null, data: null, amplitude: 0, currentSource: null });

  const recognitionRef = useRef<unknown>(null);
  const shouldListenRef = useRef(false);
  const historyRef = useRef<ChatHistoryItem[]>([]);

  // ─── State ───
  const [loadState, setLoadState] = useState<LoadState>({ kind: "loading", progress: 0 });
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [bubble, setBubble] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [cards, setCards] = useState<ProductCard[]>([]);
  const [micState, setMicState] = useState<"off" | "on" | "denied">("off");
  const [showQR, setShowQR] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const cardTimerRef = useRef<number | null>(null);

  // Camera detection state
  const [detectEnabled, setDetectEnabled] = useState(false);
  const [detectStatus, setDetectStatus] = useState("检测关");
  const detectRef = useRef<{
    stream: MediaStream | null; canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null; prevFrame: ImageData | null;
    timer: number | null; lastGreetTime: number; lastMotionTime: number;
    customerPresent: boolean;
  }>({
    stream: null, canvas: null, ctx: null, prevFrame: null,
    timer: null, lastGreetTime: 0, lastMotionTime: 0, customerPresent: false,
  });
  const camVideoRef = useRef<HTMLVideoElement | null>(null);

  const modeRef = useRef<Mode>("idle");
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ─── 3D Scene Init (same engine as Joy) ───
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
        // 半身到全身取景，留出手势空间
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
        camera.position.set(0, 1.3, 2.6);
        camera.lookAt(0, 1.2, 0);

        const renderer = new THREE.WebGLRenderer({
          antialias: true, alpha: true,
          premultipliedAlpha: false, powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const resize = () => {
          const w = container.clientWidth, h = container.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(1, h);
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        // Warm pink-tinted lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const key = new THREE.DirectionalLight(0xfff0e8, 1.2);
        key.position.set(1, 2, 1);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffd6e0, 0.5);
        fill.position.set(-1, 0.6, 1);
        scene.add(fill);

        const loader = new GLTFLoaderMod.GLTFLoader();
        loader.register((parser) => new VRM.VRMLoaderPlugin(parser));
        loader.register((parser) => new VRMA.VRMAnimationLoaderPlugin(parser));

        const loadVRMA = async (
          url: string, targetVrm: unknown,
        ): Promise<import("three").AnimationClip | null> => {
          return new Promise((resolve) => {
            loader.load(url,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (gltf: any) => {
                const vrmAnimations = gltf.userData.vrmAnimations;
                if (!vrmAnimations?.length) { resolve(null); return; }
                try {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  resolve(VRMA.createVRMAnimationClip(vrmAnimations[0], targetVrm as any));
                } catch { resolve(null); }
              },
              undefined,
              () => resolve(null),
            );
          });
        };

        // Load 棉棉's own VRM model
        loader.load(
          "/images/mianmian/avatar.vrm",
          (gltf) => {
            if (cancelled) return;
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const vrm = (gltf.userData as any).vrm;
              if (!vrm) throw new Error("vrm missing");
              VRM.VRMUtils.removeUnnecessaryVertices(gltf.scene);
              VRM.VRMUtils.combineSkeletons(gltf.scene);
              vrm.scene.rotation.y = Math.PI;
              scene.add(vrm.scene);

              if (vrm.lookAt) {
                const target = new THREE.Object3D();
                target.position.copy(camera.position);
                scene.add(target);
                vrm.lookAt.target = target;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (threeRef.current as any).lookAtTarget = target;
              }

              // darkhair.vrm 默认是 T-pose（双臂展开），需要把手臂放下来
              // 只调 upperArm 和 lowerArm，不动 shoulder/spine（不同模型那些容易出问题）
              const APOSE: Record<string, { x?: number; y?: number; z?: number }> = {
                leftUpperArm:  { z: 1.1 },    // 左臂放下
                rightUpperArm: { z: -1.1 },   // 右臂放下
                leftLowerArm:  { y: 0.15 },   // 左肘微弯
                rightLowerArm: { y: -0.15 },  // 右肘微弯
              };
              for (const [name, delta] of Object.entries(APOSE)) {
                const node = vrm.humanoid?.getNormalizedBoneNode(name);
                if (!node) continue;
                if (delta.x !== undefined) node.rotation.x += delta.x;
                if (delta.y !== undefined) node.rotation.y += delta.y;
                if (delta.z !== undefined) node.rotation.z += delta.z;
              }

              const rest: Record<string, { x: number; y: number; z: number }> = {};
              for (const name of BONE_NAMES) {
                const node = vrm.humanoid?.getNormalizedBoneNode(name);
                if (node) rest[name] = { x: node.rotation.x, y: node.rotation.y, z: node.rotation.z };
              }
              threeRef.current.rest = rest;
              threeRef.current.vrm = vrm;
              setLoadState({ kind: "ready" });

              // 棉棉不用 VRMA 舞蹈动画（那些是跳舞/表演动作，不适合店员）
              // 用 procedural idle（呼吸、身体微摆、头部微动）更自然
              console.log("[mianmian] using procedural idle (no VRMA dance clips)");
            } catch (err) {
              setLoadState({ kind: "error", message: `VRM parse: ${(err as Error).message}` });
            }
          },
          (xhr) => {
            if (xhr.lengthComputable) setLoadState({ kind: "loading", progress: Math.min(1, xhr.loaded / xhr.total) });
          },
          (err) => setLoadState({ kind: "error", message: `VRM load failed: ${(err as Error).message ?? "unknown"}` }),
        );

        threeRef.current.renderer = renderer;
        threeRef.current.scene = scene;
        threeRef.current.camera = camera;

        // ─── Animation loop (same 9-layer system as Joy) ───
        const clock = new THREE.Clock();
        let elapsedGlobal = 0;
        let blinkTimer = 0, blinkActive = 0, blinkPhaseCount = 0;
        let nextGlanceAt = 4 + Math.random() * 3, glanceUntil = 0;
        let glanceOffset = { x: 0, y: 0 };
        let nextTiltAt = 8 + Math.random() * 7, tiltEndAt = 0;
        let activeTilt = { x: 0, y: 0, z: 0 };
        const gestureState: { name: string | null; startedAt: number; endAt: number; weight: number } =
          { name: null, startedAt: 0, endAt: 0, weight: 0 };

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
            // VRMA mixer + crossfade rotation
            if (hasMixer) {
              mixer.update(dt);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const ref = threeRef.current as any;
              const actions = ref.actions as Array<{
                reset: () => unknown; enabled: boolean; play: () => unknown;
                setEffectiveWeight: (w: number) => unknown;
                crossFadeTo: (other: unknown, dur: number, warp: boolean) => unknown;
              }>;
              const durations: number[] = ref.clipDurations;
              const curIdx: number = ref.currentClipIdx;
              const startedAt: number = ref.clipStartedAt;
              const FADE = 0.6;
              if (actions && actions.length > 1) {
                const elapsedClip = elapsedGlobal - startedAt;
                if (elapsedClip > durations[curIdx] - FADE) {
                  const nextIdx = (curIdx + 1) % actions.length;
                  const next = actions[nextIdx];
                  next.reset(); next.enabled = true;
                  next.setEffectiveWeight(0); next.play();
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (actions[curIdx] as any).crossFadeTo(next, FADE, true);
                  ref.currentClipIdx = nextIdx;
                  ref.clipStartedAt = elapsedGlobal;
                }
              } else if (actions?.length === 1) {
                if (elapsedGlobal - startedAt > durations[0] - 0.05) {
                  actions[0].reset(); actions[0].setEffectiveWeight(1);
                  actions[0].play(); ref.clipStartedAt = elapsedGlobal;
                }
              }
            }

            // Procedural idle
            const t = elapsedGlobal;
            const currentMode = modeRef.current;
            const breath = Math.sin(t * 1.3) * 0.020;
            const breathShoulder = Math.abs(Math.sin(t * 1.3)) * 0.012;
            const bodySway = Math.sin(t * 0.42) * 0.008;
            const headSwayX = Math.sin(t * 0.57) * 0.010;
            const headSwayY = Math.sin(t * 0.49 + 0.7) * 0.014;
            const headSwayZ = Math.sin(t * 0.73 + 1.4) * 0.008;
            const armFloat = Math.sin(t * 1.3 + 0.3) * 0.006;

            let modeLeanX = 0, modeHeadX = 0, modeHeadY = 0, modeHeadZ = 0, speechBob = 0;
            if (currentMode === "listening") {
              modeLeanX = 0.035;
              modeHeadX = 0.02 + Math.sin(t * 0.9) * 0.008;
            } else if (currentMode === "thinking") {
              modeHeadX = -0.05; modeHeadY = 0.08; modeHeadZ = 0.05;
            } else if (currentMode === "speaking") {
              speechBob = Math.min(0.025, audioRef.current.amplitude * 0.08);
              modeHeadX = Math.sin(t * 2.1) * 0.015;
              modeHeadY = Math.sin(t * 1.7 + 0.5) * 0.012;
            }

            // Random head tilt
            if (t > nextTiltAt && tiltEndAt === 0) {
              tiltEndAt = t + 2.5;
              activeTilt = { x: (Math.random() - 0.5) * 0.04, y: (Math.random() - 0.5) * 0.05, z: (Math.random() - 0.5) * 0.06 };
            }
            if (tiltEndAt > 0 && t > tiltEndAt) {
              tiltEndAt = 0; activeTilt = { x: 0, y: 0, z: 0 };
              nextTiltAt = t + 8 + Math.random() * 7;
            }

            const idle: Record<string, { x: number; y: number; z: number }> = hasMixer ? {} : {
              hips: { x: 0, y: bodySway * 0.4, z: 0 },
              spine: { x: modeLeanX + breath * 0.2, y: bodySway * 0.3, z: 0 },
              chest: { x: modeLeanX * 0.5 + breath * 0.6, y: 0, z: bodySway * 0.2 },
              upperChest: { x: breath * 0.4, y: 0, z: 0 },
              neck: { x: headSwayX * 0.3 + modeHeadX * 0.3, y: headSwayY * 0.3, z: 0 },
              head: { x: headSwayX + modeHeadX + speechBob + activeTilt.x, y: headSwayY + modeHeadY + activeTilt.y, z: headSwayZ + modeHeadZ + activeTilt.z },
              leftShoulder: { x: 0, y: 0, z: breathShoulder * 0.5 },
              rightShoulder: { x: 0, y: 0, z: -breathShoulder * 0.5 },
              leftUpperArm: { x: armFloat, y: 0, z: 0 }, rightUpperArm: { x: armFloat, y: 0, z: 0 },
              leftLowerArm: { x: 0, y: 0, z: 0 }, rightLowerArm: { x: 0, y: 0, z: 0 },
              leftHand: { x: 0, y: 0, z: 0 }, rightHand: { x: 0, y: 0, z: 0 },
            };

            // Blinks
            blinkTimer += dt;
            const blinkInterval =
              currentMode === "thinking" ? 7 + Math.random() * 3
              : currentMode === "speaking" || currentMode === "listening" ? 3 + Math.random() * 2
              : 4 + Math.random() * 3;
            if (blinkTimer > blinkInterval && blinkActive <= 0) {
              blinkActive = 0.16; blinkTimer = 0;
              blinkPhaseCount = Math.random() < 0.1 ? 1 : 0;
            }
            if (blinkActive > 0) {
              blinkActive -= dt;
              vrm.expressionManager?.setValue("blink", Math.sin((1 - blinkActive / 0.16) * Math.PI));
              if (blinkActive <= 0 && blinkPhaseCount > 0) { blinkActive = 0.15; blinkPhaseCount = 0; }
            } else {
              vrm.expressionManager?.setValue("blink", 0);
            }

            // Saccade + glance
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lookAtTarget = (threeRef.current as any).lookAtTarget;
            if (lookAtTarget) {
              const sacX = Math.sin(t * 0.83 + 2.1) * 0.06;
              const sacY = Math.sin(t * 0.67 + 0.4) * 0.03;
              if (t > nextGlanceAt && glanceUntil === 0) {
                glanceOffset = { x: (Math.random() - 0.5) * 0.35, y: (Math.random() - 0.3) * 0.18 };
                glanceUntil = t + 0.35 + Math.random() * 0.25;
              }
              let glX = 0, glY = 0;
              if (glanceUntil > 0) {
                if (t < glanceUntil) {
                  const ease = Math.max(0, 1 - Math.abs((t - (glanceUntil - 0.3)) / 0.3));
                  glX = glanceOffset.x * ease; glY = glanceOffset.y * ease;
                } else { glanceUntil = 0; nextGlanceAt = t + 4 + Math.random() * 4; }
              }
              let modeGazeX = 0, modeGazeY = 0;
              if (currentMode === "thinking") { modeGazeX = 0.2; modeGazeY = 0.12; }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cam = threeRef.current.camera as any;
              lookAtTarget.position.set(cam.position.x + sacX + glX + modeGazeX, cam.position.y + sacY + glY + modeGazeY, cam.position.z);
            }

            // Plan-driven emotion + gesture
            const cur = planRef.current.plan;
            let targetGesture: string | null = null;
            const baselineHappy = 0.19 + Math.sin(t * 0.94) * 0.05;

            if (cur) {
              const elapsedPlan = performance.now() - planRef.current.startedAt;
              const total = Math.max(800, planRef.current.totalMs);
              const r = Math.min(1, elapsedPlan / total);
              const em = sampleEmotion(cur.emotion_arc, r);
              const exprName = EMOTION_TO_EXPR[em.emotion] || "neutral";
              const clampedI = Math.min(0.55, em.intensity);
              for (const e of ALL_EXPR) {
                if (e === exprName || e === "happy") continue;
                vrm.expressionManager?.setValue(e, 0);
              }
              if (exprName === "happy") {
                vrm.expressionManager?.setValue("happy", Math.max(baselineHappy, clampedI));
              } else {
                vrm.expressionManager?.setValue("happy", baselineHappy);
                vrm.expressionManager?.setValue(exprName, clampedI);
              }
              targetGesture = sampleGesture(cur.gesture_track, elapsedPlan, total);

              // Multi-vowel lip sync
              const mouthOpen = Math.min(0.45, audioRef.current.amplitude * 1.8);
              const vowels = ["aa", "ih", "ou", "ee", "oh"];
              const vowelIdx = Math.floor(elapsedGlobal * 6) % vowels.length;
              for (let i = 0; i < vowels.length; i++) {
                vrm.expressionManager?.setValue(vowels[i], i === vowelIdx ? mouthOpen : 0);
              }
              if (elapsedPlan > total + 300) {
                for (const v of vowels) vrm.expressionManager?.setValue(v, 0);
                planRef.current.plan = null;
              }
            } else {
              for (const v of ["aa", "ih", "ou", "ee", "oh"]) vrm.expressionManager?.setValue(v, 0);
              vrm.expressionManager?.setValue("happy", baselineHappy);
              for (const e of ALL_EXPR) { if (e !== "happy") vrm.expressionManager?.setValue(e, 0); }
            }

            // Gesture weight envelope
            const FADE_IN = 0.25, FADE_OUT = 0.4;
            if (targetGesture && targetGesture !== gestureState.name) {
              gestureState.name = targetGesture; gestureState.startedAt = elapsedGlobal; gestureState.endAt = 0;
            } else if (!targetGesture && gestureState.name && gestureState.endAt === 0) {
              gestureState.endAt = elapsedGlobal;
            }
            let weightTarget = 0;
            if (gestureState.name) {
              const sinceStart = elapsedGlobal - gestureState.startedAt;
              if (gestureState.endAt === 0) { weightTarget = Math.min(1, sinceStart / FADE_IN); }
              else {
                const sinceEnd = elapsedGlobal - gestureState.endAt;
                weightTarget = Math.max(0, 1 - sinceEnd / FADE_OUT);
                if (weightTarget <= 0) { gestureState.name = null; gestureState.endAt = 0; }
              }
            }
            gestureState.weight += (weightTarget - gestureState.weight) * (1 - Math.exp(-dt * 10));

            const activePose = gestureState.name ? POSES[gestureState.name] : null;
            const gestureWeight = gestureState.weight;
            const lerpRate = 1 - Math.exp(-dt * 8);
            for (const name of BONE_NAMES) {
              const node = vrm.humanoid?.getNormalizedBoneNode(name);
              if (!node) continue;
              const gestureBone = (activePose && activePose[name]) || { x: 0, y: 0, z: 0 };
              if (hasMixer) {
                node.rotation.x += (gestureBone.x || 0) * gestureWeight * lerpRate;
                node.rotation.y += (gestureBone.y || 0) * gestureWeight * lerpRate;
                node.rotation.z += (gestureBone.z || 0) * gestureWeight * lerpRate;
              } else {
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

        return () => { window.removeEventListener("resize", resize); };
      } catch (err) {
        setLoadState({ kind: "error", message: `init: ${(err as Error).message}` });
      }
    })();

    return () => {
      cancelled = true;
      threeRef.current.disposed = true;
      if (threeRef.current.rafId) cancelAnimationFrame(threeRef.current.rafId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = threeRef.current.renderer as any;
      if (r) { r.domElement?.parentNode?.removeChild(r.domElement); r.dispose?.(); }
    };
  }, []);

  // Lock body scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-mianmian-kiosk", "");
    styleEl.textContent = `body > header, body > footer, body [data-nav-header], body [data-site-footer] { display: none !important; } html, body { overflow: hidden !important; }`;
    document.head.appendChild(styleEl);
    return () => { document.body.style.overflow = prevOverflow; styleEl.remove(); };
  }, []);

  // Audio amplitude polling
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

  // ─── Audio playback ───
  const ensureAudioCtx = useCallback(() => {
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
    src.connect(audioRef.current.analyser!);
    audioRef.current.analyser!.connect(ctx.destination);
    audioRef.current.currentSource = src;
    if (planRef.current.plan) planRef.current.totalMs = audioBuf.duration * 1000;
    await new Promise<void>((resolve) => {
      src.onended = () => { audioRef.current.amplitude = 0; audioRef.current.currentSource = null; resolve(); };
      src.start();
    });
  }, [ensureAudioCtx]);

  const startPlan = useCallback((plan: MianmianPlan, fallbackMs = 1500) => {
    planRef.current.plan = plan;
    planRef.current.startedAt = performance.now();
    planRef.current.totalMs = fallbackMs;
  }, []);

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
        const body = opts.isWelcome
          ? {}
          : { text, history: historyRef.current.slice(-6) };
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

        startPlan(plan, 1500);

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
    [playAudio, startPlan, startRecognition, stopRecognition],
  );

  // Web Speech setup
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.continuous = false;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      if (last?.isFinal) { const text = (last[0]?.transcript ?? "").trim(); if (text) sendChat(text); }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        shouldListenRef.current = false; setMicState("denied"); return;
      }
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

  // ─── Start handler ───
  const handleStart = useCallback(async () => {
    if (started) return;
    setStarted(true);
    ensureAudioCtx();
    try { await audioRef.current.ctx?.resume(); } catch {}
    // Auto-enable mic if previously granted
    if (navigator.permissions?.query) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = await navigator.permissions.query({ name: "microphone" as any });
        if (status.state === "granted") {
          shouldListenRef.current = true; setMicState("on");
          setTimeout(() => startRecognition(), 600);
        }
      } catch {}
    }
    await sendChat("", { isWelcome: true });
  }, [started, sendChat, startRecognition, ensureAudioCtx]);

  // Mic toggle
  const handleMicToggle = useCallback(async () => {
    if (micState === "on") {
      shouldListenRef.current = false; stopRecognition(); setMicState("off"); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) track.stop();
      setMicState("on"); shouldListenRef.current = true;
      setTimeout(() => startRecognition(), 200);
    } catch {
      setMicState("denied");
    }
  }, [micState, startRecognition, stopRecognition]);

  // ─── Camera detection ───
  const sendWelcome = useCallback(() => {
    sendChat("", { isWelcome: true });
  }, [sendChat]);

  const startDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
      });
      const video = camVideoRef.current;
      if (video) video.srcObject = stream;
      const canvas = document.createElement("canvas");
      canvas.width = DETECT_W; canvas.height = DETECT_H;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const d = detectRef.current;
      d.stream = stream; d.canvas = canvas; d.ctx = ctx; d.prevFrame = null;
      d.timer = window.setInterval(() => detectFrame(), 1000 / DETECT_FPS);
      setDetectEnabled(true); setDetectStatus("等待顾客...");
    } catch (e) {
      setDetectStatus("摄像头不可用");
      alert("摄像头不可用: " + (e as Error).message);
    }
  }, []);

  const stopDetection = useCallback(() => {
    const d = detectRef.current;
    if (d.timer) { clearInterval(d.timer); d.timer = null; }
    if (d.stream) { d.stream.getTracks().forEach((t) => t.stop()); d.stream = null; }
    const video = camVideoRef.current;
    if (video) video.srcObject = null;
    d.prevFrame = null; d.customerPresent = false;
    setDetectEnabled(false); setDetectStatus("检测关");
  }, []);

  const detectFrame = useCallback(() => {
    const d = detectRef.current;
    const video = camVideoRef.current;
    if (!d.stream || !video || video.readyState < 2 || !d.ctx) return;
    d.ctx.drawImage(video, 0, 0, DETECT_W, DETECT_H);
    const currentFrame = d.ctx.getImageData(0, 0, DETECT_W, DETECT_H);
    if (!d.prevFrame) { d.prevFrame = currentFrame; return; }
    const prev = d.prevFrame.data, pixels = currentFrame.data;
    let changed = 0;
    const total = DETECT_W * DETECT_H;
    for (let i = 0; i < pixels.length; i += 4) {
      const g1 = (prev[i] * 299 + prev[i + 1] * 587 + prev[i + 2] * 114) / 1000;
      const g2 = (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 114) / 1000;
      if (Math.abs(g1 - g2) > MOTION_THRESHOLD) changed++;
    }
    d.prevFrame = currentFrame;
    const ratio = changed / total;
    const now = Date.now();

    if (ratio > MOTION_RATIO) {
      d.lastMotionTime = now;
      if (!d.customerPresent) d.customerPresent = true;
      const cooldown = COOLDOWN_S - (now - d.lastGreetTime) / 1000;
      if (cooldown <= 0) {
        d.lastGreetTime = now;
        setDetectStatus("顾客来了!");
        sendWelcome();
        setTimeout(() => setDetectStatus(`冷却中 ${COOLDOWN_S}s`), 2000);
      } else {
        setDetectStatus(`冷却 ${Math.ceil(cooldown)}s`);
      }
    } else {
      if (d.customerPresent && (now - d.lastMotionTime) > IDLE_RESET_S * 1000) {
        d.customerPresent = false;
        setDetectStatus("等待顾客...");
      }
      if (d.lastGreetTime > 0) {
        const cooldown = COOLDOWN_S - (now - d.lastGreetTime) / 1000;
        if (cooldown > 0) setDetectStatus(`冷却 ${Math.ceil(cooldown)}s`);
        else setDetectStatus(d.customerPresent ? "顾客在场" : "等待顾客...");
      }
    }
  }, [sendWelcome]);

  // Cleanup detection on unmount
  useEffect(() => { return () => stopDetection(); }, [stopDetection]);

  // ─── Render ───
  return (
    <div className="fixed inset-0 overflow-hidden z-50" style={{ background: "linear-gradient(135deg, #fff5f7 0%, #ffeef3 60%, #fff0e0 100%)" }}>
      {/* Aurora blobs — pink palette */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="mm-blob mm-blob-1" />
        <div className="mm-blob mm-blob-2" />
        <div className="mm-blob mm-blob-3" />
      </div>

      {/* 3D canvas */}
      <div ref={canvasContainerRef} className="absolute inset-0" style={{ right: started ? "380px" : "0" }} />

      {/* Tap-to-start overlay */}
      {!started && loadState.kind !== "error" && (
        <button type="button" onClick={handleStart} disabled={loadState.kind !== "ready"}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px] bg-white/20 transition disabled:cursor-wait">
          {loadState.kind === "loading" && (
            <>
              <div className="w-20 h-20 rounded-full border-4 border-[#ffd6e0] border-t-[#ff8aa8] animate-spin" />
              <div className="text-[#3a2a30] font-semibold text-lg">加载中...</div>
              <div className="text-[#8a7178] text-sm">{Math.round(loadState.progress * 100)}%</div>
            </>
          )}
          {loadState.kind === "ready" && (
            <>
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
            </>
          )}
        </button>
      )}

      {/* Error overlay */}
      {loadState.kind === "error" && (
        <div className="absolute inset-0 grid place-items-center p-8">
          <div className="bg-white rounded-2xl p-6 max-w-md shadow-xl border border-red-100">
            <div className="text-red-500 font-bold mb-2">加载失败</div>
            <div className="text-sm text-[#3a2a30] break-words">{loadState.message}</div>
            <button type="button" onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#ff8aa8] text-white rounded-lg text-sm">重试</button>
          </div>
        </div>
      )}

      {/* Brand chip */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="text-[#ff8aa8] text-lg font-bold">棉棉</div>
        <div className="text-xs text-[#8a7178]">爱儿采 · 毛绒玩具店</div>
      </div>

      {/* Status pill */}
      {started && (mode === "thinking" || mode === "speaking") && (
        <div className="absolute top-4 right-[396px] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm text-xs font-medium">
          <span className={`w-2 h-2 rounded-full ${mode === "thinking" ? "bg-amber-400 animate-pulse" : "bg-pink-400 animate-pulse"}`} />
          <span className="text-[#3a2a30]">{mode === "thinking" ? "思考中..." : "说话中..."}</span>
        </div>
      )}

      {/* Chat bubble */}
      {started && bubble && (
        <div className="absolute left-6 right-[396px] bottom-24 bg-white rounded-2xl p-4 shadow-lg" style={{ maxHeight: "30vh" }}>
          <div className="text-[#3a2a30] text-lg leading-relaxed">{bubble}</div>
          {followUp && <div className="text-[#8a7178] text-sm mt-2">{followUp}</div>}
        </div>
      )}

      {/* Mic button */}
      {started && (
        <div className="absolute bottom-4 left-0 right-[380px] flex justify-center gap-3">
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
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 rounded-xl px-3 py-1.5 backdrop-blur shadow text-xs text-[#8a7178]">
          <span className={`w-2 h-2 rounded-full ${detectEnabled ? "bg-green-400" : "bg-gray-400"}`} />
          <span>{detectStatus}</span>
          <button type="button" onClick={() => { if (detectEnabled) stopDetection(); else { ensureAudioCtx(); startDetection(); } }}
            className={`px-2 py-0.5 rounded border text-[10px] ${detectEnabled ? "bg-[#ff8aa8] text-white border-[#ff8aa8]" : "border-[#ffd6e0] text-[#ff8aa8]"}`}>
            {detectEnabled ? "关闭" : "自动迎宾"}
          </button>
        </div>
      )}

      {/* Camera preview (small, bottom left) */}
      {detectEnabled && (
        <div className="absolute bottom-14 left-4 w-32 h-24 rounded-lg border-2 border-[#ffd6e0] overflow-hidden shadow">
          <video ref={camVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        </div>
      )}

      {/* Right sidebar */}
      {started && (
        <aside className="absolute top-0 right-0 bottom-0 w-[380px] bg-white border-l border-[#ffe2eb] overflow-y-auto p-5">
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

      {/* Phone lead form */}
      {showPhoneForm && <PhoneFormModal onClose={() => setShowPhoneForm(false)} />}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .mm-blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.7; will-change: transform; }
        .mm-blob-1 { width: 55vmax; height: 55vmax; background: #ff8aa8; top: -15%; left: -15%; animation: d1 32s ease-in-out infinite; }
        .mm-blob-2 { width: 50vmax; height: 50vmax; background: #ffd6e0; top: -10%; right: -10%; animation: d2 38s ease-in-out infinite; }
        .mm-blob-3 { width: 52vmax; height: 52vmax; background: #ffe9d6; bottom: -20%; left: 10%; animation: d3 34s ease-in-out infinite; }
        @keyframes d1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(10vw,8vh) scale(1.06); } }
        @keyframes d2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12vw,6vh) scale(1.04); } }
        @keyframes d3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6vw,-8vh) scale(1.05); } }
        @media (prefers-reduced-motion: reduce) { .mm-blob { animation: none !important; } }
        @media (max-width: 900px) {
          aside { position: fixed !important; top: auto !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; max-height: 45vh !important; border-left: none !important; border-top: 1px solid #ffe2eb; }
        }
      `}</style>
    </div>
  );
}

// ─── Keyframe samplers ───
function sampleEmotion(
  arc: MianmianPlan["emotion_arc"] | undefined, ratio: number,
): { emotion: string; intensity: number } {
  if (!arc?.length) return { emotion: "neutral", intensity: 0.5 };
  if (ratio <= arc[0].t) return arc[0];
  if (ratio >= arc[arc.length - 1].t) return arc[arc.length - 1];
  for (let i = 0; i < arc.length - 1; i++) {
    if (ratio >= arc[i].t && ratio < arc[i + 1].t) {
      const a = arc[i], b = arc[i + 1];
      const u = (ratio - a.t) / Math.max(1e-6, b.t - a.t);
      return { emotion: u < 0.5 ? a.emotion : b.emotion, intensity: a.intensity * (1 - u) + b.intensity * u };
    }
  }
  return arc[arc.length - 1];
}

function sampleGesture(
  track: MianmianPlan["gesture_track"] | undefined, elapsedMs: number, totalMs: number,
): string | null {
  if (!track?.length) return null;
  let active: string | null = null;
  for (const k of track) {
    const kMs = k.t * totalMs, hold = k.hold_ms || 600;
    if (elapsedMs >= kMs - 100 && elapsedMs <= kMs + hold) active = k.gesture;
  }
  return active;
}

// ─── Phone lead form modal ───
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
