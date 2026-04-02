import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, message } = body;

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

    // TODO: Integrate with Resend for email delivery
    console.log("Contact form submission:", body);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, errors: ["Invalid request body"] },
      { status: 400 },
    );
  }
}
