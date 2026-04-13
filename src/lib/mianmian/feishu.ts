/**
 * 飞书多维表格连接器 — 棉棉的商品库（样品主表）。
 *
 * 复用与 Joy 相同的飞书 App 凭证，但读取不同的表：
 *   - 商品表: MIANMIAN_PRODUCTS_TABLE_ID (爱儿采 base 的 样品主表)
 *   - 留资表: MIANMIAN_LEADS_TABLE_ID
 */
import type { RAGFact } from "./types";

const FEISHU_BASE = "https://open.feishu.cn";

const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";
const APP_TOKEN =
  process.env.MIANMIAN_FEISHU_APP_TOKEN ||
  process.env.LOVELYJOY_FEISHU_APP_TOKEN ||
  "";
const PRODUCTS_TABLE = process.env.MIANMIAN_PRODUCTS_TABLE_ID || "";
const LEADS_TABLE = process.env.MIANMIAN_LEADS_TABLE_ID || "";

const CACHE_TTL_MS = Number(
  process.env.MIANMIAN_FEISHU_CACHE_TTL_MS || 5 * 60 * 1000,
);

// ─────────────────────────────────────────────────────────────────
// tenant_access_token
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
  const resp = await fetch(
    `${FEISHU_BASE}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
    },
  );
  if (!resp.ok) throw new Error(`Feishu token http ${resp.status}`);
  const data = await resp.json();
  if (!data.tenant_access_token) {
    throw new Error(
      `Feishu token error: ${JSON.stringify(data).slice(0, 300)}`,
    );
  }
  tokenCache = {
    token: data.tenant_access_token,
    expireAt: Date.now() + (data.expire ?? 7200) * 1000,
  };
  return tokenCache.token;
}

// ─────────────────────────────────────────────────────────────────
// 字段映射：飞书列名 → RAGFact key
// ─────────────────────────────────────────────────────────────────
const FIELD_MAP: Record<string, keyof RAGFact> = {
  产品编码: "id",
  编码: "id",
  SKU: "id",
  ID: "id",
  产品名称: "title",
  名称: "title",
  价格: "price",
  零售价: "price",
  尺寸: "size",
  规格: "size",
  材质: "material",
  适合年龄: "age",
  年龄: "age",
  可水洗: "washable",
  亮点: "highlight",
  描述: "highlight",
  标签: "tags",
  图片: "image",
  库存: "stock",
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
      (out as Record<string, unknown>)[ourKey] = coerceCellValue(
        fields[feishuKey],
      );
    }
  }
  // 组合搜索文本
  const blob: string[] = [];
  for (const k of ["title", "material", "highlight", "tags"] as const) {
    if (out[k]) blob.push(String(out[k]));
  }
  out.text = blob.join(" ");
  if (!out.id)
    out.id =
      String((raw.record_id as string) || "").slice(0, 8) ||
      `P${Date.now()}`;
  if (!out.title) out.title = "未命名商品";
  return out as RAGFact;
}

// ─────────────────────────────────────────────────────────────────
// 商品缓存
// ─────────────────────────────────────────────────────────────────
let productCache: { items: RAGFact[]; loadedAt: number } | null = null;
let inflight: Promise<RAGFact[]> | null = null;

/** 本地备用商品数据 */
const STATIC_PRODUCTS: RAGFact[] = [
  {
    id: "MM-001",
    title: "粉色小熊抱抱",
    price: 89,
    size: "60cm",
    material: "超柔短毛绒，PP棉填充",
    age: "0-3岁",
    washable: "可水洗",
    highlight: "A类婴幼儿标准，热销款",
    text: "粉色小熊抱抱 超柔短毛绒 可水洗 婴幼儿",
  },
  {
    id: "MM-002",
    title: "奶油兔兔",
    price: 129,
    size: "45cm",
    material: "长毛绒，全棉里衬",
    age: "3岁+",
    washable: "可水洗",
    highlight: "ins风，送闺蜜首选",
    text: "奶油兔兔 长毛绒 ins风 送闺蜜",
  },
  {
    id: "MM-003",
    title: "解压奶牛",
    price: 59,
    size: "30cm",
    material: "弹力超柔",
    age: "全年龄",
    washable: "可水洗",
    highlight: "办公室解压神器，捏不变形",
    text: "解压奶牛 弹力超柔 办公室 解压",
  },
  {
    id: "MM-004",
    title: "巨型泰迪熊",
    price: 299,
    size: "120cm",
    material: "棉麻混纺外皮，PP棉填充",
    age: "全年龄",
    washable: "外套可拆洗",
    highlight: "男朋友替代品，拍照神器",
    text: "巨型泰迪熊 120cm 棉麻 送男朋友 拍照",
  },
];

async function fetchProductsFromFeishu(): Promise<RAGFact[]> {
  if (!APP_TOKEN || !PRODUCTS_TABLE) {
    throw new Error(
      "MIANMIAN_FEISHU_APP_TOKEN / MIANMIAN_PRODUCTS_TABLE_ID not set",
    );
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
    if (data.code !== 0)
      throw new Error(
        `Feishu records err: ${JSON.stringify(data).slice(0, 200)}`,
      );
    const rawItems = (data.data?.items ?? []) as Record<string, unknown>[];
    for (const r of rawItems) items.push(normalizeRecord(r));
    pageToken = data.data?.has_more ? data.data?.page_token : undefined;
  } while (pageToken);
  return items;
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
      console.log(`[mianmian] Loaded ${items.length} products from Feishu`);
      return items;
    } catch (err) {
      console.warn(
        "[mianmian] Feishu unavailable, using static products:",
        err,
      );
      const items = STATIC_PRODUCTS;
      productCache = { items, loadedAt: Date.now() };
      return items;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

// ─────────────────────────────────────────────────────────────────
// 搜索
// ─────────────────────────────────────────────────────────────────
export interface SearchFilters {
  priceMax?: number;
  age?: string;
  washable?: boolean;
}

export async function searchProducts(
  query: string,
  topK = 4,
  filters: SearchFilters = {},
): Promise<RAGFact[]> {
  const all = await getAllProducts();
  const candidates = all.filter((r) => {
    if (
      filters.priceMax &&
      r.price != null &&
      Number(r.price) > filters.priceMax
    )
      return false;
    if (
      filters.washable &&
      r.washable &&
      !String(r.washable).includes("可")
    )
      return false;
    return true;
  });

  const q = (query || "").trim().toLowerCase();
  if (!q) return candidates.slice(0, topK);

  const scored = candidates
    .map((r) => ({ rec: r, score: scoreRecord(q, r) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return candidates.slice(0, topK);
  return scored.slice(0, topK).map((x) => x.rec);
}

function scoreRecord(q: string, r: RAGFact): number {
  const blob = [r.title, r.material, r.highlight, r.tags, r.text]
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
// 留资写入
// ─────────────────────────────────────────────────────────────────
export interface LeadInput {
  phone: string;
  note?: string;
}

export async function writeLeadToFeishu(
  lead: LeadInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!APP_TOKEN || !LEADS_TABLE) {
    return { ok: false, error: "Feishu leads table not configured" };
  }
  try {
    const token = await getTenantToken();
    const url = `${FEISHU_BASE}/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${LEADS_TABLE}/records`;
    const fields: Record<string, unknown> = {
      电话: lead.phone,
      备注: lead.note ?? "",
      来源: "mianmian",
      时间: new Date().toISOString(),
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
      return {
        ok: false,
        error: `Feishu write ${resp.status}: ${JSON.stringify(data).slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
