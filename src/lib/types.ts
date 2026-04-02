// ─── Product ─────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  nameCn: string;
  slug: string;
  description: string;
  descriptionCn: string;
  category: ProductCategory;
  images: string[]; // paths relative to /public
  thumbnail: string;
  tags: string[];
  featured: boolean;
  minOrder?: number;
  sizeRange?: string;
  materials?: string[];
}

export type ProductCategory =
  | "plush-toys"
  | "stuffed-animals"
  | "custom-mascots"
  | "promotional"
  | "baby-toys"
  | "home-decor";

// ─── OEM/ODM Process ────────────────────────────────────────

export interface ProcessStep {
  id: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  icon: string; // lucide icon name
  duration?: string; // e.g. "3-5 days"
}

// ─── Company Advantages / Strengths ─────────────────────────

export interface Advantage {
  id: string;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  stat?: {
    value: number;
    suffix: string;
  };
}

// ─── Testimonial ────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  country: string;
  avatar?: string;
  quote: string;
  quoteCn: string;
  rating: number; // 1-5
}

// ─── FAQ ─────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  questionCn: string;
  answer: string;
  answerCn: string;
}

// ─── Contact Form ───────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  productInterest?: ProductCategory;
}

// ─── Stats ──────────────────────────────────────────────────

export interface StatItem {
  label: string;
  labelCn: string;
  value: number;
  suffix: string;
}

// ─── Gallery Image ──────────────────────────────────────────

export interface GalleryImage {
  src: string;
  alt: string;
  altCn: string;
  width: number;
  height: number;
}
