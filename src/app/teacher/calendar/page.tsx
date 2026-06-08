import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtTime, WEEK } from "@/lib/format";

function parseYM(ym?: string): { year: number; month: number } {
  const now = new Date();
  if (ym && /^\d{4}-\d{2}$/.test(ym)) {
    const [y, m] = ym.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ ym?: string }>;
}) {
  const user = await requireUser();
  const { ym } = await searchParams;
  const { year, month } = parseYM(ym);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId: user.id,
      status: { not: "CANCELLED" },
      startTime: { gte: monthStart, lt: monthEnd },
    },
    orderBy: { startTime: "asc" },
    include: { student: { select: { name: true } } },
  });
  const slots = await prisma.slot.findMany({
    where: { teacherId: user.id, startTime: { gte: monthStart, lt: monthEnd } },
  });

  // 日(1-31)ごとに割り当て
  const lessonsByDay = new Map<number, typeof lessons>();
  for (const l of lessons) {
    const d = l.startTime.getDate();
    if (!lessonsByDay.has(d)) lessonsByDay.set(d, []);
    lessonsByDay.get(d)!.push(l);
  }
  const slotDays = new Set(slots.map((s) => s.startTime.getDate()));

  // カレンダーグリッド (日曜始まり)
  const firstDow = monthStart.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevYM = `${month === 0 ? year - 1 : year}-${String((month === 0 ? 11 : month - 1) + 1).padStart(2, "0")}`;
  const nextYM = `${month === 11 ? year + 1 : year}-${String((month === 11 ? 0 : month + 1) + 1).padStart(2, "0")}`;
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{year}年 {month + 1}月</h1>
        <div className="flex items-center gap-2">
          <Link href={`/teacher/calendar?ym=${prevYM}`} className="btn-ghost !px-3 !py-1.5">← 前月</Link>
          <Link href="/teacher/calendar" className="btn-ghost !px-3 !py-1.5">今月</Link>
          <Link href={`/teacher/calendar?ym=${nextYM}`} className="btn-ghost !px-3 !py-1.5">翌月 →</Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-slate-200 text-sm ring-1 ring-slate-200">
        {WEEK.map((w, i) => (
          <div key={w} className={`bg-slate-50 py-2 text-center text-xs font-semibold ${i === 0 ? "text-rose-500" : i === 6 ? "text-brand-600" : "text-slate-500"}`}>
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          const dayLessons = d ? lessonsByDay.get(d) ?? [] : [];
          const hasSlot = d ? slotDays.has(d) : false;
          const isToday = isThisMonth && d === today.getDate();
          return (
            <div key={i} className={`min-h-[96px] bg-white p-1.5 ${d ? "" : "bg-slate-50"}`}>
              {d && (
                <>
                  <div className="mb-1 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white" : "text-slate-500"}`}>
                      {d}
                    </span>
                    {hasSlot && dayLessons.length === 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="授業可能枠あり" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayLessons.map((l) => (
                      <Link
                        key={l.id}
                        href={`/teacher/lessons/${l.id}`}
                        className="block truncate rounded bg-brand-50 px-1.5 py-1 text-[11px] text-brand-800 hover:bg-brand-100"
                        title={`${fmtTime(l.startTime)} ${l.subject} ${l.student.name}`}
                      >
                        {fmtTime(l.startTime)} {l.student.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> 授業可能枠あり(予約なし)</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-brand-100" /> 予約済みの授業</span>
      </div>
    </div>
  );
}
