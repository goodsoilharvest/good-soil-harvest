import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Subscribe to push notifications and/or update topic preferences.
// Body: { endpoint, p256dh, auth, niches?: string[], emailDigest?: boolean }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint, p256dh, auth: authKey, niches, emailDigest } = body;

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Missing push subscription fields" }, { status: 400 });
  }

  const nicheStr = Array.isArray(niches) ? niches.join(",") : "";

  // Prevent cross-user hijacking: only upsert if this endpoint belongs to
  // the current user OR doesn't exist yet. Delete any stale record first.
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: { not: session.user.id } },
  });

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh,
      auth: authKey,
      niches: nicheStr,
      emailDigest: emailDigest ?? false,
    },
    update: {
      p256dh,
      auth: authKey,
      niches: nicheStr,
      emailDigest: emailDigest ?? false,
    },
  });

  return NextResponse.json({ ok: true });
}

// Get current user's push subscriptions and preferences
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      endpoint: true,
      niches: true,
      emailDigest: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ subscriptions: subs });
}

// Unsubscribe from push notifications
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint } = await req.json();
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: { userId: session.user.id, endpoint },
  });

  return NextResponse.json({ ok: true });
}
