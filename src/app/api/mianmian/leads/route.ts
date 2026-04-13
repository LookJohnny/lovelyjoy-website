/**
 * POST /api/mianmian/leads
 *
 * 收集顾客手机号留资。
 */
import { NextResponse } from "next/server";
import { writeLeadToFeishu } from "@/lib/mianmian/feishu";

export const runtime = "nodejs";

interface LeadBody {
  phone?: string;
  note?: string;
}

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = (body.phone ?? "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "请输入正确的手机号" },
      { status: 400 },
    );
  }

  const feishu = await writeLeadToFeishu({
    phone,
    note: body.note ?? "",
  });

  return NextResponse.json({ ok: feishu.ok, feishu });
}
