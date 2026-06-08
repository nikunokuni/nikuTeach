import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SUBJECTS } from "@/lib/subjects";
import { getPointsBalance } from "@/lib/points";
import BookingWizard from "./BookingWizard";

export default async function BookPage() {
  const user = await requireUser();
  const pointsBalance = await getPointsBalance(user.id);

  // 今後の授業可能枠(窓)と、その中の既存予約を取得
  const slots = await prisma.slot.findMany({
    where: { endTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    include: {
      teacher: { select: { name: true } },
      lessons: {
        where: { status: { not: "CANCELLED" } },
        select: { startTime: true, endTime: true },
      },
    },
  });

  const windows = slots.map((s) => ({
    id: s.id,
    teacherName: s.teacher.name,
    start: s.startTime.toISOString(),
    end: s.endTime.toISOString(),
    booked: s.lessons.map((l) => ({
      start: l.startTime.toISOString(),
      end: l.endTime.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">授業を予約する</h1>
          <p className="text-sm text-slate-500">
            科目・開始時間・長さ(30分単位)を選んで予約します。予約には予約ポイントを使います。
          </p>
        </div>
        <Link href="/student/points" className="card !px-4 !py-2 text-center">
          <p className="text-lg font-black text-brand-600">{pointsBalance}<span className="text-xs">pt</span></p>
          <p className="text-[10px] text-slate-400">ポイント購入 →</p>
        </Link>
      </div>

      {pointsBalance === 0 && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700 ring-1 ring-amber-200">
          予約ポイントがありません。
          <Link href="/student/points" className="font-semibold underline">ポイントを購入</Link>
          すると予約できます（1ポイント = 30分）。
        </div>
      )}

      {windows.length === 0 ? (
        <div className="card text-center text-sm text-slate-400">
          現在予約できる枠がありません。先生が枠を追加するまでお待ちください。
        </div>
      ) : (
        <BookingWizard windows={windows} balance={pointsBalance} subjects={[...SUBJECTS]} />
      )}
    </div>
  );
}
