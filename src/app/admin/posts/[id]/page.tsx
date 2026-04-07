import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditClient from "./PostEditClient";

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <PostEditClient
      post={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        niche: post.niche,
        isPremium: post.isPremium,
        status: post.status,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        updatedAt: post.updatedAt.toISOString(),
      }}
    />
  );
}
