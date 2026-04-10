import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["BUG", "FEATURE", "COMMENT", "QUESTION"] as const;
type FeedbackType = (typeof VALID_TYPES)[number];

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { message, type, pageUrl } = body as {
    message?: string;
    type?: string;
    pageUrl?: string;
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message too long (max 4000 chars)" }, { status: 400 });
  }

  const feedbackType: FeedbackType =
    type && VALID_TYPES.includes(type as FeedbackType) ? (type as FeedbackType) : "COMMENT";

  await prisma.feedback.create({
    data: {
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      message: message.trim(),
      type: feedbackType,
      pageUrl: pageUrl?.slice(0, 500) ?? null,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
