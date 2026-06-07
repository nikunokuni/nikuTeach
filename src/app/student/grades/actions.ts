"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function addGradeAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "STUDENT") return { error: "権限がありません" };

  const type = String(formData.get("type") || "TEST");
  const subject = String(formData.get("subject") || "").trim();
  const score = parseFloat(String(formData.get("score") || ""));
  const maxScoreRaw = String(formData.get("maxScore") || "");
  const maxScore = maxScoreRaw ? parseFloat(maxScoreRaw) : null;
  const examName = String(formData.get("examName") || "").trim();
  const dateStr = String(formData.get("date") || "");
  const note = String(formData.get("note") || "").trim();

  if (!subject) return { error: "教科を入力してください" };
  if (isNaN(score)) return { error: "点数/評定を入力してください" };
  if (!dateStr) return { error: "日付を入力してください" };

  await prisma.grade.create({
    data: {
      studentId: user.id,
      type: type === "NAISHIN" ? "NAISHIN" : "TEST",
      subject,
      score,
      maxScore: maxScore && !isNaN(maxScore) ? maxScore : null,
      examName,
      date: new Date(dateStr),
      note,
    },
  });
  revalidatePath("/student/grades");
  return { ok: true };
}

export async function deleteGradeAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "STUDENT") return;
  const id = String(formData.get("id") || "");
  const grade = await prisma.grade.findUnique({ where: { id } });
  if (!grade || grade.studentId !== user.id) return;
  await prisma.grade.delete({ where: { id } });
  revalidatePath("/student/grades");
}
