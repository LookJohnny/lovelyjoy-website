"use client";

/**
 * MianmianKiosk — 棉棉 · 爱儿采毛绒玩具品牌形象大使
 *
 * Three.js + VRM 方案，兼容任何标准 VRM 模型：
 *   - Ready Player Me、VRoid Studio、自制 VRM 均可
 *   - 运行时识别 VRM 0.x / 1.0 朝向
 *   - 尊重模型自身 rest pose，仅在明显 T-pose 时做一次轻量下压
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

const BONE_NAMES = [
  "hips", "spine", "chest", "upperChest", "neck", "head",
  "leftShoulder", "leftUpperArm", "leftLowerArm", "leftHand",
  "rightShoulder", "rightUpperArm", "rightLowerArm", "rightHand",
] as const;
type BoneName = (typeof BONE_NAMES)[number];
type BoneRotation = { x: number; y: number; z: number };
type BoneMap = Partial<Record<BoneName, BoneRotation>>;
type LoadedVRM = import("@pixiv/three-vrm").VRM;
type ArmSide = "left" | "right";
interface SpeechRecognitionAlternativeLike { transcript?: string }
interface SpeechRecognitionResultLike {
  isFinal?: boolean;
  [index: number]: SpeechRecognitionAlternativeLike | undefined;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error?: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}
interface BrowserWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
}

const EMOTION_TO_EXPR: Record<string, string> = {
  joy: "happy", excited: "happy", surprise: "surprised", curious: "surprised",
  relaxed: "relaxed", determined: "angry", embarrassed: "sad", sad: "sad", neutral: "neutral",
};
const ALL_EXPR = ["happy", "sad", "angry", "surprised", "relaxed", "neutral"];
const VOWELS = ["aa", "ih", "ou", "ee", "oh"] as const;
const ZERO_ROTATION: BoneRotation = { x: 0, y: 0, z: 0 };
const T_POSE_Z_THRESHOLD = 0.15;
const T_POSE_ARM_SETTLE_CANDIDATES = [1.0, 1.2, 1.4] as const;
const T_POSE_LOWER_ARM_Y_CANDIDATES = [0, 0.12, -0.12, 0.18, -0.18] as const;
const T_POSE_HAND_Y_CANDIDATES = [0, 0.18, -0.18] as const;
const T_POSE_HAND_Z_CANDIDATES = [0, 0.16, -0.16] as const;
const T_POSE_SHOULDER_SETTLE_SCALE = 0.08;
const T_POSE_MAX_SHOULDER_SETTLE_Z = 0.08;
const T_POSE_HEIGHT_TOLERANCE = 0.02;
const T_POSE_TARGET_HAND_DROP_RATIO = 0.88;
const T_POSE_TARGET_REACH_RATIO = 0.24;
const T_POSE_TARGET_LOWER_ARM_DROP_RATIO = 0.54;
const T_POSE_TARGET_HAND_OUT_RATIO = 1.18;
const T_POSE_TARGET_LOWER_ARM_OUT_RATIO = 1.02;
const T_POSE_MIN_SCORE_IMPROVEMENT = 0.18;
const IDLE_MAX_DELTA = 0.05;
const IDLE_LERP_SPEED = 8;

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

function clampIdleDelta(value: number): number {
  return Math.max(-IDLE_MAX_DELTA, Math.min(IDLE_MAX_DELTA, value));
}

function snapshotRestPose(vrm: LoadedVRM): BoneMap {
  const rest: BoneMap = {};

  for (const name of BONE_NAMES) {
    const node = vrm.humanoid?.getNormalizedBoneNode(name);
    if (!node) continue;
    rest[name] = {
      x: node.rotation.x,
      y: node.rotation.y,
      z: node.rotation.z,
    };
  }

  return rest;
}

function getArmNodes(vrm: LoadedVRM, side: ArmSide): Partial<Record<"shoulder" | "upperArm" | "lowerArm" | "hand", import("three").Object3D | null>> {
  const prefix = side === "left" ? "left" : "right";

  return {
    shoulder: vrm.humanoid?.getNormalizedBoneNode(`${prefix}Shoulder` as BoneName),
    upperArm: vrm.humanoid?.getNormalizedBoneNode(`${prefix}UpperArm` as BoneName),
    lowerArm: vrm.humanoid?.getNormalizedBoneNode(`${prefix}LowerArm` as BoneName),
    hand: vrm.humanoid?.getNormalizedBoneNode(`${prefix}Hand` as BoneName),
  };
}

function getWorldY(node: import("three").Object3D): number {
  return node.getWorldPosition(node.position.clone()).y;
}

function getWorldPosition(node: import("three").Object3D) {
  return node.getWorldPosition(node.position.clone());
}

function getHorizontalDistance(a: import("three").Object3D, b: import("three").Object3D): number {
  const aPos = getWorldPosition(a);
  const bPos = getWorldPosition(b);
  const dx = aPos.x - bPos.x;
  const dz = aPos.z - bPos.z;
  return Math.hypot(dx, dz);
}

function getArmHeightScore(vrm: LoadedVRM, side: ArmSide): number | null {
  const nodes = getArmNodes(vrm, side);
  const shoulder = nodes.shoulder;
  const lowerArm = nodes.lowerArm;
  const hand = nodes.hand;

  if (!shoulder || !lowerArm || !hand) return null;

  vrm.scene.updateMatrixWorld(true);

  const shoulderY = getWorldY(shoulder);
  const lowerArmY = getWorldY(lowerArm);
  const handY = getWorldY(hand);

  return ((lowerArmY - shoulderY) + (handY - shoulderY)) * 0.5;
}

function getShoulderSettleDelta(upperArmDelta: number): number {
  return Math.sign(upperArmDelta) * Math.min(T_POSE_MAX_SHOULDER_SETTLE_Z, Math.abs(upperArmDelta) * T_POSE_SHOULDER_SETTLE_SCALE);
}

function getArmPoseMetrics(vrm: LoadedVRM, side: ArmSide): {
  handDropRatio: number;
  lowerArmDropRatio: number;
  reachRatio: number;
  handOutRatio: number;
  lowerArmOutRatio: number;
  handInwardAlignment: number;
} | null {
  const nodes = getArmNodes(vrm, side);
  const shoulder = nodes.shoulder;
  const lowerArm = nodes.lowerArm;
  const hand = nodes.hand;
  const hips = vrm.humanoid?.getNormalizedBoneNode("hips");

  if (!shoulder || !lowerArm || !hand || !hips) return null;

  vrm.scene.updateMatrixWorld(true);

  const shoulderPos = getWorldPosition(shoulder);
  const lowerArmPos = getWorldPosition(lowerArm);
  const handPos = getWorldPosition(hand);
  const handDx = handPos.x - shoulderPos.x;
  const handDz = handPos.z - shoulderPos.z;
  const armLength = Math.max(1e-4, shoulderPos.distanceTo(handPos));
  const shoulderWidth = Math.max(1e-4, getHorizontalDistance(shoulder, hips));
  const handToHipsHorizontal = getHorizontalDistance(hand, hips);
  const lowerArmToHipsHorizontal = getHorizontalDistance(lowerArm, hips);
  const inwardDirection = getWorldPosition(hips).sub(handPos).setY(0);
  const inwardDirectionLength = inwardDirection.length();
  const handQuaternion = hand.getWorldQuaternion(hand.quaternion.clone());
  const handXAxis = hand.position.clone().set(1, 0, 0).applyQuaternion(handQuaternion).setY(0);
  const handZAxis = hand.position.clone().set(0, 0, 1).applyQuaternion(handQuaternion).setY(0);

  let handInwardAlignment = 0.5;
  if (inwardDirectionLength > 1e-4) {
    inwardDirection.normalize();
    const xAlignment = handXAxis.lengthSq() > 1e-4 ? Math.abs(handXAxis.normalize().dot(inwardDirection)) : 0;
    const zAlignment = handZAxis.lengthSq() > 1e-4 ? Math.abs(handZAxis.normalize().dot(inwardDirection)) : 0;
    handInwardAlignment = Math.max(xAlignment, zAlignment);
  }

  return {
    handDropRatio: (shoulderPos.y - handPos.y) / armLength,
    lowerArmDropRatio: (shoulderPos.y - lowerArmPos.y) / armLength,
    reachRatio: Math.hypot(handDx, handDz) / armLength,
    handOutRatio: handToHipsHorizontal / shoulderWidth,
    lowerArmOutRatio: lowerArmToHipsHorizontal / shoulderWidth,
    handInwardAlignment,
  };
}

function getArmPoseScore(vrm: LoadedVRM, side: ArmSide): number | null {
  const metrics = getArmPoseMetrics(vrm, side);
  if (!metrics) return null;

  const reachPenalty = Math.abs(metrics.reachRatio - T_POSE_TARGET_REACH_RATIO) * 1.6;
  const handDropPenalty = Math.abs(metrics.handDropRatio - T_POSE_TARGET_HAND_DROP_RATIO) * 2.3;
  const lowerArmDropPenalty = Math.abs(metrics.lowerArmDropRatio - T_POSE_TARGET_LOWER_ARM_DROP_RATIO) * 1.9;
  const handOutPenalty = Math.abs(metrics.handOutRatio - T_POSE_TARGET_HAND_OUT_RATIO) * 2.9;
  const lowerArmOutPenalty = Math.abs(metrics.lowerArmOutRatio - T_POSE_TARGET_LOWER_ARM_OUT_RATIO) * 2.5;
  const raisedHandPenalty = metrics.handDropRatio < 0.55 ? 1.6 : 0;
  const raisedElbowPenalty = metrics.lowerArmDropRatio < 0.3 ? 1.2 : 0;
  const tooWideHandPenalty = metrics.handOutRatio > 1.45 ? (metrics.handOutRatio - 1.45) * 3.6 : 0;
  const tooWideElbowPenalty = metrics.lowerArmOutRatio > 1.22 ? (metrics.lowerArmOutRatio - 1.22) * 3.1 : 0;
  const handInwardPenalty = (1 - metrics.handInwardAlignment) * 0.85;

  return reachPenalty
    + handDropPenalty
    + lowerArmDropPenalty
    + handOutPenalty
    + lowerArmOutPenalty
    + raisedHandPenalty
    + raisedElbowPenalty
    + tooWideHandPenalty
    + tooWideElbowPenalty
    + handInwardPenalty;
}

function isArmHorizontalOrRaised(vrm: LoadedVRM, side: ArmSide): boolean {
  const heightScore = getArmHeightScore(vrm, side);
  return heightScore != null && heightScore >= -T_POSE_HEIGHT_TOLERANCE;
}

function hasClearlyTPoseArms(vrm: LoadedVRM, rest: BoneMap): boolean {
  const leftUpperArm = rest.leftUpperArm;
  const rightUpperArm = rest.rightUpperArm;

  return leftUpperArm != null
    && rightUpperArm != null
    && Math.abs(leftUpperArm.z) <= T_POSE_Z_THRESHOLD
    && Math.abs(rightUpperArm.z) <= T_POSE_Z_THRESHOLD
    && isArmHorizontalOrRaised(vrm, "left")
    && isArmHorizontalOrRaised(vrm, "right");
}

function chooseSettleDelta(vrm: LoadedVRM, side: ArmSide): {
  upperArmDelta: number;
  shoulderDelta: number;
  lowerArmYDelta: number;
  handYDelta: number;
  handZDelta: number;
} | null {
  const nodes = getArmNodes(vrm, side);
  const upperArm = nodes.upperArm;
  if (!upperArm) return null;

  const shoulder = nodes.shoulder;
  const lowerArm = nodes.lowerArm;
  const hand = nodes.hand;
  const originalUpperArmZ = upperArm.rotation.z;
  const originalShoulderZ = shoulder?.rotation.z;
  const originalLowerArmY = lowerArm?.rotation.y;
  const originalHandY = hand?.rotation.y;
  const originalHandZ = hand?.rotation.z;
  const baseScore = getArmPoseScore(vrm, side);
  if (baseScore == null) return null;

  let bestUpperArmDelta: number | null = null;
  let bestShoulderDelta = 0;
  let bestLowerArmYDelta = 0;
  let bestHandYDelta = 0;
  let bestHandZDelta = 0;
  let bestScore = baseScore;

  for (const magnitude of T_POSE_ARM_SETTLE_CANDIDATES) {
    for (const candidate of [-magnitude, magnitude]) {
      const shoulderDelta = getShoulderSettleDelta(candidate);
      for (const lowerArmYDelta of T_POSE_LOWER_ARM_Y_CANDIDATES) {
        for (const handYDelta of T_POSE_HAND_Y_CANDIDATES) {
          for (const handZDelta of T_POSE_HAND_Z_CANDIDATES) {
            upperArm.rotation.z = originalUpperArmZ + candidate;
            if (shoulder && originalShoulderZ !== undefined) {
              shoulder.rotation.z = originalShoulderZ + shoulderDelta;
            }
            if (lowerArm && originalLowerArmY !== undefined) {
              lowerArm.rotation.y = originalLowerArmY + lowerArmYDelta;
            }
            if (hand && originalHandY !== undefined) {
              hand.rotation.y = originalHandY + handYDelta;
            }
            if (hand && originalHandZ !== undefined) {
              hand.rotation.z = originalHandZ + handZDelta;
            }

            const candidateScore = getArmPoseScore(vrm, side);
            if (candidateScore != null && candidateScore < bestScore) {
              bestScore = candidateScore;
              bestUpperArmDelta = candidate;
              bestShoulderDelta = shoulderDelta;
              bestLowerArmYDelta = lowerArmYDelta;
              bestHandYDelta = handYDelta;
              bestHandZDelta = handZDelta;
            }
          }
        }
      }
    }
  }

  upperArm.rotation.z = originalUpperArmZ;
  if (shoulder && originalShoulderZ !== undefined) {
    shoulder.rotation.z = originalShoulderZ;
  }
  if (lowerArm && originalLowerArmY !== undefined) {
    lowerArm.rotation.y = originalLowerArmY;
  }
  if (hand && originalHandY !== undefined) {
    hand.rotation.y = originalHandY;
  }
  if (hand && originalHandZ !== undefined) {
    hand.rotation.z = originalHandZ;
  }
  vrm.scene.updateMatrixWorld(true);

  return bestUpperArmDelta != null && bestScore <= baseScore - T_POSE_MIN_SCORE_IMPROVEMENT
    ? {
      upperArmDelta: bestUpperArmDelta,
      shoulderDelta: bestShoulderDelta,
      lowerArmYDelta: bestLowerArmYDelta,
      handYDelta: bestHandYDelta,
      handZDelta: bestHandZDelta,
    }
    : null;
}

function applyTPoseSettle(vrm: LoadedVRM): void {
  for (const side of ["left", "right"] as const) {
    const settle = chooseSettleDelta(vrm, side);
    if (settle == null) continue;

    const nodes = getArmNodes(vrm, side);
    const upperArm = nodes.upperArm;
    if (!upperArm) continue;

    upperArm.rotation.z += settle.upperArmDelta;
    if (nodes.shoulder) {
      nodes.shoulder.rotation.z += settle.shoulderDelta;
    }
    if (nodes.lowerArm) {
      nodes.lowerArm.rotation.y += settle.lowerArmYDelta;
    }
    if (nodes.hand) {
      nodes.hand.rotation.y += settle.handYDelta;
      nodes.hand.rotation.z += settle.handZDelta;
    }
  }

  vrm.scene.updateMatrixWorld(true);
}

function buildIdleLayer(elapsed: number, mode: Mode, speechAmplitude: number): BoneMap {
  const breath = Math.sin(elapsed * 1.2);
  const chestBreath = Math.sin(elapsed * 1.2 + 0.45);
  const upperChestBreath = Math.sin(elapsed * 1.2 + 0.9);
  const headX = Math.sin(elapsed * 0.58) * 0.012;
  const headY = Math.sin(elapsed * 0.46 + 0.7) * 0.018;
  const headZ = Math.sin(elapsed * 0.52 + 1.2) * 0.012;
  const speechBob = mode === "speaking" ? Math.min(0.008, speechAmplitude * 0.02) : 0;

  let modeHeadX = 0;
  let modeHeadY = 0;
  let modeHeadZ = 0;
  let modeHipsY = 0;

  if (mode === "listening") {
    modeHeadX = 0.006;
    modeHipsY = 0.004;
  } else if (mode === "thinking") {
    modeHeadX = -0.008;
    modeHeadY = 0.01;
    modeHeadZ = 0.008;
  }

  return {
    hips: {
      x: 0,
      y: clampIdleDelta(Math.sin(elapsed * 0.38 + 0.3) * 0.014 + modeHipsY),
      z: 0,
    },
    spine: {
      x: clampIdleDelta(breath * 0.012),
      y: 0,
      z: 0,
    },
    chest: {
      x: clampIdleDelta(chestBreath * 0.018),
      y: 0,
      z: 0,
    },
    upperChest: {
      x: clampIdleDelta(upperChestBreath * 0.008),
      y: 0,
      z: 0,
    },
    neck: {
      x: clampIdleDelta(headX * 0.45 + modeHeadX * 0.35 + speechBob * 0.3),
      y: clampIdleDelta(headY * 0.4 + modeHeadY * 0.35),
      z: clampIdleDelta(headZ * 0.35 + modeHeadZ * 0.35),
    },
    head: {
      x: clampIdleDelta(headX + modeHeadX + speechBob),
      y: clampIdleDelta(headY + modeHeadY),
      z: clampIdleDelta(headZ + modeHeadZ),
    },
  };
}

export default function MianmianKiosk() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<{
    renderer?: import("three").WebGLRenderer;
    scene?: import("three").Scene;
    camera?: import("three").PerspectiveCamera;
    vrm?: LoadedVRM;
    lookAtTarget?: import("three").Object3D;
    rest: BoneMap;
    rafId?: number;
    disposed: boolean;
  }>({ rest: {}, disposed: false });

  const planRef = useRef<{ plan: MianmianPlan | null; startedAt: number; totalMs: number }>({ plan: null, startedAt: 0, totalMs: 0 });
  const audioRef = useRef<{ ctx: AudioContext | null; analyser: AnalyserNode | null; data: Uint8Array<ArrayBuffer> | null; amplitude: number }>({ ctx: null, analyser: null, data: null, amplitude: 0 });
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
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
    let removeResize: (() => void) | undefined;
    let rendererInstance: import("three").WebGLRenderer | undefined;
    let rafId: number | undefined;
    const runtime = threeRef.current;

    runtime.disposed = false;
    runtime.rest = {};
    runtime.lookAtTarget = undefined;
    runtime.vrm = undefined;
    runtime.renderer = undefined;
    runtime.scene = undefined;
    runtime.camera = undefined;

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
        rendererInstance = renderer;
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const resize = () => {
          const width = container.clientWidth;
          const height = container.clientHeight;
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(1, height);
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);
        removeResize = () => window.removeEventListener("resize", resize);

        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const key = new THREE.DirectionalLight(0xfff0e8, 1.2); key.position.set(1, 2, 1); scene.add(key);
        const fill = new THREE.DirectionalLight(0xffd6e0, 0.5); fill.position.set(-1, 0.6, 1); scene.add(fill);

        const loader = new GLTFMod.GLTFLoader();
        loader.register((parser) => new VRM.VRMLoaderPlugin(parser));

        loader.load(VRM_PATH, (gltf) => {
          if (cancelled) return;
          try {
            const vrm = (gltf.userData as { vrm?: LoadedVRM }).vrm;
            if (!vrm) throw new Error("vrm missing in userData");

            VRM.VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRM.VRMUtils.combineSkeletons(gltf.scene);

            vrm.scene.rotation.y = 0;
            if (vrm.meta?.metaVersion === "0") {
              VRM.VRMUtils.rotateVRM0(vrm);
            }

            const loadedRest = snapshotRestPose(vrm);
            if (hasClearlyTPoseArms(vrm, loadedRest)) {
              applyTPoseSettle(vrm);
            }

            vrm.scene.updateMatrixWorld(true);
            scene.add(vrm.scene);

            if (vrm.lookAt) {
              const target = new THREE.Object3D();
              target.position.copy(camera.position);
              scene.add(target);
              vrm.lookAt.target = target;
              runtime.lookAtTarget = target;
            }

            runtime.rest = snapshotRestPose(vrm);
            runtime.vrm = vrm;
            setLoadState({ kind: "ready" });
          } catch (err) {
            setLoadState({ kind: "error", message: `VRM 解析失败: ${(err as Error).message}` });
          }
        },
        (xhr) => { if (xhr.lengthComputable) setLoadState({ kind: "loading", progress: Math.min(1, xhr.loaded / xhr.total) }); },
        (err) => setLoadState({ kind: "error", message: `VRM 加载失败: ${(err as Error).message ?? "unknown"}` }),
        );

        runtime.renderer = renderer;
        runtime.scene = scene;
        runtime.camera = camera;

        // ─── Animation tick ───
        const clock = new THREE.Clock();
        let elapsed = 0, blinkTimer = 0, blinkActive = 0, blinkDouble = 0;
        let nextGlanceAt = 4 + Math.random() * 3, glanceUntil = 0, glanceOff = { x: 0, y: 0 };

        const tick = () => {
          if (runtime.disposed) return;
          const dt = clock.getDelta(); elapsed += dt;
          const vrm = runtime.vrm;
          if (!vrm) { renderer.render(scene, camera); runtime.rafId = requestAnimationFrame(tick); return; }

          const t = elapsed, m = modeRef.current;

          const idle = buildIdleLayer(t, m, audioRef.current.amplitude);

          // Blinks
          blinkTimer += dt;
          const blinkInt = m === "thinking" ? 7 + Math.random() * 3 : m === "speaking" || m === "listening" ? 3 + Math.random() * 2 : 4 + Math.random() * 3;
          if (blinkTimer > blinkInt && blinkActive <= 0) { blinkActive = 0.16; blinkTimer = 0; blinkDouble = Math.random() < 0.1 ? 1 : 0; }
          if (blinkActive > 0) { blinkActive -= dt; vrm.expressionManager?.setValue("blink", Math.sin((1 - blinkActive / 0.16) * Math.PI)); if (blinkActive <= 0 && blinkDouble > 0) { blinkActive = 0.15; blinkDouble = 0; } }
          else vrm.expressionManager?.setValue("blink", 0);

          // Saccade + glance
          const lat = runtime.lookAtTarget;
          if (lat) {
            const sx = Math.sin(t * 0.83 + 2.1) * 0.06, sy = Math.sin(t * 0.67 + 0.4) * 0.03;
            if (t > nextGlanceAt && glanceUntil === 0) { glanceOff = { x: (Math.random() - 0.5) * 0.35, y: (Math.random() - 0.3) * 0.18 }; glanceUntil = t + 0.35 + Math.random() * 0.25; }
            let gx = 0, gy = 0;
            if (glanceUntil > 0) { if (t < glanceUntil) { const e = Math.max(0, 1 - Math.abs((t - (glanceUntil - 0.3)) / 0.3)); gx = glanceOff.x * e; gy = glanceOff.y * e; } else { glanceUntil = 0; nextGlanceAt = t + 4 + Math.random() * 4; } }
            let mgx = 0, mgy = 0; if (m === "thinking") { mgx = 0.2; mgy = 0.12; }
            const cam = runtime.camera;
            if (cam) lat.position.set(cam.position.x + sx + gx + mgx, cam.position.y + sy + gy + mgy, cam.position.z);
          }

          // Plan-driven emotion + lip sync
          const cur = planRef.current.plan;
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
            const amp = audioRef.current.amplitude;
            const mouth = Math.min(0.45, amp * 1.8);
            const vi = Math.floor(elapsed * 6) % VOWELS.length;
            for (let i = 0; i < VOWELS.length; i++) vrm.expressionManager?.setValue(VOWELS[i], i === vi ? mouth : 0);
            if (ep > total + 300) { for (const v of VOWELS) vrm.expressionManager?.setValue(v, 0); planRef.current.plan = null; }
          } else {
            for (const v of VOWELS) vrm.expressionManager?.setValue(v, 0);
            vrm.expressionManager?.setValue("happy", baseHappy);
            for (const e of ALL_EXPR) { if (e !== "happy") vrm.expressionManager?.setValue(e, 0); }
          }

          const lerpRate = 1 - Math.exp(-dt * IDLE_LERP_SPEED);
          for (const name of BONE_NAMES) {
            const node = vrm.humanoid?.getNormalizedBoneNode(name);
            const restBone = runtime.rest[name];
            if (!node || !restBone) continue;

            const idleBone = idle[name] ?? ZERO_ROTATION;
            const tx = restBone.x + idleBone.x;
            const ty = restBone.y + idleBone.y;
            const tz = restBone.z + idleBone.z;

            node.rotation.x += (tx - node.rotation.x) * lerpRate;
            node.rotation.y += (ty - node.rotation.y) * lerpRate;
            node.rotation.z += (tz - node.rotation.z) * lerpRate;
          }

          vrm.update(dt);
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(tick);
          runtime.rafId = rafId;
        };
        tick();
      } catch (err) { setLoadState({ kind: "error", message: `init: ${(err as Error).message}` }); }
    })();

    return () => {
      cancelled = true; runtime.disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      removeResize?.();
      const r = rendererInstance;
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
      const browserWindow = window as BrowserWindow;
      const C = window.AudioContext || browserWindow.webkitAudioContext;
      if (!C) throw new Error("AudioContext is not available in this browser");
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
  const startRec = useCallback(() => { try { recognitionRef.current?.start(); setMode(m => m === "thinking" || m === "speaking" ? m : "listening"); } catch {} }, []);
  const stopRec = useCallback(() => { try { recognitionRef.current?.stop(); } catch {} }, []);

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
    const browserWindow = window as BrowserWindow;
    const SR = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR(); rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEventLike) => { const l = e.results[e.results.length - 1]; if (l?.isFinal) { const t = (l[0]?.transcript ?? "").trim(); if (t) sendChat(t); } };
    rec.onerror = (e: SpeechRecognitionErrorEventLike) => { if (e.error === "not-allowed") { shouldListenRef.current = false; setMicState("denied"); } };
    rec.onend = () => { if (!shouldListenRef.current) { setMode(m => m === "thinking" || m === "speaking" ? m : "idle"); return; } setMode(m => { if (m === "thinking" || m === "speaking") return m; setTimeout(() => { if (shouldListenRef.current) try { recognitionRef.current?.start(); } catch {} }, 250); return "listening"; }); };
    recognitionRef.current = rec; return () => { try { rec.stop(); } catch {} recognitionRef.current = null; };
  }, [sendChat]);

  const handleStart = useCallback(async () => {
    if (started) return; setStarted(true); ensureAudio();
    try { await audioRef.current.ctx?.resume(); } catch {}
    if (navigator.permissions?.query) { try { const s = await navigator.permissions.query({ name: "microphone" as PermissionName }); if (s.state === "granted") { shouldListenRef.current = true; setMicState("on"); setTimeout(() => startRec(), 600); } } catch {} }
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
  //  JSX — "Cotton Candy Dreamscape" UI
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 overflow-hidden z-50 mm-root">
      {/* ── Aurora background: soft cotton-candy blobs ── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="mm-blob mm-blob-1" />
        <div className="mm-blob mm-blob-2" />
        <div className="mm-blob mm-blob-3" />
        <div className="mm-blob mm-blob-4" />
        {/* Noise grain overlay for warmth */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "200px" }} />
      </div>

      {/* ── 3D canvas ── */}
      <div ref={canvasContainerRef} className="absolute inset-0 transition-[right] duration-500 ease-out" style={{ right: started ? "400px" : "0" }} />

      {/* ── Start overlay ── */}
      {!started && loadState.kind !== "error" && (
        <button type="button" onClick={handleStart} disabled={loadState.kind !== "ready"}
          className="absolute inset-0 flex flex-col items-center justify-end pb-[18vh] gap-5 z-10 disabled:cursor-wait transition-opacity duration-300">
          {loadState.kind === "loading" && (
            <div className="flex flex-col items-center gap-4 mm-fade-in">
              <div className="w-16 h-16 rounded-full border-[3px] border-[#ffd6e0] border-t-[#ff8aa8] animate-spin" />
              <div className="text-[#5a3a42] font-medium text-sm tracking-wide">{Math.round(loadState.progress * 100)}%</div>
            </div>
          )}
          {loadState.kind === "ready" && (
            <div className="flex flex-col items-center gap-4 mm-fade-in">
              {/* Pulsing mic orb */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#ff8aa8]/30 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#ff8aa8] to-[#f472b6] grid place-items-center shadow-[0_8px_40px_rgba(255,138,168,0.5)]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#3a2a30] font-bold text-2xl tracking-tight">你好，我是棉棉</div>
                <div className="text-[#8a7178] text-sm mt-1">爱儿采毛绒玩具品牌形象大使</div>
              </div>
              <div className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#ff8aa8] to-[#f472b6] text-white text-sm font-semibold shadow-lg shadow-[#ff8aa8]/25 hover:shadow-xl hover:shadow-[#ff8aa8]/35 hover:scale-[1.03] transition-all duration-200">
                点击开始对话
              </div>
            </div>
          )}
        </button>
      )}

      {/* Error */}
      {loadState.kind === "error" && (
        <div className="absolute inset-0 grid place-items-center p-8 z-10">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm shadow-2xl border border-white/60">
            <div className="text-red-400 font-bold mb-2 text-lg">加载失败</div>
            <div className="text-sm text-[#5a3a42] leading-relaxed">{loadState.message}</div>
            <button type="button" onClick={() => window.location.reload()}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-[#ff8aa8] to-[#f472b6] text-white rounded-xl text-sm font-semibold">重试</button>
          </div>
        </div>
      )}

      {/* ── Brand chip (top-left) ── */}
      <div className="absolute top-5 left-5 z-10 pointer-events-none mm-fade-in">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl px-4 py-2.5 shadow-sm border border-white/40">
          <div className="text-[#ff8aa8] text-base font-bold tracking-tight" style={{ fontFamily: "'Quicksand', system-ui, sans-serif" }}>棉棉</div>
          <div className="text-[10px] text-[#a08088] tracking-widest uppercase">爱儿采 · Plush Toys</div>
        </div>
      </div>

      {/* ── Status pill (only when active) ── */}
      {started && (mode === "thinking" || mode === "speaking") && (
        <div className="absolute top-5 right-[416px] z-10 mm-fade-in">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/70 backdrop-blur-lg shadow-sm border border-white/40 text-xs font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${mode === "thinking" ? "bg-amber-400" : "bg-[#ff8aa8]"} animate-pulse`} />
            <span className="text-[#5a3a42]">{mode === "thinking" ? "思考中…" : "说话中…"}</span>
          </div>
        </div>
      )}

      {/* ── Chat bubble ── */}
      {started && bubble && (
        <div className="absolute left-6 right-[416px] bottom-28 z-10 mm-slide-up">
          <div className="relative bg-white/85 backdrop-blur-xl rounded-[22px] px-5 py-4 shadow-lg shadow-[#ff8aa8]/8 border border-white/50">
            <div className="text-[#3a2a30] text-[17px] leading-relaxed">{bubble}</div>
            {followUp && <div className="text-[#a08088] text-sm mt-2 italic">{followUp}</div>}
            {/* Tail */}
            <div className="absolute -bottom-2 left-12 w-4 h-4 bg-white/85 border-b border-r border-white/50 rotate-45" />
          </div>
        </div>
      )}

      {/* ── Bottom controls ── */}
      {started && (
        <div className="absolute bottom-5 left-0 right-[400px] flex justify-center items-center gap-3 z-10">
          {/* Mic button */}
          <button type="button" onClick={handleMic}
            className={`relative w-14 h-14 rounded-full grid place-items-center shadow-lg transition-all duration-200 ${
              micState === "on"
                ? "bg-gradient-to-br from-[#ff8aa8] to-[#f472b6] text-white shadow-[#ff8aa8]/30 scale-105"
                : "bg-white/80 backdrop-blur-lg text-[#ff8aa8] hover:bg-white hover:scale-105 border border-white/60"
            }`}>
            {micState === "on" && <div className="absolute inset-0 rounded-full bg-[#ff8aa8]/30 animate-ping" />}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="relative">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          </button>
          {/* Reset */}
          <button type="button" onClick={() => { setBubble(""); setFollowUp(""); setCards([]); historyRef.current = []; sendChat("", { isWelcome: true }); }}
            className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-lg text-[#a08088] text-xs font-medium border border-white/40 hover:bg-white/80 transition">重置</button>
        </div>
      )}

      {/* ── Detection (bottom-left) ── */}
      {started && (
        <div className="absolute bottom-5 left-5 z-10">
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-lg rounded-xl px-3 py-1.5 border border-white/40 text-[11px] text-[#a08088]">
            <span className={`w-1.5 h-1.5 rounded-full ${detectEnabled ? "bg-emerald-400" : "bg-gray-300"}`} />
            <span>{detectStatus}</span>
            <button type="button" onClick={() => { if (detectEnabled) stopDetect(); else { ensureAudio(); startDetect(); } }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition ${detectEnabled ? "bg-[#ff8aa8] text-white" : "bg-[#ffd6e0]/60 text-[#ff8aa8] hover:bg-[#ffd6e0]"}`}>
              {detectEnabled ? "关闭" : "自动迎宾"}
            </button>
          </div>
        </div>
      )}
      {detectEnabled && (
        <div className="absolute bottom-[52px] left-5 w-28 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white/40 z-10">
          <video ref={camVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        </div>
      )}

      {/* ── Right sidebar (glassmorphism) ── */}
      {started && (
        <aside className="absolute top-0 right-0 bottom-0 w-[400px] z-10 mm-slide-left"
          style={{ background: "linear-gradient(180deg, rgba(255,245,247,0.92) 0%, rgba(255,240,244,0.95) 100%)", backdropFilter: "blur(24px) saturate(1.4)", borderLeft: "1px solid rgba(255,210,224,0.5)" }}>
          <div className="h-full overflow-y-auto px-6 py-6">
            {/* Section: Quick questions */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#ff8aa8] to-[#ffc4d3]" />
                <h2 className="text-xs font-bold text-[#8a7178] tracking-wider uppercase">试试这样问</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button key={q.label} type="button" onClick={() => sendChat(q.q)}
                    className="group bg-white/70 backdrop-blur-sm text-[#3a2a30] rounded-2xl px-4 py-3 text-sm text-left border border-[#ffe2eb]/60 hover:bg-white hover:shadow-md hover:shadow-[#ff8aa8]/8 hover:border-[#ffc4d3] hover:scale-[1.02] transition-all duration-200">
                    <span className="group-hover:text-[#ff8aa8] transition-colors">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Product cards */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#ffc4d3] to-[#ffe2eb]" />
                <h2 className="text-xs font-bold text-[#8a7178] tracking-wider uppercase">推荐商品</h2>
              </div>
              {cards.length > 0 ? (
                <div className="space-y-3">
                  {cards.slice(0, 3).map((c, i) => (
                    <div key={c.id} className="mm-fade-in bg-white/80 backdrop-blur-sm border border-[#ffe2eb]/60 rounded-2xl p-3.5 flex gap-3.5 hover:shadow-md hover:shadow-[#ff8aa8]/6 transition-all duration-200"
                      style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#fff0f4] to-[#ffe2eb] grid place-items-center text-2xl shrink-0 overflow-hidden shadow-inner">
                        {c.image ? <img src={c.image} alt={c.title} className="w-full h-full object-cover" /> : "🧸"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-[#3a2a30] leading-snug">{c.title}</div>
                        {c.price != null && <div className="text-[#ff8aa8] font-bold text-base mt-0.5">¥{c.price}</div>}
                        {c.tagline && <div className="text-[10px] text-[#a08088] mt-1 leading-relaxed">{c.tagline}</div>}
                        {c.reason && (
                          <div className="inline-block text-[10px] text-[#ff8aa8] bg-[#fff0f4] mt-1.5 px-2.5 py-0.5 rounded-full font-medium">{c.reason}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-3xl mb-3">🧸</div>
                  <div className="text-[#a08088] text-sm leading-relaxed">和我聊几句<br />我会推荐最合适的款式~</div>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* ── QR Modal ── */}
      {showQR && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-[60] backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 max-w-sm shadow-2xl text-center border border-white/60 mm-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#3a2a30] mb-4">扫码加微信</h3>
            <div className="w-52 h-52 mx-auto rounded-2xl border-2 border-dashed border-[#ffd6e0] bg-[#fff8fa] grid place-items-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://aiercai.example.com/wechat")}`} width={200} height={200} alt="QR" className="rounded-lg" />
            </div>
            <p className="text-[#a08088] text-xs mt-3">领取 ¥20 新客券</p>
            <button type="button" onClick={() => setShowQR(false)}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-[#ff8aa8] to-[#f472b6] text-white rounded-xl text-sm font-semibold">好的</button>
          </div>
        </div>
      )}
      {showPhoneForm && <PhoneForm onClose={() => setShowPhoneForm(false)} />}

      {/* ── Styles: blobs, animations, responsive ── */}
      <style jsx>{`
        .mm-root {
          background: linear-gradient(145deg, #FFF5F7 0%, #FFF0F4 35%, #FFEEF0 60%, #FFF3E8 100%);
        }

        /* Aurora blobs — cotton candy palette */
        .mm-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.6;
          will-change: transform;
        }
        .mm-blob-1 {
          width: 50vmax; height: 50vmax;
          background: radial-gradient(circle, #FFB3C6 0%, #ff8aa8 100%);
          top: -20%; left: -15%;
          animation: mm-drift1 28s ease-in-out infinite;
        }
        .mm-blob-2 {
          width: 45vmax; height: 45vmax;
          background: radial-gradient(circle, #FFD6E0 0%, #FFAEC9 100%);
          top: -5%; right: -10%;
          animation: mm-drift2 36s ease-in-out infinite;
        }
        .mm-blob-3 {
          width: 48vmax; height: 48vmax;
          background: radial-gradient(circle, #FFE8D4 0%, #FFDAB9 100%);
          bottom: -25%; left: 15%;
          animation: mm-drift3 32s ease-in-out infinite;
        }
        .mm-blob-4 {
          width: 40vmax; height: 40vmax;
          background: radial-gradient(circle, #E8D5F5 0%, #D4B6E8 100%);
          bottom: -10%; right: 10%;
          animation: mm-drift4 40s ease-in-out infinite;
        }

        @keyframes mm-drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(8vw, 6vh) scale(1.06); }
          66% { transform: translate(-4vw, 10vh) scale(0.95); }
        }
        @keyframes mm-drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-10vw, 8vh) scale(1.04); }
          66% { transform: translate(-5vw, -4vh) scale(0.94); }
        }
        @keyframes mm-drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(6vw, -8vh) scale(1.03); }
          66% { transform: translate(12vw, 4vh) scale(0.97); }
        }
        @keyframes mm-drift4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-8vw, -10vh) scale(1.05); }
          66% { transform: translate(3vw, -3vh) scale(0.93); }
        }

        /* Entrance animations */
        .mm-fade-in {
          animation: mm-fadeIn 0.5s ease-out both;
        }
        .mm-slide-up {
          animation: mm-slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .mm-slide-left {
          animation: mm-slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .mm-scale-in {
          animation: mm-scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mm-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mm-slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mm-slideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes mm-scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .mm-blob { animation: none !important; }
          .mm-fade-in, .mm-slide-up, .mm-slide-left, .mm-scale-in { animation: none !important; }
        }

        @media (max-width: 900px) {
          aside {
            position: fixed !important;
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 45vh !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,210,224,0.5);
            border-radius: 24px 24px 0 0;
          }
        }
      `}</style>
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

function PhoneForm({onClose}:{onClose:()=>void}) {
  const [phone,setPhone]=useState(""); const [sub,setSub]=useState(false); const [done,setDone]=useState<null|"ok"|"err">(null);
  async function submit() { if (!/^1\d{10}$/.test(phone)) return; setSub(true); try { const r=await fetch("/api/mianmian/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,note:"新品到货通知"})}); const d=await r.json(); setDone(d.ok?"ok":"err"); if (d.ok) setTimeout(onClose,2000); } catch { setDone("err"); } finally { setSub(false); } }
  return (<div className="fixed inset-0 bg-black/40 grid place-items-center z-[60] backdrop-blur-sm" onClick={onClose}><div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={e=>e.stopPropagation()}><h2 className="text-xl font-bold text-[#3a2a30] mb-1">留个手机号</h2><p className="text-sm text-[#8a7178] mb-4">新品到货第一时间通知你~</p>{done==="ok"?<div className="text-center py-6 text-[#ff8aa8] font-semibold">收到！</div>:<><input type="tel" placeholder="138xxxxxxxx" maxLength={11} inputMode="numeric" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#fff5f7] border border-[#ffd6e0] text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#ff8aa8]"/>{done==="err"&&<p className="text-sm text-red-500 mt-2">失败，请重试</p>}<div className="flex gap-2 mt-4"><button type="button" onClick={onClose} className="flex-1 border border-[#ffd6e0] text-[#3a2a30] py-2 rounded-lg text-sm font-semibold">取消</button><button type="button" onClick={submit} disabled={sub||!/^1\d{10}$/.test(phone)} className="flex-1 bg-[#ff8aa8] disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold">{sub?"...":"提交"}</button></div></>}</div></div>);
}
