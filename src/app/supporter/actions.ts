"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function toggleLikeAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "SUPPORTER") return;

  const episodeId = String(formData.get("episodeId") || "");
  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) return;

  const existing = await prisma.episodeLike.findUnique({
    where: { episodeId_supporterId: { episodeId, supporterId: user.id } },
  });
  if (existing) {
    await prisma.episodeLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.episodeLike.create({ data: { episodeId, supporterId: user.id } });
  }
  revalidatePath("/supporter");
}

export async function postCommentAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "SUPPORTER") return { error: "権限がありません" };

  const episodeId = String(formData.get("episodeId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "コメントを入力してください" };

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) return { error: "投稿が見つかりません" };

  await prisma.episodeComment.create({
    data: { episodeId, authorId: user.id, body },
  });
  revalidatePath("/supporter");
  return { ok: true };
}
