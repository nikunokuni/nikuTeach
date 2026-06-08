"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function toggleFavoriteAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "SUPPORTER") return;

  const studentId = String(formData.get("studentId") || "");
  const student = await prisma.user.findFirst({ where: { id: studentId, role: "STUDENT" } });
  if (!student) return;

  const existing = await prisma.favorite.findUnique({
    where: { supporterId_studentId: { supporterId: user.id, studentId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { supporterId: user.id, studentId } });
  }
  revalidatePath("/supporter/students");
  revalidatePath("/supporter");
}
