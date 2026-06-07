"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export async function loginAction(_prev: unknown, formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !password) {
    return { error: "ユーザー名とパスワードを入力してください" };
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "ユーザー名またはパスワードが正しくありません" };
  }
  await createSession(user.id);
  redirect(user.role === "TEACHER" ? "/teacher" : "/student");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
