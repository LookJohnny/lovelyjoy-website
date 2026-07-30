import { NextResponse } from "next/server";
import { Resend } from "resend";

function cleanText(value: unknown, maxLength = 500): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 254);
    const phone = cleanText(body.phone, 80);
    const company = cleanText(body.company, 160);
    const subject = cleanText(body.subject, 80);
    const message = cleanText(body.message, 5_000);
    const attribution = {
      source: cleanText(body.attribution?.source, 100) || "unknown",
      medium: cleanText(body.attribution?.medium, 100),
      campaign: cleanText(body.attribution?.campaign, 150),
      landingPath: cleanText(body.attribution?.landingPath, 300),
      referrer: cleanText(body.attribution?.referrer, 500),
      capturedAt: cleanText(body.attribution?.capturedAt, 40),
    };

    // Validate required fields
    const errors: string[] = [];
    if (!name) {
      errors.push("Name is required");
    }
    if (!email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email format");
    }
    if (!message) {
      errors.push("Message is required");
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "LovelyJoy Website <onboarding@resend.dev>",
      to: ["info@lovelyjoytoy.com"],
      replyTo: email,
      subject: `[网站询盘][${attribution.source}] 来自 ${name}`,
      html: `
        <h2>新客户询盘</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">姓名</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">邮箱</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(email)}</td></tr>
          ${phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">电话</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(phone)}</td></tr>` : ""}
          ${company ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">公司</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(company)}</td></tr>` : ""}
          ${subject ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">询盘类型</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(subject)}</td></tr>` : ""}
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">留言</td><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap">${escapeHtml(message)}</td></tr>
        </table>
        <h3>首次来源归因</h3>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">来源</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(attribution.source)}</td></tr>
          ${attribution.medium ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">媒介</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(attribution.medium)}</td></tr>` : ""}
          ${attribution.campaign ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">活动</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(attribution.campaign)}</td></tr>` : ""}
          ${attribution.landingPath ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">首次落地页</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(attribution.landingPath)}</td></tr>` : ""}
          ${attribution.referrer ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">引荐网址</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(attribution.referrer)}</td></tr>` : ""}
          ${attribution.capturedAt ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">记录时间</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(attribution.capturedAt)}</td></tr>` : ""}
        </table>
      `,
    });

    if (error) {
      return NextResponse.json(
        { success: false, errors: [error.message] },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch {
    return NextResponse.json(
      { success: false, errors: ["Failed to send message"] },
      { status: 500 },
    );
  }
}
