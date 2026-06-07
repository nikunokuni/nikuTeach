"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createStudentAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TEACHER") return { error: "権限がありません" };

  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name || !username || !password) return { error: "すべて入力してください" };
  if (password.length < 6) return { error: "パスワードは6文字以上にしてください" };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { error: "ユーザー名は半角英数字と_のみ使えます" };

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "このユーザー名は既に使われています" };

  await prisma.user.create({
    data: {
      name,
      username,
      role: "STUDENT",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  revalidatePath("/teacher/students");
  return { ok: true };
}
