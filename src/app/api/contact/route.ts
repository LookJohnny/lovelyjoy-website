import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();

    const { name, email, phone, company, message } = body;

    // Validate required fields
    const errors: string[] = [];
    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push("Name is required");
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email format");
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      errors.push("Message is required");
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    await resend.emails.send({
      from: "LovelyJoy Website <onboarding@resend.dev>",
      to: ["info@lovelyjoy.com"],
      subject: `[网站询盘] 来自 ${name.trim()}`,
      html: `
        <h2>新客户询盘</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">姓名</td><td style="padding:8px;border:1px solid #ddd">${name.trim()}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">邮箱</td><td style="padding:8px;border:1px solid #ddd">${email.trim()}</td></tr>
          ${phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">电话</td><td style="padding:8px;border:1px solid #ddd">${phone.trim()}</td></tr>` : ""}
          ${company ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">公司</td><td style="padding:8px;border:1px solid #ddd">${company.trim()}</td></tr>` : ""}
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">留言</td><td style="padding:8px;border:1px solid #ddd">${message.trim()}</td></tr>
        </table>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, errors: ["Failed to send message"] },
      { status: 500 },
    );
  }
}
