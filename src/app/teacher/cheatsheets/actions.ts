"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function saveCheatSheetAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return { error: "権限がありません" };

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title) return { error: "タイトルを入力してください" };
  if (!body) return { error: "本文を入力してください" };

  if (id) {
    const existing = await prisma.cheatSheet.findUnique({ where: { id } });
    if (!existing || existing.teacherId !== user.id) return { error: "編集できません" };
    await prisma.cheatSheet.update({ where: { id }, data: { title, subject, body } });
  } else {
    await prisma.cheatSheet.create({
      data: { teacherId: user.id, title, subject, body },
    });
  }
  revalidatePath("/teacher/cheatsheets");
  return { ok: true };
}

export async function deleteCheatSheetAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return;
  const id = String(formData.get("id") || "");
  const cs = await prisma.cheatSheet.findUnique({ where: { id } });
  if (!cs || cs.teacherId !== user.id) return;
  await prisma.cheatSheet.delete({ where: { id } });
  revalidatePath("/teacher/cheatsheets");
}
