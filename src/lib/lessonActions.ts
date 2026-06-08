"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { cancelLesson } from "@/lib/booking";
import { isLessonParticipant } from "@/lib/lessonAccess";

export async function submitFeedbackAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const lessonId = String(formData.get("lessonId") || "");
  const body = String(formData.get("body") || "").trim();
  const ratingRaw = String(formData.get("rating") || "");
  const rating = ratingRaw ? parseInt(ratingRaw, 10) : null;

  if (!body) return { error: "フィードバック内容を入力してください" };

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return { error: "授業が見つかりません" };
  if (!isLessonParticipant(lesson, user.id)) {
    return { error: "権限がありません" };
  }

  await prisma.feedback.create({
    data: {
      lessonId,
      authorId: user.id,
      authorRole: user.role,
      body,
      rating: rating && rating >= 1 && rating <= 5 ? rating : null,
    },
  });

  // 授業を完了扱いに
  if (lesson.status === "SCHEDULED" && lesson.endTime.getTime() < Date.now()) {
    await prisma.lesson.update({ where: { id: lessonId }, data: { status: "DONE" } });
  }

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { ok: true };
}

// 予約キャンセル: ポイントは生徒に返却される。先生・生徒どちらからでも可能。
export async function cancelLessonAction(formData: FormData) {
  const user = await requireUser();
  const lessonId = String(formData.get("lessonId") || "");
  await cancelLesson(lessonId, user.id);
  revalidatePath("/teacher/calendar");
  revalidatePath("/teacher/availability");
  revalidatePath("/student");
  revalidatePath("/student/book");
  redirect(user.role === "TEACHER" ? "/teacher" : "/student");
}
