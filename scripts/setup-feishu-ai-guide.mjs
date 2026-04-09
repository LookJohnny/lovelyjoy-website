/**
 * One-shot bootstrap: creates the Feishu Bitable + Products + Leads tables
 * for the LovelyJoy AI Sales Guide.
 *
 * Usage:
 *   FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx node scripts/setup-feishu-ai-guide.mjs
 *
 * What it does:
 *   1. Auth via tenant_access_token
 *   2. Create a Bitable named "LovelyJoy AI 数据"  → app_token
 *   3. Create the "Products" table with the right fields
 *   4. Create the "Leads" table with the right fields
 *   5. Print the three IDs you need to put into .env / Vercel
 *
 * The script is idempotent-ish: if a table with the same name already
 * exists in the new app, it just reuses it. It will NOT touch existing
 * Bitables — every run creates a fresh one.
 */

const FEISHU_BASE = "https://open.feishu.cn";

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;

if (!APP_ID || !APP_SECRET) {
  console.error("ERROR: set FEISHU_APP_ID and FEISHU_APP_SECRET in env");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
async function api(path, init = {}, token) {
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const resp = await fetch(`${FEISHU_BASE}${path}`, { ...init, headers });
  const text = await resp.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _raw: text };
  }
  if (!resp.ok || (typeof json.code === "number" && json.code !== 0)) {
    throw new Error(`Feishu ${path} failed: ${resp.status} ${JSON.stringify(json).slice(0, 500)}`);
  }
  return json;
}

async function getTenantToken() {
  const data = await api("/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  return data.tenant_access_token;
}

// ─────────────────────────────────────────────────────────────────
// Bitable creation
// ─────────────────────────────────────────────────────────────────
async function createBitable(token, name) {
  const data = await api(
    "/open-apis/bitable/v1/apps",
    { method: "POST", body: JSON.stringify({ name }) },
    token,
  );
  // Two response shapes possible across api versions
  const app = data.data?.app ?? data.data;
  return {
    app_token: app.app_token,
    url: app.url,
    default_table_id: app.default_table_id,
    name: app.name,
  };
}

async function listTables(token, appToken) {
  const data = await api(
    `/open-apis/bitable/v1/apps/${appToken}/tables?page_size=100`,
    { method: "GET" },
    token,
  );
  return data.data?.items ?? [];
}

async function createTable(token, appToken, name) {
  const data = await api(
    `/open-apis/bitable/v1/apps/${appToken}/tables`,
    {
      method: "POST",
      body: JSON.stringify({ table: { name } }),
    },
    token,
  );
  return data.data?.table_id;
}

async function listFields(token, appToken, tableId) {
  const data = await api(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields?page_size=100`,
    { method: "GET" },
    token,
  );
  return data.data?.items ?? [];
}

async function addField(token, appToken, tableId, field) {
  // Skip if already exists
  const existing = await listFields(token, appToken, tableId);
  if (existing.some((f) => f.field_name === field.field_name)) {
    return;
  }
  await api(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
    { method: "POST", body: JSON.stringify(field) },
    token,
  );
}

async function deleteField(token, appToken, tableId, fieldId) {
  // Used to remove the auto-created "多行文本" placeholder field
  try {
    await api(
      `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields/${fieldId}`,
      { method: "DELETE" },
      token,
    );
  } catch (e) {
    // ignore — Feishu won't let you delete the index column
  }
}

// ─────────────────────────────────────────────────────────────────
// Field type constants
// ─────────────────────────────────────────────────────────────────
const TYPE = {
  TEXT: 1,           // multi-line text
  NUMBER: 2,
  SINGLE_SELECT: 3,
  MULTI_SELECT: 4,
  DATETIME: 5,
  CHECKBOX: 7,
  PHONE: 13,
  URL: 15,
  ATTACHMENT: 17,
  CREATED_TIME: 1001,
};

// ─────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────
const PRODUCT_FIELDS = [
  { field_name: "产品名称", type: TYPE.TEXT },
  { field_name: "产品ID",   type: TYPE.TEXT },
  { field_name: "分类",     type: TYPE.SINGLE_SELECT, property: { options: [
    { name: "Plush" }, { name: "Pillow" }, { name: "Keychain" },
    { name: "Gift" }, { name: "IP Licensed" },
  ]}},
  { field_name: "材质",     type: TYPE.TEXT },
  { field_name: "尺寸",     type: TYPE.TEXT },
  { field_name: "MOQ",      type: TYPE.NUMBER, property: { formatter: "0" } },
  { field_name: "交期",     type: TYPE.TEXT },
  { field_name: "认证",     type: TYPE.MULTI_SELECT, property: { options: [
    { name: "EN71" }, { name: "ASTM F963" }, { name: "CPSIA" },
    { name: "REACH" }, { name: "BSCI" }, { name: "ISO9001" },
    { name: "GRS" }, { name: "OEKO-TEX" },
  ]}},
  { field_name: "描述",     type: TYPE.TEXT },
  { field_name: "图片",     type: TYPE.URL },
];

const LEAD_FIELDS = [
  { field_name: "公司",   type: TYPE.TEXT },
  { field_name: "姓名",   type: TYPE.TEXT },
  { field_name: "邮箱",   type: TYPE.TEXT },
  { field_name: "电话",   type: TYPE.TEXT },
  { field_name: "留言",   type: TYPE.TEXT },
  { field_name: "语言",   type: TYPE.SINGLE_SELECT, property: { options: [
    { name: "zh" }, { name: "en" }, { name: "ja" }, { name: "ko" }, { name: "es" },
  ]}},
  { field_name: "来源",   type: TYPE.SINGLE_SELECT, property: { options: [
    { name: "ai-guide" }, { name: "contact-form" }, { name: "manual" },
  ]}},
  { field_name: "时间",   type: TYPE.CREATED_TIME },
];

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────
async function ensureTable(token, appToken, name, fields) {
  const tables = await listTables(token, appToken);
  let table = tables.find((t) => t.name === name);
  let tableId;
  if (table) {
    console.log(`  · table "${name}" already exists → ${table.table_id}`);
    tableId = table.table_id;
  } else {
    tableId = await createTable(token, appToken, name);
    console.log(`  ✓ created table "${name}" → ${tableId}`);
  }
  // Add fields
  for (const field of fields) {
    try {
      await addField(token, appToken, tableId, field);
      console.log(`    · field "${field.field_name}" ready`);
    } catch (e) {
      console.warn(`    ! field "${field.field_name}" failed:`, e.message.slice(0, 150));
    }
  }
  return tableId;
}

async function main() {
  console.log("→ Authenticating with Feishu...");
  const token = await getTenantToken();
  console.log(`  ✓ tenant_access_token acquired`);

  console.log('→ Creating Bitable "LovelyJoy AI 数据"...');
  let app;
  try {
    app = await createBitable(token, "LovelyJoy AI 数据");
  } catch (e) {
    console.error("ERROR creating Bitable:", e.message);
    console.error("\n你需要在飞书开放平台为这个应用添加权限：");
    console.error("  - bitable:app          (创建多维表格)");
    console.error("  - bitable:app:readonly");
    console.error("然后重新运行本脚本。");
    process.exit(1);
  }
  console.log(`  ✓ app_token = ${app.app_token}`);
  console.log(`  · url       = ${app.url}`);

  console.log('→ Setting up "Products" table...');
  const productsTableId = await ensureTable(token, app.app_token, "Products", PRODUCT_FIELDS);

  console.log('→ Setting up "Leads" table...');
  const leadsTableId = await ensureTable(token, app.app_token, "Leads", LEAD_FIELDS);

  console.log("\n========================================================");
  console.log("✅ Done! Add these to your .env (and to Vercel project env):");
  console.log("========================================================\n");
  console.log(`LOVELYJOY_FEISHU_APP_TOKEN=${app.app_token}`);
  console.log(`LOVELYJOY_PRODUCTS_TABLE_ID=${productsTableId}`);
  console.log(`LOVELYJOY_LEADS_TABLE_ID=${leadsTableId}`);
  console.log(`\nBitable URL: ${app.url}`);
  console.log("\n打开上面的链接，去飞书里看看新建的表格是否正确。");
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
