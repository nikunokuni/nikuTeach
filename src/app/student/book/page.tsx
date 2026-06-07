import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate, fmtTime } from "@/lib/format";
import { bookSlotAction } from "./actions";

export default async function BookPage() {
  await requireUser();
  // 空き枠のみ表示。他の生徒が予約した枠(BOOKED)は表示されない＝自動的に埋まる挙動
  const slots = await prisma.slot.findMany({
    where: { status: "OPEN", startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    include: { teacher: true },
  });

  // 日付ごとにグルーピング
  const groups = new Map<string, typeof slots>();
  for (const s of slots) {
    const key = fmtDate(s.startTime);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">授業を予約する</h1>
        <p className="text-sm text-slate-500">先生の空いている時間から選んでください。予約するとビデオ通話URLが自動で発行されます。</p>
      </div>

      {slots.length === 0 && (
        <div className="card text-center text-sm text-slate-400">
          現在予約できる枠がありません。先生が枠を追加するまでお待ちください。
        </div>
      )}

      {[...groups.entries()].map(([date, daySlots]) => (
        <div key={date} className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">{date}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {daySlots.map((s) => (
              <form key={s.id} action={bookSlotAction}>
                <input type="hidden" name="slotId" value={s.id} />
                <button
                  type="submit"
                  className="card flex w-full flex-col items-start gap-1 !p-3 text-left transition hover:ring-2 hover:ring-brand-300"
                >
                  <span className="text-base font-bold text-slate-800">
                    {fmtTime(s.startTime)}〜{fmtTime(s.endTime)}
                  </span>
                  <span className="text-xs text-slate-400">{s.teacher.name}・予約する</span>
                </button>
              </form>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
