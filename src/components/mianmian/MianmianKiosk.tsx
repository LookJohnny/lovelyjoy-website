"use client";

/**
 * MianmianKiosk — 棉棉 · 爱儿采毛绒玩具品牌形象大使
 *
 * Three.js + VRM 方案，兼容任何标准 VRM 模型：
 *   - Ready Player Me、VRoid Studio、自制 VRM 均可
 *   - 自动检测 T-pose/A-pose 并矫正
 *   - Plan-then-infill 动画（emotion_arc + gesture_track）
 *   - 多层 idle 动效（呼吸、眨眼、微动、saccade）
 *   - 多元音 lip sync（aa/ih/ou/ee/oh 循环）
 *   - Web Speech 语音输入
 *   - 摄像头客流检测自动迎宾
 *
 * 换模型：替换 /images/mianmian/avatar.vrm 即可，无需改代码。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { MianmianPlan, ProductCard } from "@/lib/mianmian/types";

// ─── Dynamic three.js types ───
type ThreeModule = typeof import("three");
type GLTFLoaderModule = typeof import("three/examples/jsm/loaders/GLTFLoader.js");
type VRMModule = typeof import("@pixiv/three-vrm");

// ─── Config ───
const VRM_PATH = "/images/mianmian/avatar.vrm";

// ─── Procedural gesture poses (bone delta in radians, additive on rest) ───
const POSES: Record<string, Record<string, { x?: number; y?: number; z?: number }>> = {
  idle: {},
  wave: { rightUpperArm: { z: -1.4, x: -0.3 }, rightLowerArm: { y: 1.2, x: -0.3 }, rightHand: { z: -0.3 }, head: { z: 0.06, y: -0.08 } },
  nod: { head: { x: 0.3 }, neck: { x: 0.12 } },
  shake_head: { head: { y: 0.4 }, neck: { y: 0.18 } },
  point_left: { leftUpperArm: { x: -0.5, z: -0.4 }, leftLowerArm: { y: -0.6 }, head: { y: 0.3 } },
  point_right: { rightUpperArm: { x: -0.5, z: 0.4 }, rightLowerArm: { y: 0.6 }, head: { y: -0.3 } },
  think: { rightUpperArm: { x: -0.6, z: 0.2 }, rightLowerArm: { x: -1.8, y: 0.9 }, rightHand: { x: -0.2, y: 0.3 }, head: { x: 0.08, y: -0.12, z: 0.18 } },
  celebrate: { leftUpperArm: { x: -0.5, z: -1.2 }, rightUpperArm: { x: -0.5, z: 1.2 }, leftLowerArm: { y: -0.4 }, rightLowerArm: { y: 0.4 }, head: { x: -0.12 } },
  heart: { leftUpperArm: { x: -0.7, z: -0.6 }, rightUpperArm: { x: -0.7, z: 0.6 }, leftLowerArm: { x: -1.5, y: -0.6 }, rightLowerArm: { x: -1.5, y: 0.6 }, head: { x: 0.05, z: 0.05 } },
  clap: { leftUpperArm: { x: -1.0, z: -0.5 }, rightUpperArm: { x: -1.0, z: 0.5 }, leftLowerArm: { x: -0.6, y: -0.5 }, rightLowerArm: { x: -0.6, y: 0.5 } },
  bow: { spine: { x: 0.4 }, chest: { x: 0.18 }, neck: { x: 0.1 }, head: { x: 0.35 } },
};

const BONE_NAMES = [
  "hips", "spine", "chest", "upperChest", "neck", "head",
  "leftShoulder", "leftUpperArm", "leftLowerArm", "leftHand",
  "rightShoulder", "rightUpperArm", "rightLowerArm", "rightHand",
] as const;

const EMOTION_TO_EXPR: Record<string, string> = {
  joy: "happy", excited: "happy", surprise: "surprised", curious: "surprised",
  relaxed: "relaxed", determined: "angry", embarrassed: "sad", sad: "sad", neutral: "neutral",
};
const ALL_EXPR = ["happy", "sad", "angry", "surprised", "relaxed", "neutral"];

// ─── Quick questions ───
const QUICK_QUESTIONS = [
  { label: "送3岁宝宝", q: "我想买个送3岁宝宝的，预算100以内" },
  { label: "送男朋友", q: "有没有适合送男朋友的" },
  { label: "办公室解压", q: "办公室解压用什么好" },
  { label: "可水洗的", q: "可以水洗的有哪些" },
];

// ─── Camera detection ───
const DETECT_FPS = 2, DETECT_W = 160, DETECT_H = 120;
const MOTION_THRESHOLD = 30, MOTION_RATIO = 0.04, COOLDOWN_S = 60, IDLE_RESET_S = 30;

type Mode = "idle" | "listening" | "thinking" | "speaking";
type LoadState = { kind: "loading"; progress: number } | { kind: "ready" } | { kind: "error"; message: string };
interface ChatHistoryItem { role: "user" | "assistant"; content: string }

export default function MianmianKiosk() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderer?: any; scene?: any; camera?: any; vrm?: any; lookAtTarget?: any;
    rest: Record<string, { x: number; y: number; z: number }>;
    rafId?: number; disposed: boolean;
  }>({ rest: {}, disposed: false });

  const planRef = useRef<{ plan: MianmianPlan | null; startedAt: number; totalMs: number }>({ plan: null, startedAt: 0, totalMs: 0 });
  const audioRef = useRef<{ ctx: AudioContext | null; analyser: AnalyserNode | null; data: Uint8Array<ArrayBuffer> | null; amplitude: number }>({ ctx: null, analyser: null, data: null, amplitude: 0 });
  const recognitionRef = useRef<unknown>(null);
  const shouldListenRef = useRef(false);
  const historyRef = useRef<ChatHistoryItem[]>([]);

  const [loadState, setLoadState] = useState<LoadState>({ kind: "loading", progress: 0 });
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [bubble, setBubble] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [cards, setCards] = useState<ProductCard[]>([]);
  const [micState, setMicState] = useState<"off" | "on" | "denied">("off");
  const [showQR, setShowQR] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [detectEnabled, setDetectEnabled] = useState(false);
  const [detectStatus, setDetectStatus] = useState("检测关");
  const cardTimerRef = useRef<number | null>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);
  const detectRef = useRef<{
    stream: MediaStream | null; canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null; prevFrame: ImageData | null;
    timer: number | null; lastGreetTime: number; lastMotionTime: number; customerPresent: boolean;
  }>({ stream: null, canvas: null, ctx: null, prevFrame: null, timer: null, lastGreetTime: 0, lastMotionTime: 0, customerPresent: false });

  const modeRef = useRef<Mode>("idle");
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ═══════════════════════════════════════════════════════════════
  //  3D Scene + Animation Loop
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [THREE, VRM, GLTFMod] = await Promise.all([
          import("three") as Promise<ThreeModule>,
          import("@pixiv/three-vrm") as Promise<VRMModule>,
          import("three/examples/jsm/loaders/GLTFLoader.js") as Promise<GLTFLoaderModule>,
        ]);
        if (cancelled) return;
        const container = canvasContainerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
        camera.position.set(0, 1.35, 2.4);
        camera.lookAt(0, 1.25, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const resize = () => { const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); };
        resize(); window.addEventListener("resize", resize);

        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const key = new THREE.DirectionalLight(0xfff0e8, 1.2); key.position.set(1, 2, 1); scene.add(key);
        const fill = new THREE.DirectionalLight(0xffd6e0, 0.5); fill.position.set(-1, 0.6, 1); scene.add(fill);

        const loader = new GLTFMod.GLTFLoader();
        loader.register((parser) => new VRM.VRMLoaderPlugin(parser));

        loader.load(VRM_PATH, (gltf) => {
          if (cancelled) return;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const vrm = (gltf.userData as any).vrm;
            if (!vrm) throw new Error("vrm missing in userData");
            VRM.VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRM.VRMUtils.combineSkeletons(gltf.scene);
            // VRM 0.x 面朝 -Z 需要翻转，VRM 1.0 面朝 +Z 不需要
            // 检测方法：VRM 1.0 的 meta 有 metaVersion 字段
            const isVRM1 = vrm.meta?.metaVersion === "1" || vrm.meta?.specVersion === "1.0";
            if (!isVRM1) {
              vrm.scene.rotation.y = Math.PI;
              console.log("[mianmian] VRM 0.x → rotation.y = PI");
            } else {
              console.log("[mianmian] VRM 1.0 → no rotation needed");
            }
            scene.add(vrm.scene);

            // Eye contact
            if (vrm.lookAt) {
              const target = new THREE.Object3D();
              target.position.copy(camera.position);
              scene.add(target);
              vrm.lookAt.target = target;
              threeRef.current.lookAtTarget = target;
            }

            // ─── T-pose → A-pose correction (only if needed) ───
            // VRM normalized bones: T-pose has upperArm.z near 0
            // A-pose (natural rest) has upperArm.z ≈ ±0.5~1.3
            // Only correct if BOTH arms are clearly in T-pose (z near 0)
            const leftUA = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
            const rightUA = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");
            const leftZ = leftUA ? Math.abs(leftUA.rotation.z) : 999;
            const rightZ = rightUA ? Math.abs(rightUA.rotation.z) : 999;
            const isTPose = leftZ < 0.2 && rightZ < 0.2;

            console.log(`[mianmian] arm Z: left=${leftZ.toFixed(2)} right=${rightZ.toFixed(2)} → ${isTPose ? "T-pose, correcting" : "A-pose, using as-is"}`);

            if (isTPose) {
              const corrections: Record<string, { z?: number; y?: number }> = {
                leftUpperArm:  { z: 1.15 },
                rightUpperArm: { z: -1.15 },
                leftLowerArm:  { y: 0.12 },
                rightLowerArm: { y: -0.12 },
              };
              for (const [name, d] of Object.entries(corrections)) {
                const node = vrm.humanoid?.getNormalizedBoneNode(name);
                if (!node) continue;
                if (d.z !== undefined) node.rotation.z += d.z;
                if (d.y !== undefined) node.rotation.y += d.y;
              }
            }

            // Snapshot rest pose (works for any model)
            const rest: Record<string, { x: number; y: number; z: number }> = {};
            for (const name of BONE_NAMES) {
              const node = vrm.humanoid?.getNormalizedBoneNode(name);
              if (node) rest[name] = { x: node.rotation.x, y: node.rotation.y, z: node.rotation.z };
            }
            threeRef.current.rest = rest;
            threeRef.current.vrm = vrm;
            setLoadState({ kind: "ready" });
          } catch (err) {
            setLoadState({ kind: "error", message: `VRM 解析失败: ${(err as Error).message}` });
          }
        },
        (xhr) => { if (xhr.lengthComputable) setLoadState({ kind: "loading", progress: Math.min(1, xhr.loaded / xhr.total) }); },
        (err) => setLoadState({ kind: "error", message: `VRM 加载失败: ${(err as Error).message ?? "unknown"}` }),
        );

        threeRef.current.renderer = renderer;
        threeRef.current.scene = scene;
        threeRef.current.camera = camera;

        // ─── Animation tick ───
        const clock = new THREE.Clock();
        let elapsed = 0, blinkTimer = 0, blinkActive = 0, blinkDouble = 0;
        let nextGlanceAt = 4 + Math.random() * 3, glanceUntil = 0, glanceOff = { x: 0, y: 0 };
        let nextTiltAt = 8 + Math.random() * 7, tiltEndAt = 0, tilt = { x: 0, y: 0, z: 0 };
        // Idle pose variation: 每 10-15 秒换一个微妙的站姿
        let nextPoseAt = 10 + Math.random() * 5, poseEndAt = 0;
        let idlePose = { hipShift: 0, spineYaw: 0, chestYaw: 0 };
        const gs: { name: string | null; startedAt: number; endAt: number; weight: number } = { name: null, startedAt: 0, endAt: 0, weight: 0 };

        const tick = () => {
          if (threeRef.current.disposed) return;
          const dt = clock.getDelta(); elapsed += dt;
          const vrm = threeRef.current.vrm;
          if (!vrm) { renderer.render(scene, camera); threeRef.current.rafId = requestAnimationFrame(tick); return; }

          const t = elapsed, m = modeRef.current;

          // Procedural idle
          // ── Enhanced idle: 更大幅度触发 spring bone 物理 ──
          // 呼吸 (×2 幅度，让胸部起伏+头发晃动更明显)
          const breath = Math.sin(t * 1.3) * 0.035;
          const breathSh = Math.abs(Math.sin(t * 1.3)) * 0.018;
          // 重心转移 (慢速左右偏移，像真人站立)
          const weightShift = Math.sin(t * 0.25) * 0.018;
          // 上身微扭 (spine/chest Y轴旋转，自然的身体语言)
          const bodyTwist = Math.sin(t * 0.33 + 0.5) * 0.012;
          // 身体侧摆 (×2)
          const sway = Math.sin(t * 0.42) * 0.015;
          // 头部运动 (×2 幅度，触发头发物理)
          const hx = Math.sin(t * 0.57) * 0.022, hy = Math.sin(t * 0.49 + 0.7) * 0.028, hz = Math.sin(t * 0.73 + 1.4) * 0.016;
          // 手臂自然浮动
          const armF = Math.sin(t * 1.3 + 0.3) * 0.010;
          // 手指微动 (让手不僵硬)
          const fingerWiggle = Math.sin(t * 1.7) * 0.04;

          let leanX = 0, mhx = 0, mhy = 0, mhz = 0, bob = 0;
          if (m === "listening") {
            leanX = 0.045;
            mhx = 0.03 + Math.sin(t * 0.9) * 0.015;
          } else if (m === "thinking") {
            mhx = -0.06; mhy = 0.10; mhz = 0.06;
          } else if (m === "speaking") {
            // 说话时更大幅度的 head bob + 身体微动
            bob = Math.min(0.04, audioRef.current.amplitude * 0.12);
            mhx = Math.sin(t * 2.1) * 0.025;
            mhy = Math.sin(t * 1.7 + 0.5) * 0.020;
          }

          // 随机偏头 (更大幅度)
          if (t > nextTiltAt && tiltEndAt === 0) { tiltEndAt = t + 2.5; tilt = { x: (Math.random() - 0.5) * 0.07, y: (Math.random() - 0.5) * 0.08, z: (Math.random() - 0.5) * 0.10 }; }
          if (tiltEndAt > 0 && t > tiltEndAt) { tiltEndAt = 0; tilt = { x: 0, y: 0, z: 0 }; nextTiltAt = t + 6 + Math.random() * 5; }

          // Idle 姿态变化: 每 10-15s 换站姿 (重心偏左/偏右/微扭)
          if (t > nextPoseAt && poseEndAt === 0) {
            poseEndAt = t + 8 + Math.random() * 4;
            idlePose = {
              hipShift: (Math.random() - 0.5) * 0.03,
              spineYaw: (Math.random() - 0.5) * 0.04,
              chestYaw: (Math.random() - 0.5) * 0.03,
            };
          }
          if (poseEndAt > 0 && t > poseEndAt) { poseEndAt = 0; idlePose = { hipShift: 0, spineYaw: 0, chestYaw: 0 }; nextPoseAt = t + 10 + Math.random() * 5; }
          // 平滑过渡站姿
          const poseBlend = poseEndAt > 0 ? Math.min(1, (t - (poseEndAt - 10)) / 1.5) : 0;

          const idle: Record<string, { x: number; y: number; z: number }> = {
            hips: { x: 0, y: sway * 0.5 + weightShift + idlePose.hipShift * poseBlend, z: 0 },
            spine: { x: leanX + breath * 0.25, y: sway * 0.4 + bodyTwist + idlePose.spineYaw * poseBlend, z: 0 },
            chest: { x: leanX * 0.5 + breath * 0.7, y: bodyTwist * 0.6 + idlePose.chestYaw * poseBlend, z: sway * 0.25 },
            upperChest: { x: breath * 0.5, y: 0, z: 0 },
            neck: { x: hx * 0.35 + mhx * 0.35, y: hy * 0.35, z: 0 },
            head: { x: hx + mhx + bob + tilt.x, y: hy + mhy + tilt.y, z: hz + mhz + tilt.z },
            leftShoulder: { x: 0, y: 0, z: breathSh * 0.6 }, rightShoulder: { x: 0, y: 0, z: -breathSh * 0.6 },
            leftUpperArm: { x: armF, y: 0, z: 0 }, rightUpperArm: { x: armF, y: 0, z: 0 },
            leftLowerArm: { x: 0, y: 0, z: 0 }, rightLowerArm: { x: 0, y: 0, z: 0 },
            leftHand: { x: fingerWiggle * 0.3, y: 0, z: fingerWiggle * 0.2 }, rightHand: { x: -fingerWiggle * 0.3, y: 0, z: -fingerWiggle * 0.2 },
          };

          // Blinks
          blinkTimer += dt;
          const blinkInt = m === "thinking" ? 7 + Math.random() * 3 : m === "speaking" || m === "listening" ? 3 + Math.random() * 2 : 4 + Math.random() * 3;
          if (blinkTimer > blinkInt && blinkActive <= 0) { blinkActive = 0.16; blinkTimer = 0; blinkDouble = Math.random() < 0.1 ? 1 : 0; }
          if (blinkActive > 0) { blinkActive -= dt; vrm.expressionManager?.setValue("blink", Math.sin((1 - blinkActive / 0.16) * Math.PI)); if (blinkActive <= 0 && blinkDouble > 0) { blinkActive = 0.15; blinkDouble = 0; } }
          else vrm.expressionManager?.setValue("blink", 0);

          // Saccade + glance
          const lat = threeRef.current.lookAtTarget;
          if (lat) {
            const sx = Math.sin(t * 0.83 + 2.1) * 0.06, sy = Math.sin(t * 0.67 + 0.4) * 0.03;
            if (t > nextGlanceAt && glanceUntil === 0) { glanceOff = { x: (Math.random() - 0.5) * 0.35, y: (Math.random() - 0.3) * 0.18 }; glanceUntil = t + 0.35 + Math.random() * 0.25; }
            let gx = 0, gy = 0;
            if (glanceUntil > 0) { if (t < glanceUntil) { const e = Math.max(0, 1 - Math.abs((t - (glanceUntil - 0.3)) / 0.3)); gx = glanceOff.x * e; gy = glanceOff.y * e; } else { glanceUntil = 0; nextGlanceAt = t + 4 + Math.random() * 4; } }
            let mgx = 0, mgy = 0; if (m === "thinking") { mgx = 0.2; mgy = 0.12; }
            const cam = threeRef.current.camera;
            lat.position.set(cam.position.x + sx + gx + mgx, cam.position.y + sy + gy + mgy, cam.position.z);
          }

          // Plan-driven emotion + gesture + lip sync
          const cur = planRef.current.plan;
          let targetGesture: string | null = null;
          const baseHappy = 0.19 + Math.sin(t * 0.94) * 0.05;

          if (cur) {
            const ep = performance.now() - planRef.current.startedAt;
            const total = Math.max(800, planRef.current.totalMs);
            const r = Math.min(1, ep / total);
            const em = sampleEmotion(cur.emotion_arc, r);
            const expr = EMOTION_TO_EXPR[em.emotion] || "neutral";
            const ci = Math.min(0.55, em.intensity);
            for (const e of ALL_EXPR) { if (e !== expr && e !== "happy") vrm.expressionManager?.setValue(e, 0); }
            vrm.expressionManager?.setValue(expr === "happy" ? "happy" : expr, expr === "happy" ? Math.max(baseHappy, ci) : ci);
            if (expr !== "happy") vrm.expressionManager?.setValue("happy", baseHappy);
            targetGesture = sampleGesture(cur.gesture_track, ep, total);
            const amp = audioRef.current.amplitude;
            const mouth = Math.min(0.45, amp * 1.8);
            const vowels = ["aa", "ih", "ou", "ee", "oh"];
            const vi = Math.floor(elapsed * 6) % vowels.length;
            for (let i = 0; i < vowels.length; i++) vrm.expressionManager?.setValue(vowels[i], i === vi ? mouth : 0);
            if (ep > total + 300) { for (const v of vowels) vrm.expressionManager?.setValue(v, 0); planRef.current.plan = null; }
          } else {
            for (const v of ["aa", "ih", "ou", "ee", "oh"]) vrm.expressionManager?.setValue(v, 0);
            vrm.expressionManager?.setValue("happy", baseHappy);
            for (const e of ALL_EXPR) { if (e !== "happy") vrm.expressionManager?.setValue(e, 0); }
          }

          // Gesture weight
          if (targetGesture && targetGesture !== gs.name) { gs.name = targetGesture; gs.startedAt = elapsed; gs.endAt = 0; }
          else if (!targetGesture && gs.name && gs.endAt === 0) gs.endAt = elapsed;
          let wt = 0;
          if (gs.name) { const s = elapsed - gs.startedAt; if (gs.endAt === 0) wt = Math.min(1, s / 0.25); else { wt = Math.max(0, 1 - (elapsed - gs.endAt) / 0.4); if (wt <= 0) { gs.name = null; gs.endAt = 0; } } }
          gs.weight += (wt - gs.weight) * (1 - Math.exp(-dt * 10));
          const pose = gs.name ? POSES[gs.name] : null;
          const gw = gs.weight;

          // Apply bone rotations
          const lr = 1 - Math.exp(-dt * 8);
          for (const name of BONE_NAMES) {
            const node = vrm.humanoid?.getNormalizedBoneNode(name);
            if (!node) continue;
            const rb = threeRef.current.rest[name] || { x: 0, y: 0, z: 0 };
            const ib = idle[name] || { x: 0, y: 0, z: 0 };
            const gb = (pose && pose[name]) || { x: 0, y: 0, z: 0 };
            const tx = rb.x + ib.x + (gb.x || 0) * gw;
            const ty = rb.y + ib.y + (gb.y || 0) * gw;
            const tz = rb.z + ib.z + (gb.z || 0) * gw;
            node.rotation.x += (tx - node.rotation.x) * lr;
            node.rotation.y += (ty - node.rotation.y) * lr;
            node.rotation.z += (tz - node.rotation.z) * lr;
          }
          const chest = vrm.humanoid?.getNormalizedBoneNode("chest");
          if (chest) chest.position.y = breath * 0.5;

          vrm.update(dt);
          renderer.render(scene, camera);
          threeRef.current.rafId = requestAnimationFrame(tick);
        };
        tick();
        return () => { window.removeEventListener("resize", resize); };
      } catch (err) { setLoadState({ kind: "error", message: `init: ${(err as Error).message}` }); }
    })();

    return () => {
      cancelled = true; threeRef.current.disposed = true;
      if (threeRef.current.rafId) cancelAnimationFrame(threeRef.current.rafId);
      const r = threeRef.current.renderer;
      if (r) { r.domElement?.parentNode?.removeChild(r.domElement); r.dispose?.(); }
    };
  }, []);

  // Hide site chrome
  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const s = document.createElement("style"); s.setAttribute("data-mianmian", "");
    s.textContent = `body>header,body>footer,body [data-nav-header],body [data-site-footer]{display:none!important}html,body{overflow:hidden!important}`;
    document.head.appendChild(s);
    return () => { document.body.style.overflow = prev; s.remove(); };
  }, []);

  // Amplitude polling
  useEffect(() => {
    const id = setInterval(() => { const a = audioRef.current; if (a.analyser && a.data) { a.analyser.getByteFrequencyData(a.data); let s = 0; for (let i = 0; i < a.data.length; i++) s += a.data[i]; a.amplitude = s / a.data.length / 255; } }, 30);
    return () => clearInterval(id);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  Audio + Speech + Chat (same as before)
  // ═══════════════════════════════════════════════════════════════
  const ensureAudio = useCallback(() => {
    if (!audioRef.current.ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const C = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new C(); const an = ctx.createAnalyser(); an.fftSize = 256;
      audioRef.current = { ctx, analyser: an, data: new Uint8Array(new ArrayBuffer(an.frequencyBinCount)), amplitude: 0 };
    }
  }, []);

  const playAudio = useCallback(async (b64: string) => {
    if (!b64) return; ensureAudio();
    const ctx = audioRef.current.ctx!; if (ctx.state === "suspended") await ctx.resume();
    const bin = atob(b64); const buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const ab = await ctx.decodeAudioData(buf.buffer);
    const src = ctx.createBufferSource(); src.buffer = ab; src.connect(audioRef.current.analyser!); audioRef.current.analyser!.connect(ctx.destination);
    if (planRef.current.plan) planRef.current.totalMs = ab.duration * 1000;
    await new Promise<void>(r => { src.onended = () => { audioRef.current.amplitude = 0; r(); }; src.start(); });
  }, [ensureAudio]);

  const startPlan = useCallback((plan: MianmianPlan, ms = 1500) => { planRef.current = { plan, startedAt: performance.now(), totalMs: ms }; }, []);
  const startRec = useCallback(() => { try { (recognitionRef.current as any)?.start(); setMode(m => m === "thinking" || m === "speaking" ? m : "listening"); } catch {} }, []);
  const stopRec = useCallback(() => { try { (recognitionRef.current as any)?.stop(); } catch {} }, []);

  const sendChat = useCallback(async (text: string, opts: { isWelcome?: boolean } = {}) => {
    if (!text.trim() && !opts.isWelcome) return;
    stopRec(); setMode("thinking"); setBubble(""); setFollowUp("");
    try {
      const url = opts.isWelcome ? "/api/mianmian/welcome" : "/api/mianmian/chat";
      const body = opts.isWelcome ? {} : { text, history: historyRef.current.slice(-6) };
      const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json(); const plan = data.plan as MianmianPlan;
      setBubble(plan.utterance || ""); setFollowUp(plan.follow_up || "");
      if (plan.product_cards?.length) { setCards(plan.product_cards); if (cardTimerRef.current) clearTimeout(cardTimerRef.current); cardTimerRef.current = window.setTimeout(() => setCards([]), 15000); }
      for (const a of plan.actions || []) { if (a.type === "show_qr") setShowQR(true); if (a.type === "collect_phone") setShowPhoneForm(true); }
      startPlan(plan, 1500);
      if (!opts.isWelcome && text.trim()) { historyRef.current = [...historyRef.current, { role: "user" as const, content: text }, { role: "assistant" as const, content: plan.utterance }].slice(-12); }
      if (data.audio) { setMode("speaking"); await playAudio(data.audio); }
    } catch (e) { console.error("[mianmian]", e); setBubble("不好意思，出了点小问题，再试试？"); }
    finally { setMode("idle"); if (shouldListenRef.current) setTimeout(() => startRec(), 400); }
  }, [playAudio, startPlan, startRec, stopRec]);

  // Speech recognition
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; if (!SR) return;
    const rec = new SR(); rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: any) => { const l = e.results[e.results.length - 1]; if (l?.isFinal) { const t = (l[0]?.transcript ?? "").trim(); if (t) sendChat(t); } };
    rec.onerror = (e: any) => { if (e.error === "not-allowed") { shouldListenRef.current = false; setMicState("denied"); } };
    rec.onend = () => { if (!shouldListenRef.current) { setMode(m => m === "thinking" || m === "speaking" ? m : "idle"); return; } setMode(m => { if (m === "thinking" || m === "speaking") return m; setTimeout(() => { if (shouldListenRef.current) try { (recognitionRef.current as any)?.start(); } catch {} }, 250); return "listening"; }); };
    recognitionRef.current = rec; return () => { try { rec.stop(); } catch {} recognitionRef.current = null; };
  }, [sendChat]);

  const handleStart = useCallback(async () => {
    if (started) return; setStarted(true); ensureAudio();
    try { await audioRef.current.ctx?.resume(); } catch {}
    if (navigator.permissions?.query) { try { const s = await navigator.permissions.query({ name: "microphone" as any }); if (s.state === "granted") { shouldListenRef.current = true; setMicState("on"); setTimeout(() => startRec(), 600); } } catch {} }
    await sendChat("", { isWelcome: true });
  }, [started, sendChat, startRec, ensureAudio]);

  const handleMic = useCallback(async () => {
    if (micState === "on") { shouldListenRef.current = false; stopRec(); setMicState("off"); return; }
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach(t => t.stop()); setMicState("on"); shouldListenRef.current = true; setTimeout(() => startRec(), 200); } catch { setMicState("denied"); }
  }, [micState, startRec, stopRec]);

  // Camera detection
  const sendWelcome = useCallback(() => sendChat("", { isWelcome: true }), [sendChat]);
  const detectFrame = useCallback(() => {
    const d = detectRef.current; const v = camVideoRef.current;
    if (!d.stream || !v || v.readyState < 2 || !d.ctx) return;
    d.ctx.drawImage(v, 0, 0, DETECT_W, DETECT_H);
    const f = d.ctx.getImageData(0, 0, DETECT_W, DETECT_H);
    if (!d.prevFrame) { d.prevFrame = f; return; }
    const p = d.prevFrame.data, c = f.data; let ch = 0;
    for (let i = 0; i < c.length; i += 4) { const g1 = (p[i] * 299 + p[i+1] * 587 + p[i+2] * 114) / 1000, g2 = (c[i] * 299 + c[i+1] * 587 + c[i+2] * 114) / 1000; if (Math.abs(g1 - g2) > MOTION_THRESHOLD) ch++; }
    d.prevFrame = f; const now = Date.now();
    if (ch / (DETECT_W * DETECT_H) > MOTION_RATIO) { d.lastMotionTime = now; if (!d.customerPresent) d.customerPresent = true; const cd = COOLDOWN_S - (now - d.lastGreetTime) / 1000; if (cd <= 0) { d.lastGreetTime = now; setDetectStatus("顾客来了!"); sendWelcome(); setTimeout(() => setDetectStatus(`冷却 ${COOLDOWN_S}s`), 2000); } else setDetectStatus(`冷却 ${Math.ceil(cd)}s`); }
    else { if (d.customerPresent && now - d.lastMotionTime > IDLE_RESET_S * 1000) { d.customerPresent = false; setDetectStatus("等待顾客..."); } if (d.lastGreetTime > 0) { const cd = COOLDOWN_S - (now - d.lastGreetTime) / 1000; if (cd > 0) setDetectStatus(`冷却 ${Math.ceil(cd)}s`); else setDetectStatus(d.customerPresent ? "顾客在场" : "等待顾客..."); } }
  }, [sendWelcome]);
  const startDetect = useCallback(async () => { try { const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" } }); if (camVideoRef.current) camVideoRef.current.srcObject = s; const cv = document.createElement("canvas"); cv.width = DETECT_W; cv.height = DETECT_H; const d = detectRef.current; d.stream = s; d.canvas = cv; d.ctx = cv.getContext("2d", { willReadFrequently: true }); d.prevFrame = null; d.timer = window.setInterval(detectFrame, 1000 / DETECT_FPS); setDetectEnabled(true); setDetectStatus("等待顾客..."); } catch { setDetectStatus("摄像头不可用"); } }, [detectFrame]);
  const stopDetect = useCallback(() => { const d = detectRef.current; if (d.timer) { clearInterval(d.timer); d.timer = null; } if (d.stream) { d.stream.getTracks().forEach(t => t.stop()); d.stream = null; } if (camVideoRef.current) camVideoRef.current.srcObject = null; d.prevFrame = null; d.customerPresent = false; setDetectEnabled(false); setDetectStatus("检测关"); }, []);
  useEffect(() => () => stopDetect(), [stopDetect]);

  // ═══════════════════════════════════════════════════════════════
  //  JSX
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 overflow-hidden z-50" style={{ background: "linear-gradient(135deg,#fff5f7 0%,#ffeef3 60%,#fff0e0 100%)" }}>
      {/* 3D canvas */}
      <div ref={canvasContainerRef} className="absolute inset-0" style={{ right: started ? "380px" : "0" }} />

      {/* Start overlay */}
      {!started && loadState.kind !== "error" && (
        <button type="button" onClick={handleStart} disabled={loadState.kind !== "ready"} className="absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px] bg-white/20 z-10 disabled:cursor-wait">
          {loadState.kind === "loading" && (<><div className="w-20 h-20 rounded-full border-4 border-[#ffd6e0] border-t-[#ff8aa8] animate-spin" /><div className="text-[#3a2a30] font-semibold">加载中... {Math.round(loadState.progress * 100)}%</div></>)}
          {loadState.kind === "ready" && (<><div className="w-24 h-24 rounded-full bg-[#ff8aa8] grid place-items-center shadow-[0_0_40px_rgba(255,138,168,0.6)] animate-pulse"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg></div><div className="text-[#3a2a30] font-bold text-2xl">棉棉</div><div className="text-[#8a7178] text-sm">爱儿采 · 毛绒玩具品牌形象大使</div><div className="mt-2 px-5 py-2 rounded-full bg-[#ff8aa8] text-white text-sm font-semibold shadow">开始对话</div></>)}
        </button>
      )}
      {loadState.kind === "error" && (<div className="absolute inset-0 grid place-items-center p-8 z-10"><div className="bg-white rounded-2xl p-6 max-w-md shadow-xl"><div className="text-red-500 font-bold mb-2">加载失败</div><div className="text-sm text-[#3a2a30]">{loadState.message}</div><button type="button" onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#ff8aa8] text-white rounded-lg text-sm">重试</button></div></div>)}

      {/* Brand */}
      <div className="absolute top-4 left-4 pointer-events-none z-10"><div className="text-[#ff8aa8] text-lg font-bold">棉棉</div><div className="text-xs text-[#8a7178]">爱儿采 · 毛绒玩具</div></div>

      {/* Status */}
      {started && (mode === "thinking" || mode === "speaking") && (<div className="absolute top-4 right-[396px] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm text-xs z-10"><span className={`w-2 h-2 rounded-full ${mode === "thinking" ? "bg-amber-400" : "bg-pink-400"} animate-pulse`}/><span className="text-[#3a2a30]">{mode === "thinking" ? "思考中..." : "说话中..."}</span></div>)}

      {/* Bubble */}
      {started && bubble && (<div className="absolute left-6 right-[396px] bottom-24 bg-white rounded-2xl p-4 shadow-lg z-10" style={{maxHeight:"30vh"}}><div className="text-[#3a2a30] text-lg leading-relaxed">{bubble}</div>{followUp && <div className="text-[#8a7178] text-sm mt-2">{followUp}</div>}</div>)}

      {/* Bottom controls */}
      {started && (<div className="absolute bottom-4 left-0 right-[380px] flex justify-center gap-3 z-10">
        <button type="button" onClick={handleMic} className={`w-14 h-14 rounded-full grid place-items-center shadow-lg ${micState === "on" ? "bg-[#ff8aa8] text-white" : "bg-white/80 text-[#ff8aa8]"}`}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg></button>
        <button type="button" onClick={() => { setBubble(""); setFollowUp(""); setCards([]); historyRef.current = []; sendChat("", { isWelcome: true }); }} className="px-4 py-2 rounded-full bg-white/80 text-[#8a7178] text-sm shadow">重置</button>
      </div>)}

      {/* Detection */}
      {started && (<div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 rounded-xl px-3 py-1.5 backdrop-blur shadow text-xs text-[#8a7178] z-10"><span className={`w-2 h-2 rounded-full ${detectEnabled ? "bg-green-400" : "bg-gray-400"}`}/><span>{detectStatus}</span><button type="button" onClick={() => { if (detectEnabled) stopDetect(); else { ensureAudio(); startDetect(); }}} className={`px-2 py-0.5 rounded border text-[10px] ${detectEnabled ? "bg-[#ff8aa8] text-white border-[#ff8aa8]" : "border-[#ffd6e0] text-[#ff8aa8]"}`}>{detectEnabled ? "关闭" : "自动迎宾"}</button></div>)}
      {detectEnabled && (<div className="absolute bottom-14 left-4 w-32 h-24 rounded-lg border-2 border-[#ffd6e0] overflow-hidden shadow z-10"><video ref={camVideoRef} autoPlay muted playsInline className="w-full h-full object-cover"/></div>)}

      {/* Sidebar */}
      {started && (<aside className="absolute top-0 right-0 bottom-0 w-[380px] bg-white border-l border-[#ffe2eb] overflow-y-auto p-5 z-10">
        <h2 className="text-xs text-[#8a7178] font-semibold mb-3">试试这样问</h2>
        <div className="grid grid-cols-2 gap-2 mb-5">{QUICK_QUESTIONS.map(q => (<button key={q.label} type="button" onClick={() => sendChat(q.q)} className="bg-[#ffd6e0] text-[#3a2a30] rounded-xl p-3 text-sm text-left hover:bg-[#ffc4d3] transition">{q.label}</button>))}</div>
        <h2 className="text-xs text-[#8a7178] font-semibold mb-3">推荐商品</h2>
        {cards.length > 0 ? (<div className="space-y-3">{cards.slice(0,3).map(c => (<div key={c.id} className="bg-[#fff8fa] border border-[#ffe2eb] rounded-2xl p-3 flex gap-3"><div className="w-16 h-16 rounded-xl bg-[#ffe2eb] grid place-items-center text-2xl shrink-0 overflow-hidden">{c.image ? <img src={c.image} alt={c.title} className="w-full h-full object-cover"/> : "🧸"}</div><div className="min-w-0 flex-1"><div className="font-bold text-sm text-[#3a2a30]">{c.title}</div>{c.price != null && <div className="text-[#ff8aa8] font-bold">¥{c.price}</div>}{c.tagline && <div className="text-[10px] text-[#8a7178] mt-0.5">{c.tagline}</div>}{c.reason && <div className="inline-block text-[10px] text-[#ff8aa8] bg-[#fff0f4] mt-1 px-2 py-0.5 rounded-full">{c.reason}</div>}</div></div>))}</div>) : (<div className="text-center text-[#8a7178] text-sm py-6">和我聊几句，我会推荐最合适的款式~</div>)}
      </aside>)}

      {/* QR */}
      {showQR && (<div className="fixed inset-0 bg-black/40 grid place-items-center z-[60] backdrop-blur-sm" onClick={() => setShowQR(false)}><div className="bg-white rounded-3xl p-6 max-w-sm shadow-2xl text-center" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold text-[#3a2a30] mb-3">扫码加微信</h3><div className="w-56 h-56 mx-auto rounded-2xl border-2 border-dashed border-[#ffd6e0] bg-[#fff5f7] grid place-items-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent("https://aiercai.example.com/wechat")}`} width={220} height={220} alt="QR"/></div><button type="button" onClick={() => setShowQR(false)} className="mt-4 px-6 py-2 bg-[#ff8aa8] text-white rounded-lg text-sm font-semibold">好的</button></div></div>)}
      {showPhoneForm && <PhoneForm onClose={() => setShowPhoneForm(false)}/>}

      <style jsx>{`@media(max-width:900px){aside{position:fixed!important;top:auto!important;bottom:0!important;left:0!important;right:0!important;width:100%!important;max-height:45vh!important;border-left:none!important;border-top:1px solid #ffe2eb}}`}</style>
    </div>
  );
}

// ─── Helpers ───
function sampleEmotion(arc: MianmianPlan["emotion_arc"]|undefined, r: number): {emotion:string;intensity:number} {
  if (!arc?.length) return {emotion:"neutral",intensity:0.5};
  if (r <= arc[0].t) return arc[0]; if (r >= arc[arc.length-1].t) return arc[arc.length-1];
  for (let i = 0; i < arc.length-1; i++) { if (r >= arc[i].t && r < arc[i+1].t) { const a=arc[i],b=arc[i+1],u=(r-a.t)/Math.max(1e-6,b.t-a.t); return {emotion:u<0.5?a.emotion:b.emotion,intensity:a.intensity*(1-u)+b.intensity*u}; } }
  return arc[arc.length-1];
}
function sampleGesture(track: MianmianPlan["gesture_track"]|undefined, ms: number, total: number): string|null {
  if (!track?.length) return null; let a: string|null=null;
  for (const k of track) { const km=k.t*total, h=k.hold_ms||600; if (ms>=km-100&&ms<=km+h) a=k.gesture; } return a;
}

function PhoneForm({onClose}:{onClose:()=>void}) {
  const [phone,setPhone]=useState(""); const [sub,setSub]=useState(false); const [done,setDone]=useState<null|"ok"|"err">(null);
  async function submit() { if (!/^1\d{10}$/.test(phone)) return; setSub(true); try { const r=await fetch("/api/mianmian/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,note:"新品到货通知"})}); const d=await r.json(); setDone(d.ok?"ok":"err"); if (d.ok) setTimeout(onClose,2000); } catch { setDone("err"); } finally { setSub(false); } }
  return (<div className="fixed inset-0 bg-black/40 grid place-items-center z-[60] backdrop-blur-sm" onClick={onClose}><div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={e=>e.stopPropagation()}><h2 className="text-xl font-bold text-[#3a2a30] mb-1">留个手机号</h2><p className="text-sm text-[#8a7178] mb-4">新品到货第一时间通知你~</p>{done==="ok"?<div className="text-center py-6 text-[#ff8aa8] font-semibold">收到！</div>:<><input type="tel" placeholder="138xxxxxxxx" maxLength={11} inputMode="numeric" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#fff5f7] border border-[#ffd6e0] text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#ff8aa8]"/>{done==="err"&&<p className="text-sm text-red-500 mt-2">失败，请重试</p>}<div className="flex gap-2 mt-4"><button type="button" onClick={onClose} className="flex-1 border border-[#ffd6e0] text-[#3a2a30] py-2 rounded-lg text-sm font-semibold">取消</button><button type="button" onClick={submit} disabled={sub||!/^1\d{10}$/.test(phone)} className="flex-1 bg-[#ff8aa8] disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold">{sub?"...":"提交"}</button></div></>}</div></div>);
}
