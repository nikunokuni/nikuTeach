import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";
import { isLessonParticipant } from "@/lib/lessonAccess";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const { id } = await params;
  const image = await prisma.problemImage.findUnique({
    where: { id },
    include: { lesson: true },
  });
  if (!image) return NextResponse.json({ error: "not found" }, { status: 404 });
  // 授業の参加者（先生 or 生徒）ならどちらでも削除可能
  if (!isLessonParticipant(image.lesson, user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await prisma.problemImage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
