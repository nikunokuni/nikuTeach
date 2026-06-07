import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtRange } from "@/lib/format";
import SlotForm from "./SlotForm";
import { deleteSlotAction } from "./actions";

export default async function AvailabilityPage() {
  const user = await requireUser();
  const slots = await prisma.slot.findMany({
    where: { teacherId: user.id },
    orderBy: { startTime: "asc" },
    include: { student: true, lesson: true },
  });

  const now = Date.now();
  const upcoming = slots.filter((s) => s.endTime.getTime() >= now);
  const past = slots.filter((s) => s.endTime.getTime() < now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">予約枠の管理</h1>
        <p className="text-sm text-slate-500">授業可能な日時を登録します。生徒が予約すると自動的に「予約済み」になります。</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">新しい枠を追加</h2>
        <SlotForm />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">今後の枠 ({upcoming.length})</h2>
        {upcoming.length === 0 && <p className="text-sm text-slate-400">枠がありません。上から追加してください。</p>}
        {upcoming.map((s) => (
          <div key={s.id} className="card flex items-center justify-between !p-4">
            <div>
              <p className="font-medium">{fmtRange(s.startTime, s.endTime)}</p>
              {s.status === "BOOKED" ? (
                <p className="text-sm text-emerald-600">予約済み — {s.student?.name}</p>
              ) : (
                <p className="text-sm text-slate-400">空き</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {s.status === "BOOKED" ? (
                <>
                  <span className="badge bg-emerald-100 text-emerald-700">予約済み</span>
                  {s.lesson && (
                    <Link href={`/teacher/lessons/${s.lesson.id}`} className="btn-ghost !py-1.5">授業を開く</Link>
                  )}
                </>
              ) : (
                <>
                  <span className="badge bg-slate-100 text-slate-500">空き</span>
                  <form action={deleteSlotAction}>
                    <input type="hidden" name="slotId" value={s.id} />
                    <button type="submit" className="text-sm text-slate-400 hover:text-rose-600">削除</button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <details className="space-y-2">
          <summary className="cursor-pointer text-sm font-semibold text-slate-500">過去の枠 ({past.length})</summary>
          <div className="mt-2 space-y-2">
            {past.map((s) => (
              <div key={s.id} className="card flex items-center justify-between !p-4 opacity-70">
                <div>
                  <p className="font-medium">{fmtRange(s.startTime, s.endTime)}</p>
                  <p className="text-sm text-slate-400">{s.status === "BOOKED" ? `${s.student?.name}` : "空き(未使用)"}</p>
                </div>
                {s.lesson && (
                  <Link href={`/teacher/lessons/${s.lesson.id}`} className="btn-ghost !py-1.5">授業を開く</Link>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
