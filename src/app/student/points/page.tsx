import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PACKS } from "@/lib/packs";
import { getPointsBalance } from "@/lib/points";

const REASON_LABEL: Record<string, string> = {
  PURCHASE: "購入",
  BOOKING: "予約で消費",
  REFUND: "返却",
};

export default async function PointsPage() {
  const user = await requireUser();
  const [pointsBalance, history] = await Promise.all([
    getPointsBalance(user.id),
    prisma.pointTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">予約ポイント</h1>
        <p className="text-sm text-slate-500">1ポイント = 30分の授業を予約できます。</p>
      </div>

      <div className="card flex items-center justify-between">
        <span className="text-sm text-slate-500">現在の残高</span>
        <span className="text-3xl font-black text-brand-600">{pointsBalance}<span className="text-base">pt</span></span>
      </div>

      <div>
        <h2 className="mb-2 font-bold">ポイントを購入</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PACKS.map((p) => (
            <div key={p.id} className={`card flex flex-col ${p.popular ? "ring-2 ring-brand-400" : ""}`}>
              {p.popular && <span className="badge mb-2 w-fit bg-brand-100 text-brand-700">人気</span>}
              <p className="font-bold">{p.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{p.points}<span className="text-sm">pt</span></p>
              <p className="text-sm text-slate-500">¥{p.priceYen.toLocaleString()}</p>
              <Link href={`/student/checkout?pack=${p.id}`} className="btn-primary mt-3 w-full">
                決済に進む
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          ※ 決済システムは現在準備中です。決済が完了するとポイントが付与され、授業を予約できるようになります。
        </p>
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">ポイント履歴</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">履歴はありません。</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2">
                <span>
                  <span className="font-medium">{REASON_LABEL[h.reason] ?? h.reason}</span>
                  {h.detail && <span className="ml-2 text-slate-400">{h.detail}</span>}
                </span>
                <span className={h.amount >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-slate-600"}>
                  {h.amount >= 0 ? "+" : ""}{h.amount}pt
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
