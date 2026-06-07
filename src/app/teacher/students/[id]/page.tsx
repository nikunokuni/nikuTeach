import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtRange } from "@/lib/format";
import GradeList from "@/components/GradeList";
import StudentNotes from "@/components/StudentNotes";
import SummaryNoteForm from "./SummaryNoteForm";
import { deleteSummaryNoteAction } from "./actions";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const student = await prisma.user.findFirst({
    where: { id, role: "STUDENT" },
    include: {
      grades: { orderBy: { date: "desc" } },
      lessonsAsStudent: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startTime: "desc" },
        include: { feedbacks: true },
      },
      summaryNotes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teacher/students" className="text-sm text-slate-400 hover:text-slate-600">← 生徒一覧</Link>
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-xs text-slate-400">@{student.username}・残り {student.pointsBalance}pt</p>
        </div>
        <Link href={`/teacher/chat?studentId=${student.id}`} className="btn-ghost">💬 チャット</Link>
      </div>

      <section className="card">
        <h2 className="mb-1 font-bold">生徒メモ（特徴・習熟度）</h2>
        <p className="mb-3 text-xs text-slate-400">授業中でも時間外でも追記・編集できます。生徒には表示されません。</p>
        <StudentNotes studentId={student.id} />
      </section>

      <section className="card">
        <h2 className="mb-4 font-bold">成績</h2>
        <GradeList grades={student.grades} />
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">まとめノート（生徒に公開）</h2>
          <SummaryNoteForm studentId={student.id} />
        </div>
        {student.summaryNotes.length === 0 ? (
          <p className="text-sm text-slate-400">まだノートを投稿していません。</p>
        ) : (
          <div className="space-y-2">
            {student.summaryNotes.map((n) => (
              <div key={n.id} className="rounded-lg bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-semibold">{n.title}</h3>
                  <form action={deleteSummaryNoteAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="text-xs text-slate-400 hover:text-rose-600">削除</button>
                  </form>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{n.body}</pre>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold">授業履歴（{student.lessonsAsStudent.length}）</h2>
        {student.lessonsAsStudent.length === 0 ? (
          <p className="text-sm text-slate-400">まだ授業はありません。</p>
        ) : (
          <div className="space-y-2">
            {student.lessonsAsStudent.map((l) => (
              <Link key={l.id} href={`/teacher/lessons/${l.id}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100">
                <span>{fmtRange(l.startTime, l.endTime)}<span className="ml-2 text-slate-400">{l.subject}</span></span>
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
