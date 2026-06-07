import { prisma } from "./db";
import { generateVideoUrl } from "./video";

// 予約処理: 生徒が枠を予約する。
// 競合（他生徒が同時に予約）を防ぐため、status が OPEN の場合のみ
// 条件付き更新で BOOKED にし、成功した時だけ授業(Lesson)を生成する。
export async function bookSlot(slotId: string, studentId: string) {
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot) return { error: "枠が見つかりません" } as const;
  if (slot.status !== "OPEN") return { error: "この枠は既に埋まっています" } as const;

  // 条件付き updateMany: OPEN のときだけ更新。0件なら他の人が先に予約済み。
  const claimed = await prisma.slot.updateMany({
    where: { id: slotId, status: "OPEN" },
    data: { status: "BOOKED", studentId },
  });
  if (claimed.count === 0) {
    return { error: "この枠は既に埋まっています" } as const;
  }

  // 授業を生成（ビデオURLを自動生成）
  const lesson = await prisma.lesson.create({
    data: {
      slotId: slot.id,
      teacherId: slot.teacherId,
      studentId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      videoUrl: generateVideoUrl(slot.id),
      status: "SCHEDULED",
    },
  });
  return { lesson } as const;
}

// 予約キャンセル: 枠を OPEN に戻し、授業を削除する。
export async function cancelLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return { error: "授業が見つかりません" } as const;
  await prisma.$transaction([
    prisma.lesson.delete({ where: { id: lessonId } }),
    prisma.slot.update({
      where: { id: lesson.slotId },
      data: { status: "OPEN", studentId: null },
    }),
  ]);
  return { ok: true } as const;
}
