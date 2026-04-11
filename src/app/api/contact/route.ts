import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Message is too short" }, { status: 400 });
    }
    if (message.length > 5000 || name.length > 200 || email.length > 200) {
      return NextResponse.json({ error: "Field too long" }, { status: 400 });
    }

    // Rate limit: 5 contact submissions per hour per IP
    const limit = await rateLimit({
      action: "contact",
      identifier: getClientIp(req),
      max: 5,
      windowSeconds: 60 * 60,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a bit before sending another." },
        { status: 429 }
      );
    }

    await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
