/**
 * POST /api/ai-guide/leads
 *
 *   { company, name, email, phone?, message?, locale, source? }
 *
 * Side effects:
 *   1. Append a row to the Feishu "Leads" table
 *   2. Email the sales team via Resend (matches the existing /api/contact pattern)
 *
 * Both side effects are best-effort: failure of one does not block the other.
 * The response includes per-channel status so the frontend can show details.
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { writeLeadToFeishu } from "@/lib/ai-guide/feishu";
import type { Locale } from "@/lib/ai-guide/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const ALLOWED: Locale[] = ["zh", "en", "ja", "ko", "es"];
const NOTIFY = process.env.LEADS_NOTIFY_EMAIL || "info@lovelyjoytoy.com";

interface LeadBody {
  company?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  locale?: string;
  source?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] as string));
}

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Validate
  const errors: string[] = [];
  const email = (body.email ?? "").trim();
  if (!email) errors.push("email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("invalid email");
  if (!body.name?.trim() && !body.company?.trim()) {
    errors.push("name or company is required");
  }
  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const localeRaw = (body.locale ?? "en").toLowerCase();
  const locale: Locale = ALLOWED.includes(localeRaw as Locale)
    ? (localeRaw as Locale)
    : "en";

  const lead = {
    company: body.company?.trim() ?? "",
    name: body.name?.trim() ?? "",
    email,
    phone: body.phone?.trim() ?? "",
    message: body.message?.trim() ?? "",
    locale,
    source: body.source ?? "ai-guide",
  };

  // ─── 1. Write to Feishu (best effort) ───
  let feishu: { ok: boolean; error?: string } = { ok: false, error: "skipped" };
  try {
    feishu = await writeLeadToFeishu(lead);
  } catch (e) {
    feishu = { ok: false, error: String(e) };
  }

  // ─── 2. Send Resend email (best effort) ───
  let mail: { ok: boolean; error?: string; id?: string } = { ok: false, error: "skipped" };
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const subject = `[AI Guide Lead · ${locale}] ${lead.company || lead.name || lead.email}`;
      const html = `
        <h2>New AI Sales Guide Lead</h2>
        <table style="border-collapse:collapse;width:100%;max-width:640px;font-family:system-ui">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Company</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(lead.company)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(lead.email)}</td></tr>
          ${lead.phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(lead.phone)}</td></tr>` : ""}
          ${lead.message ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(lead.message)}</td></tr>` : ""}
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Locale</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(lead.locale)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Source</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(lead.source)}</td></tr>
        </table>
        <p style="color:#666;font-size:12px;margin-top:16px">已自动写入飞书 LovelyJoy AI 数据 → Leads 表</p>
      `;
      const { data, error } = await resend.emails.send({
        from: "LovelyJoy Website <onboarding@resend.dev>",
        to: [NOTIFY],
        subject,
        html,
      });
      if (error) {
        mail = { ok: false, error: error.message };
      } else {
        mail = { ok: true, id: data?.id };
      }
    } catch (e) {
      mail = { ok: false, error: String(e) };
    }
  } else {
    mail = { ok: false, error: "RESEND_API_KEY not set" };
  }

  // We consider the call successful if at least one channel landed.
  const ok = feishu.ok || mail.ok;
  if (!ok) {
    console.error("[ai-guide leads] BOTH channels failed", { feishu, mail });
  }
  return NextResponse.json({ ok, feishu, mail }, { status: ok ? 200 : 500 });
}
