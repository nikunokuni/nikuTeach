import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";
import { findStudentById } from "@/lib/students";

// チャットは「生徒ごとのスレッド」。
// - 生徒は自分のスレッドのみ閲覧/投稿可能
// - 先生は studentId を指定して任意の生徒スレッドを閲覧/投稿可能
async function resolveThread(user: { id: string; role: string }, studentIdParam: string | null) {
  if (user.role === "STUDENT") return user.id;
  // teacher
  if (!studentIdParam) return null;
  const student = await findStudentById(studentIdParam);
  return student ? student.id : null;
}

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const url = new URL(req.url);
  const studentId = await resolveThread(user, url.searchParams.get("studentId"));
  if (!studentId) return NextResponse.json({ error: "thread not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, role: true } } },
    take: 500,
  });
  return NextResponse.json({ messages, me: user.id });
}

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const body = await req.json().catch(() => null);
  const text = String(body?.body || "").trim();
  const studentId = await resolveThread(user, body?.studentId ?? null);
  if (!studentId) return NextResponse.json({ error: "thread not found" }, { status: 404 });
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "too long" }, { status: 400 });

  const message = await prisma.message.create({
    data: { studentId, senderId: user.id, body: text },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });
  return NextResponse.json({ message });
}
