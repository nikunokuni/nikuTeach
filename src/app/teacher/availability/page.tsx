import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate, fmtTime } from "@/lib/format";
import SlotForm from "./SlotForm";
import { deleteSlotAction } from "./actions";

export default async function AvailabilityPage() {
  const user = await requireUser();
  const slots = await prisma.slot.findMany({
    where: { teacherId: user.id },
    orderBy: { startTime: "asc" },
    include: {
      lessons: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startTime: "asc" },
        include: { student: true },
      },
    },
  });

  const now = Date.now();
  const upcoming = slots.filter((s) => s.endTime.getTime() >= now);
  const past = slots.filter((s) => s.endTime.getTime() < now);

  const Window = ({ s }: { s: (typeof slots)[number] }) => {
    const bookedMin = s.lessons.reduce(
      (acc, l) => acc + (l.endTime.getTime() - l.startTime.getTime()) / 60000,
      0
    );
    const totalMin = (s.endTime.getTime() - s.startTime.getTime()) / 60000;
    const freeMin = totalMin - bookedMin;
    return (
      <div className="card !p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">
              {fmtDate(s.startTime)} {fmtTime(s.startTime)}〜{fmtTime(s.endTime)}
            </p>
            <p className="text-xs text-slate-400">
              全{totalMin}分 / 予約{bookedMin}分 / 空き{freeMin}分
            </p>
          </div>
          {s.lessons.length === 0 ? (
            <form action={deleteSlotAction}>
              <input type="hidden" name="slotId" value={s.id} />
              <button type="submit" className="text-sm text-slate-400 hover:text-rose-600">削除</button>
            </form>
          ) : (
            <span className="badge bg-emerald-100 text-emerald-700">{s.lessons.length}件予約</span>
          )}
        </div>
        {s.lessons.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {s.lessons.map((l) => (
              <Link
                key={l.id}
                href={`/teacher/lessons/${l.id}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
              >
                <span>
                  <span className="font-medium">{fmtTime(l.startTime)}〜{fmtTime(l.endTime)}</span>
                  <span className="ml-2 text-slate-500">{l.subject || "科目未設定"}・{l.student.name}</span>
                </span>
                <span className="text-brand-600">開く →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">授業可能枠の管理</h1>
        <p className="text-sm text-slate-500">
          授業できる時間帯を登録します。生徒はこの中から開始時間・長さ・科目を選んで予約します。
        </p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">新しい枠を追加</h2>
        <SlotForm />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">今後の枠 ({upcoming.length})</h2>
        {upcoming.length === 0 && (
          <p className="text-sm text-slate-400">枠がありません。上から追加してください。</p>
        )}
        {upcoming.map((s) => (
          <Window key={s.id} s={s} />
        ))}
      </div>

      {past.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-slate-500">過去の枠 ({past.length})</summary>
          <div className="mt-2 space-y-2">
            {past.map((s) => (
              <Window key={s.id} s={s} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
