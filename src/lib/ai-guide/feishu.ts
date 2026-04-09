/**
 * Feishu Bitable connector for the AI Sales Guide.
 *
 *  - Reads the products/capability table → in-memory cache (TTL)
 *  - Writes leads to the leads table when a buyer fills the contact form
 *
 * Feishu APIs used:
 *  - POST /open-apis/auth/v3/tenant_access_token/internal      (auth)
 *  - GET  /open-apis/bitable/v1/apps/:app/tables/:table/records (read)
 *  - POST /open-apis/bitable/v1/apps/:app/tables/:table/records (write lead)
 *
 * IMPORTANT — runtime caveat:
 * On Vercel each Lambda has its own memory, so the in-memory cache is per
 * instance. That's fine for this use case (≤30s LLM-driven traffic). If
 * you need a shared cache, swap `productCache` for Vercel KV.
 */
import type { Locale, RAGFact } from "./types";
import { products as STATIC_PRODUCTS } from "@/data/products";

const FEISHU_BASE = "https://open.feishu.cn";

const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";
const APP_TOKEN = process.env.LOVELYJOY_FEISHU_APP_TOKEN || "";
const PRODUCTS_TABLE = process.env.LOVELYJOY_PRODUCTS_TABLE_ID || "";
const LEADS_TABLE = process.env.LOVELYJOY_LEADS_TABLE_ID || "";

const CACHE_TTL_MS = Number(process.env.LOVELYJOY_FEISHU_CACHE_TTL_MS || 5 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────
// tenant_access_token caching
// ─────────────────────────────────────────────────────────────────
let tokenCache: { token: string; expireAt: number } | null = null;

async function getTenantToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && now < tokenCache.expireAt - 60_000) {
    return tokenCache.token;
  }
  if (!APP_ID || !APP_SECRET) {
    throw new Error("FEISHU_APP_ID / FEISHU_APP_SECRET not set");
  }
  const resp = await fetch(`${FEISHU_BASE}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  if (!resp.ok) {
    throw new Error(`Feishu token http ${resp.status}`);
  }
  const data = await resp.json();
  if (!data.tenant_access_token) {
    throw new Error(`Feishu token error: ${JSON.stringify(data).slice(0, 300)}`);
  }
  tokenCache = {
    token: data.tenant_access_token,
    expireAt: Date.now() + (data.expire ?? 7200) * 1000,
  };
  return tokenCache.token;
}

// ─────────────────────────────────────────────────────────────────
// Field map: Feishu Chinese column name → our normalized RAGFact key
// Adjust this once if your Feishu columns are named differently.
// ─────────────────────────────────────────────────────────────────
const FIELD_MAP: Record<string, keyof RAGFact> = {
  产品编码: "id",
  产品ID: "id",
  ID: "id",
  SKU: "id",
  产品名称: "title",
  名称: "title",
  Name: "title",
  分类: "category",
  Category: "category",
  材质: "material",
  Material: "material",
  尺寸: "sizes",
  规格: "sizes",
  Sizes: "sizes",
  描述: "description",
  Description: "description",
  MOQ: "moq",
  起订量: "moq",
  交期: "lead_time",
  "Lead Time": "lead_time",
  认证: "certifications",
  Certifications: "certifications",
  图片: "image",
  Image: "image",
};

function coerceCellValue(v: unknown): unknown {
  if (Array.isArray(v)) {
    const parts: string[] = [];
    for (const item of v) {
      if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        parts.push(String(obj.text ?? obj.name ?? ""));
      } else {
        parts.push(String(item));
      }
    }
    return parts.filter(Boolean).join(", ");
  }
  return v;
}

function normalizeRecord(raw: Record<string, unknown>): RAGFact {
  const fields = (raw.fields ?? {}) as Record<string, unknown>;
  const out: Partial<RAGFact> = {};
  for (const [feishuKey, ourKey] of Object.entries(FIELD_MAP)) {
    if (feishuKey in fields && out[ourKey] === undefined) {
      const v = coerceCellValue(fields[feishuKey]);
      // certifications is an array
      if (ourKey === "certifications") {
        if (typeof v === "string") {
          out[ourKey] = v.split(/[,，;；]\s*/).filter(Boolean);
        } else if (Array.isArray(v)) {
          out[ourKey] = v as string[];
        }
      } else {
        // assign with type coercion handled by caller
        (out as Record<string, unknown>)[ourKey] = v;
      }
    }
  }
  // Build a search blob
  const blob: string[] = [];
  for (const k of ["title", "category", "material", "description"] as const) {
    if (out[k]) blob.push(String(out[k]));
  }
  out.text = blob.join(" ");
  if (!out.id) out.id = String((raw.record_id as string) || "").slice(0, 8) || `P${Date.now()}`;
  if (!out.title) out.title = "Untitled product";
  return out as RAGFact;
}

// ─────────────────────────────────────────────────────────────────
// Product cache
// ─────────────────────────────────────────────────────────────────
let productCache: { items: RAGFact[]; loadedAt: number } | null = null;
let inflight: Promise<RAGFact[]> | null = null;

async function fetchProductsFromFeishu(): Promise<RAGFact[]> {
  if (!APP_TOKEN || !PRODUCTS_TABLE) {
    throw new Error("LOVELYJOY_FEISHU_APP_TOKEN / LOVELYJOY_PRODUCTS_TABLE_ID not set");
  }
  const token = await getTenantToken();
  const url = `${FEISHU_BASE}/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${PRODUCTS_TABLE}/records`;
  const items: RAGFact[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (pageToken) params.set("page_token", pageToken);
    const resp = await fetch(`${url}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(`Feishu records http ${resp.status}`);
    const data = await resp.json();
    if (data.code !== 0) throw new Error(`Feishu records err: ${JSON.stringify(data).slice(0, 200)}`);
    const rawItems = (data.data?.items ?? []) as Record<string, unknown>[];
    for (const r of rawItems) items.push(normalizeRecord(r));
    pageToken = data.data?.has_more ? data.data?.page_token : undefined;
  } while (pageToken);
  return items;
}

/**
 * Fallback: build RAGFacts from the static product data shipped with the site.
 * This means the AI Guide is fully functional even before Feishu is configured.
 */
function buildStaticFacts(): RAGFact[] {
  return STATIC_PRODUCTS.map((p) => ({
    id: p.id,
    title: p.name,
    category: p.category,
    material: p.material,
    sizes: p.sizes,
    description: p.descriptionEn,
    image: p.image,
    text: `${p.name} ${p.nameCn} ${p.material} ${p.sizes} ${p.descriptionEn}`,
  }));
}

export async function getAllProducts(): Promise<RAGFact[]> {
  const now = Date.now();
  if (productCache && now - productCache.loadedAt < CACHE_TTL_MS) {
    return productCache.items;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const items = await fetchProductsFromFeishu();
      productCache = { items, loadedAt: Date.now() };
      console.log(`[ai-guide] Loaded ${items.length} products from Feishu`);
      return items;
    } catch (err) {
      console.warn("[ai-guide] Feishu unavailable, using static products:", err);
      const items = buildStaticFacts();
      productCache = { items, loadedAt: Date.now() };
      return items;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

// ─────────────────────────────────────────────────────────────────
// Search (keyword scoring + simple filters)
// ─────────────────────────────────────────────────────────────────
export interface SearchFilters {
  category?: string;
  priceMax?: number;
  moqMax?: number;
}

export async function searchProducts(
  query: string,
  topK = 4,
  filters: SearchFilters = {},
): Promise<RAGFact[]> {
  const all = await getAllProducts();
  const candidates = all.filter((r) => {
    if (filters.category && !String(r.category ?? "").toLowerCase().includes(filters.category.toLowerCase())) {
      return false;
    }
    return true;
  });

  const q = (query || "").trim().toLowerCase();
  if (!q) return candidates.slice(0, topK);

  const scored = candidates
    .map((r) => ({ rec: r, score: scoreRecord(q, r) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // Default: return first topK so the LLM still has something to ground on
    return candidates.slice(0, topK);
  }
  return scored.slice(0, topK).map((x) => x.rec);
}

function scoreRecord(q: string, r: RAGFact): number {
  const blob = [r.title, r.category, r.material, r.sizes, r.description, r.text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!blob) return 0;
  let score = 0;
  if (blob.includes(q)) score += 50;
  for (const tok of q.split(/\s+/).filter((t) => t.length > 1)) {
    if (blob.includes(tok)) score += 5;
  }
  return score;
}

// ─────────────────────────────────────────────────────────────────
// Lead writing
// ─────────────────────────────────────────────────────────────────
export interface LeadInput {
  company?: string;
  name?: string;
  email: string;
  phone?: string;
  message?: string;
  locale?: Locale;
  source?: string;
}

export async function writeLeadToFeishu(lead: LeadInput): Promise<{ ok: boolean; error?: string }> {
  if (!APP_TOKEN || !LEADS_TABLE) {
    return { ok: false, error: "Feishu leads table not configured" };
  }
  try {
    const token = await getTenantToken();
    const url = `${FEISHU_BASE}/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${LEADS_TABLE}/records`;
    const fields: Record<string, unknown> = {
      公司: lead.company ?? "",
      姓名: lead.name ?? "",
      邮箱: lead.email,
      电话: lead.phone ?? "",
      留言: lead.message ?? "",
      语言: lead.locale ?? "",
      来源: lead.source ?? "ai-guide",
    };
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    const data = await resp.json();
    if (!resp.ok || data.code !== 0) {
      return { ok: false, error: `Feishu write ${resp.status}: ${JSON.stringify(data).slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
