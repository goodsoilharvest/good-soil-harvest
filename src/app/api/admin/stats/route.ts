import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Machine-to-machine endpoint — uses AGENT_API_SECRET bearer token (same as /api/agent)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.AGENT_API_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [users, postCounts, draftCounts, totalViews, totalLikes, aiLogs, imageCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        subscription: {
          select: { status: true, plan: true, currentPeriodEnd: true, trialEnd: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.agentDraft.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.postView.count(),
    prisma.postLike.count(),
    prisma.aiSearchLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true, inputTokens: true, outputTokens: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count({ where: { featuredImage: { not: null } } }),
  ]);

  // Haiku 4.5 pricing: $0.80/M input, $4.00/M output
  const totalInput = aiLogs.reduce((s, l) => s + l.inputTokens, 0);
  const totalOutput = aiLogs.reduce((s, l) => s + l.outputTokens, 0);
  const estimatedCostUsd = parseFloat(
    (totalInput * 0.0000008 + totalOutput * 0.000004).toFixed(6)
  );

  // Image generation pricing: Together AI $0.0027/image + Claude Haiku ~$0.0001/prompt
  const imageCostPerUnit = 0.0028;
  const imageCostEst = parseFloat((imageCount * imageCostPerUnit).toFixed(4));

  return NextResponse.json({
    users,
    posts: Object.fromEntries(postCounts.map((r) => [r.status, r._count.id])),
    drafts: Object.fromEntries(draftCounts.map((r) => [r.status, r._count.id])),
    engagement: { totalViews, totalLikes },
    aiSearch: {
      calls30d: aiLogs.length,
      inputTokens30d: totalInput,
      outputTokens30d: totalOutput,
      estimatedCostUsd,
      recent: aiLogs.slice(0, 25),
    },
    images: {
      totalGenerated: imageCount,
      costPerImage: imageCostPerUnit,
      estimatedCostUsd: imageCostEst,
    },
    generatedAt: new Date().toISOString(),
  });
}
