"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createSummaryNoteAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return { error: "権限がありません" };

  const studentId = String(formData.get("studentId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title) return { error: "タイトルを入力してください" };
  if (!body) return { error: "本文を入力してください" };

  const student = await prisma.user.findFirst({ where: { id: studentId, role: "STUDENT" } });
  if (!student) return { error: "生徒が見つかりません" };

  await prisma.summaryNote.create({ data: { studentId, title, body } });
  revalidatePath(`/teacher/students/${studentId}`);
  return { ok: true };
}

export async function deleteSummaryNoteAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return;
  const id = String(formData.get("id") || "");
  const note = await prisma.summaryNote.findUnique({ where: { id } });
  if (!note) return;
  await prisma.summaryNote.delete({ where: { id } });
  revalidatePath(`/teacher/students/${note.studentId}`);
}
