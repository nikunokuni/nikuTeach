import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";
import { findStudentById } from "@/lib/students";

// 生徒メモ (先生が生徒について書く特徴・習熟度)。先生専用。
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("TEACHER");
  if (auth.error) return auth.error;

  const { id } = await params;
  const notes = await prisma.studentNote.findMany({
    where: { studentId: id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("TEACHER");
  if (auth.error) return auth.error;

  const { id } = await params;
  const student = await findStudentById(id);
  if (!student) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const text = String(body?.body || "").trim();
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  const note = await prisma.studentNote.create({ data: { studentId: id, body: text } });
  return NextResponse.json({ note });
}
