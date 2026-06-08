import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("TEACHER");
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const text = String(body?.body || "").trim();
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  const note = await prisma.studentNote.update({ where: { id }, data: { body: text } });
  return NextResponse.json({ note });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("TEACHER");
  if (auth.error) return auth.error;

  const { id } = await params;
  await prisma.studentNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
