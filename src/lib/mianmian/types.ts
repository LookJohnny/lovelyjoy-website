/**
 * Shared types for 棉棉 — 毛绒玩具实体店 AI 导购。
 *
 * 复用 plan-then-infill 范式：LLM 一次返回完整"动画剧本"，
 * 前端拿到 TTS 真实时长后做关键帧插值。
 */

export type Locale = "zh";

export type Emotion =
  | "joy"
  | "excited"
  | "neutral"
  | "surprise"
  | "curious"
  | "sad"
  | "embarrassed"
  | "relaxed"
  | "determined";

export type Gesture =
  | "idle"
  | "wave"
  | "nod"
  | "shake_head"
  | "point_left"
  | "point_right"
  | "think"
  | "celebrate"
  | "heart"
  | "clap"
  | "bow";

export interface EmotionKey {
  t: number;
  emotion: Emotion;
  intensity: number;
}

export interface GestureKey {
  t: number;
  gesture: Gesture;
  hold_ms?: number;
}

export interface ProductCard {
  id: string;
  title: string;
  price?: number | string | null;
  tagline?: string;
  image?: string;
  highlight?: string;
  reason?: string;
}

export type ActionType =
  | "show_qr"
  | "show_coupon"
  | "collect_phone"
  | "highlight_product";

export interface PlanAction {
  type: ActionType;
  payload?: string | null;
}

export type Intent =
  | "GREETING"
  | "RECOMMEND"
  | "ANSWER"
  | "UPSELL"
  | "CLOSING"
  | "SMALL_TALK";

export interface MianmianPlan {
  utterance: string;
  language: Locale;
  emotion_arc: EmotionKey[];
  gesture_track: GestureKey[];
  product_cards: ProductCard[];
  actions: PlanAction[];
  intent: Intent;
  follow_up?: string;
}

export interface RAGFact {
  id: string;
  title: string;
  price?: number | string;
  size?: string;
  material?: string;
  age?: string;
  washable?: string;
  highlight?: string;
  tags?: string;
  image?: string;
  stock?: string;
  text?: string;
}
