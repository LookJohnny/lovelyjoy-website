/**
 * Shared types for the LovelyJoy AI Sales Guide ("Joy").
 *
 * The plan-then-infill paradigm: the LLM returns a complete "animation script"
 * in one shot — utterance + emotion keyframes + gesture keyframes + product
 * recommendations + frontend actions. The browser then interpolates between
 * keyframes against the actual TTS audio duration.
 */

export type Locale = "zh" | "en" | "ja" | "ko" | "es";

export type Emotion =
  | "joy"
  | "excited"
  | "neutral"
  | "surprise"
  | "curious"
  | "relaxed"
  | "determined"
  | "embarrassed";

export type Gesture =
  | "idle"
  | "wave"
  | "nod"
  | "shake_head"
  | "point_left"
  | "point_right"
  | "think"
  | "celebrate"
  | "bow";

export interface EmotionKey {
  /** Time ratio along the utterance, 0..1 */
  t: number;
  emotion: Emotion;
  intensity: number;
}

export interface GestureKey {
  /** Time ratio along the utterance, 0..1 */
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
  url?: string;
}

export type ActionType =
  | "show_qr"
  | "show_coupon"
  | "collect_contact"
  | "highlight_product"
  | "open_url"
  | "schedule_meeting";

export interface PlanAction {
  type: ActionType;
  payload?: string | null;
}

export type Intent =
  | "GREETING"
  | "RECOMMEND"
  | "ANSWER"
  | "QUALIFY"
  | "CLOSING"
  | "SMALL_TALK"
  | "HANDOFF";

export interface AIGuidePlan {
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
  category?: string;
  material?: string;
  sizes?: string;
  description?: string;
  moq?: string | number;
  lead_time?: string;
  certifications?: string[];
  image?: string;
  text?: string;
}
