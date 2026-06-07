import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 授業中にカンペを参照するためのAPI (先生専用)。科目で絞り込み可能。
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const subject = new URL(req.url).searchParams.get("subject") || undefined;
  const sheets = await prisma.cheatSheet.findMany({
    where: { teacherId: user.id, ...(subject ? { subject } : {}) },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, subject: true, body: true },
  });
  return NextResponse.json({ sheets });
}
