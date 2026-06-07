"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function postEpisodeAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return { error: "権限がありません" };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title) return { error: "タイトルを入力してください" };
  if (!body) return { error: "本文を入力してください" };

  await prisma.episode.create({
    data: { authorId: user.id, authorRole: "TEACHER", title, body },
  });
  revalidatePath("/teacher/episodes");
  revalidatePath("/supporter");
  return { ok: true };
}

export async function deleteEpisodeAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return;
  const id = String(formData.get("id") || "");
  const episode = await prisma.episode.findUnique({ where: { id } });
  if (!episode || episode.authorId !== user.id) return;
  await prisma.episode.delete({ where: { id } });
  revalidatePath("/teacher/episodes");
  revalidatePath("/supporter");
}
