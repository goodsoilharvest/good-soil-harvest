import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import DraftReviewClient from "./DraftReviewClient";
import { prisma } from "@/lib/prisma";

export default async function DraftReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const draft = await prisma.agentDraft.findUnique({ where: { id } });
  if (!draft) notFound();

  return (
    <DraftReviewClient
      draft={{
        id: draft.id,
        title: draft.title,
        description: draft.description,
        content: draft.content,
        niche: draft.niche,
        isPremium: draft.isPremium,
        agentName: draft.agentName,
        notes: draft.notes,
        status: draft.status,
        createdAt: draft.createdAt.toISOString(),
      }}
      adminEmail={session?.user?.email ?? ""}
    />
  );
}
