import { prisma } from "./db";
import { generateVideoUrl } from "./video";
import { consumePointsTx } from "./points";
import { minutesToPoints, MINUTES_PER_POINT } from "./subjects";

export type BookResult =
  | { ok: true; lessonId: string }
  | { ok: false; error: string };

// 授業を予約する。
// - slot(授業可能な窓)の中に start〜end が完全に収まること
// - 同じ先生の既存授業と時間が重複しないこと（重複していたら自動的に埋まっている扱い）
// - 生徒のポイント残高が足りること (消費 = 長さ/30分)
// これらを1つのトランザクションで原子的に処理し、競合を防ぐ。
export async function bookLesson(params: {
  slotId: string;
  studentId: string;
  subject: string;
  startTime: Date;
  durationMinutes: number;
}): Promise<BookResult> {
  const { slotId, studentId, subject, startTime, durationMinutes } = params;

  if (durationMinutes <= 0 || durationMinutes % MINUTES_PER_POINT !== 0) {
    return { ok: false, error: "授業時間は30分単位で指定してください" };
  }
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  const cost = minutesToPoints(durationMinutes);

  if (startTime.getTime() < Date.now()) {
    return { ok: false, error: "過去の時間は予約できません" };
  }

  try {
    const lessonId = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({ where: { id: slotId } });
      if (!slot) throw new Error("SLOT_NOT_FOUND");

      // 窓の範囲内に収まっているか
      if (startTime < slot.startTime || endTime > slot.endTime) {
        throw new Error("OUT_OF_WINDOW");
      }

      // 同じ先生の既存授業(キャンセル以外)と重複していないか
      const overlap = await tx.lesson.findFirst({
        where: {
          teacherId: slot.teacherId,
          status: { not: "CANCELLED" },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });
      if (overlap) throw new Error("OVERLAP");

      // ポイント消費 (残高不足なら例外)
      await consumePointsTx(
        tx,
        studentId,
        cost,
        `${subject || "授業"} ${durationMinutes}分`
      );

      const lesson = await tx.lesson.create({
        data: {
          slotId: slot.id,
          teacherId: slot.teacherId,
          studentId,
          subject,
          startTime,
          endTime,
          pointsCost: cost,
          videoUrl: generateVideoUrl(slot.id),
          status: "SCHEDULED",
        },
      });
      return lesson.id;
    });

    return { ok: true, lessonId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    switch (msg) {
      case "SLOT_NOT_FOUND":
        return { ok: false, error: "予約枠が見つかりません" };
      case "OUT_OF_WINDOW":
        return { ok: false, error: "選択した時間が授業可能枠の範囲外です" };
      case "OVERLAP":
        return { ok: false, error: "この時間はすでに予約で埋まっています" };
      case "INSUFFICIENT_POINTS":
        return { ok: false, error: "予約ポイントが足りません。ポイントを購入してください" };
      default:
        return { ok: false, error: "予約に失敗しました" };
    }
  }
}

// 予約キャンセル: 授業を CANCELLED にし、消費ポイントを返却する。
export async function cancelLesson(lessonId: string, byUserId: string): Promise<BookResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.findUnique({ where: { id: lessonId } });
      if (!lesson) throw new Error("LESSON_NOT_FOUND");
      if (lesson.teacherId !== byUserId && lesson.studentId !== byUserId) {
        throw new Error("FORBIDDEN");
      }
      if (lesson.status === "CANCELLED") return;

      await tx.lesson.update({
        where: { id: lessonId },
        data: { status: "CANCELLED" },
      });
      // ポイント返却
      await tx.user.update({
        where: { id: lesson.studentId },
        data: { pointsBalance: { increment: lesson.pointsCost } },
      });
      await tx.pointTransaction.create({
        data: {
          userId: lesson.studentId,
          amount: lesson.pointsCost,
          reason: "REFUND",
          detail: "予約キャンセルによる返却",
        },
      });
    });
    return { ok: true, lessonId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "FORBIDDEN") return { ok: false, error: "権限がありません" };
    return { ok: false, error: "キャンセルに失敗しました" };
  }
}
