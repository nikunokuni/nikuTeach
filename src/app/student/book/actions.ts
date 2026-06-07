"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { bookLesson } from "@/lib/booking";
import { SUBJECTS } from "@/lib/subjects";

export async function bookLessonAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "STUDENT") return { error: "権限がありません" };

  const slotId = String(formData.get("slotId") || "");
  const subject = String(formData.get("subject") || "");
  const startStr = String(formData.get("start") || "");
  const duration = parseInt(String(formData.get("duration") || "0"), 10);

  if (!slotId) return { error: "予約枠を選んでください" };
  if (!subject || !SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
    return { error: "科目を選んでください" };
  }
  if (!startStr) return { error: "開始時間を選んでください" };
  const start = new Date(startStr);
  if (isNaN(start.getTime())) return { error: "開始時間が正しくありません" };
  if (!duration) return { error: "授業時間を選んでください" };

  const result = await bookLesson({
    slotId,
    studentId: user.id,
    subject,
    startTime: start,
    durationMinutes: duration,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/student/book");
  revalidatePath("/student");
  revalidatePath("/teacher/calendar");
  redirect(`/student/lessons/${result.lessonId}`);
}
