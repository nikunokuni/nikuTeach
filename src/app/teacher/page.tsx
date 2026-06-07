import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtRange } from "@/lib/format";

export default async function TeacherHome() {
  const user = await requireUser();
  const now = new Date();
  const [upcoming, openSlots, studentCount, newFeedback] = await Promise.all([
    prisma.lesson.findMany({
      where: { teacherId: user.id, endTime: { gte: now } },
      orderBy: { startTime: "asc" },
      include: { student: true },
      take: 5,
    }),
    prisma.slot.count({ where: { teacherId: user.id, status: "OPEN", startTime: { gte: now } } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.feedback.findMany({
      where: { lesson: { teacherId: user.id }, authorRole: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: { author: true, lesson: true },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">こんにちは、{user.name}</h1>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/teacher/availability" className="card text-center">
          <p className="text-2xl font-black text-brand-600">{openSlots}</p>
          <p className="text-xs text-slate-500">空き枠</p>
        </Link>
        <Link href="/teacher/students" className="card text-center">
          <p className="text-2xl font-black text-emerald-600">{studentCount}</p>
          <p className="text-xs text-slate-500">生徒数</p>
        </Link>
        <div className="card text-center">
          <p className="text-2xl font-black text-amber-500">{upcoming.length}</p>
          <p className="text-xs text-slate-500">今後の授業</p>
        </div>
      </div>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">今後の授業</h2>
          <Link href="/teacher/availability" className="text-sm text-brand-600">枠を管理 →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-400">予定された授業はありません。</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((l) => (
              <Link key={l.id} href={`/teacher/lessons/${l.id}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 hover:bg-slate-100">
                <div>
                  <p className="font-medium">{l.student.name}</p>
                  <p className="text-sm text-slate-500">{fmtRange(l.startTime, l.endTime)}</p>
                </div>
                <span className="text-brand-600">開く →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {newFeedback.length > 0 && (
        <section className="card">
          <h2 className="mb-3 font-bold">生徒からの最近のフィードバック</h2>
          <ul className="space-y-2">
            {newFeedback.map((f) => (
              <li key={f.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <span className="font-semibold">{f.author.name}</span>
                <span className="text-slate-600">: {f.body}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
