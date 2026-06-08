import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";

// 授業中にカンペを参照するためのAPI (先生専用)。科目で絞り込み可能。
export async function GET(req: Request) {
  const auth = await requireApiUser("TEACHER");
  if (auth.error) return auth.error;
  const user = auth.user;

  const subject = new URL(req.url).searchParams.get("subject") || undefined;
  const sheets = await prisma.cheatSheet.findMany({
    where: { teacherId: user.id, ...(subject ? { subject } : {}) },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, subject: true, body: true },
  });
  return NextResponse.json({ sheets });
}
