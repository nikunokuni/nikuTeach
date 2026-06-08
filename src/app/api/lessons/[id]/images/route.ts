import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";
import { isLessonParticipant } from "@/lib/lessonAccess";

async function canAccess(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || !isLessonParticipant(lesson, userId)) return null;
  return lesson;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const { id } = await params;
  if (!(await canAccess(id, user.id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const images = await prisma.problemImage.findMany({
    where: { lessonId: id },
    orderBy: { createdAt: "asc" },
    include: { uploadedBy: { select: { name: true, role: true } } },
  });
  return NextResponse.json({ images });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const { id } = await params;
  if (!(await canAccess(id, user.id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const data = body?.data as string | undefined;
  const caption = (body?.caption as string | undefined) ?? "";
  if (!data || !data.startsWith("data:image/")) {
    return NextResponse.json({ error: "画像データが不正です" }, { status: 400 });
  }
  // 約4MB上限 (base64長で判定)
  if (data.length > 4_000_000) {
    return NextResponse.json({ error: "画像が大きすぎます (4MB以下にしてください)" }, { status: 400 });
  }

  const image = await prisma.problemImage.create({
    data: { lessonId: id, data, caption, uploadedById: user.id },
    include: { uploadedBy: { select: { name: true, role: true } } },
  });
  return NextResponse.json({ image });
}
