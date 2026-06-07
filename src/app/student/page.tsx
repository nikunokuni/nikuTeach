import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtRange } from "@/lib/format";

export default async function StudentHome() {
  const user = await requireUser();
  const now = new Date();
  const [me, upcoming, past] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { pointsBalance: true } }),
    prisma.lesson.findMany({
      where: { studentId: user.id, status: { not: "CANCELLED" }, endTime: { gte: now } },
      orderBy: { startTime: "asc" },
      include: { teacher: true },
    }),
    prisma.lesson.findMany({
      where: { studentId: user.id, status: { not: "CANCELLED" }, endTime: { lt: now } },
      orderBy: { startTime: "desc" },
      include: { teacher: true },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">こんにちは、{user.name}</h1>
        <div className="flex items-center gap-2">
          <Link href="/student/points" className="card !px-3 !py-2 text-center">
            <p className="text-lg font-black text-brand-600">{me.pointsBalance}<span className="text-xs">pt</span></p>
          </Link>
          <Link href="/student/book" className="btn-primary">＋ 授業を予約</Link>
        </div>
      </div>

      <section className="card">
        <h2 className="mb-3 font-bold">予約中の授業</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-400">
            予約中の授業はありません。<Link href="/student/book" className="text-brand-600">予約する →</Link>
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((l) => (
              <Link key={l.id} href={`/student/lessons/${l.id}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 hover:bg-slate-100">
                <div>
                  <p className="font-medium">{l.teacher.name} 先生<span className="ml-2 text-sm font-normal text-slate-400">{l.subject}</span></p>
                  <p className="text-sm text-slate-500">{fmtRange(l.startTime, l.endTime)}</p>
                </div>
                <span className="text-brand-600">開く →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="card">
          <h2 className="mb-3 font-bold">過去の授業</h2>
          <div className="space-y-2">
            {past.map((l) => (
              <Link key={l.id} href={`/student/lessons/${l.id}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 opacity-80 hover:opacity-100">
                <p className="text-sm">{fmtRange(l.startTime, l.endTime)}<span className="ml-2 text-slate-400">{l.subject}</span></p>
                <span className="text-xs text-slate-400">フィードバックを書く →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
