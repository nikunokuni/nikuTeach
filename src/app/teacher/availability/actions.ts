"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createSlotAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return { error: "権限がありません" };

  const startStr = String(formData.get("start") || "");
  const endStr = String(formData.get("end") || "");
  if (!startStr || !endStr) return { error: "開始・終了日時を入力してください" };

  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { error: "日時が正しくありません" };
  if (start.getTime() < Date.now()) return { error: "過去の日時は登録できません" };
  if (end <= start) return { error: "終了は開始より後にしてください" };
  if ((end.getTime() - start.getTime()) % (30 * 60 * 1000) !== 0) {
    return { error: "枠の長さは30分単位にしてください" };
  }

  // 既存の窓と重複していないか
  const overlap = await prisma.slot.findFirst({
    where: {
      teacherId: user.id,
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });
  if (overlap) return { error: "既存の枠と時間が重複しています" };

  await prisma.slot.create({
    data: { teacherId: user.id, startTime: start, endTime: end },
  });
  revalidatePath("/teacher/availability");
  revalidatePath("/teacher/calendar");
  return { ok: true };
}

export async function deleteSlotAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return;
  const slotId = String(formData.get("slotId") || "");
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.teacherId !== user.id) return;
  // 予約済みの授業がある窓は削除できない
  const active = await prisma.lesson.count({
    where: { slotId, status: { not: "CANCELLED" } },
  });
  if (active > 0) return;
  await prisma.slot.delete({ where: { id: slotId } });
  revalidatePath("/teacher/availability");
  revalidatePath("/teacher/calendar");
}
