import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtRange } from "@/lib/format";
import GradeList from "@/components/GradeList";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const student = await prisma.user.findFirst({
    where: { id, role: "STUDENT" },
    include: {
      grades: { orderBy: { date: "desc" } },
      lessonsAsStudent: { orderBy: { startTime: "desc" }, include: { feedbacks: true } },
    },
  });
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teacher/students" className="text-sm text-slate-400 hover:text-slate-600">← 生徒一覧</Link>
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-xs text-slate-400">@{student.username}</p>
        </div>
        <Link href={`/teacher/chat?studentId=${student.id}`} className="btn-ghost">💬 チャット</Link>
      </div>

      <section className="card">
        <h2 className="mb-4 font-bold">成績</h2>
        <GradeList grades={student.grades} />
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold">授業履歴（{student.lessonsAsStudent.length}）</h2>
        {student.lessonsAsStudent.length === 0 ? (
          <p className="text-sm text-slate-400">まだ授業はありません。</p>
        ) : (
          <div className="space-y-2">
            {student.lessonsAsStudent.map((l) => (
              <Link key={l.id} href={`/teacher/lessons/${l.id}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100">
                <span>{fmtRange(l.startTime, l.endTime)}</span>
                <span className="text-xs text-slate-400">
                  {l.endTime.getTime() < Date.now() ? "終了" : "予定"}・フィードバック {l.feedbacks.length}件
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
