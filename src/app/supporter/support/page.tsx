import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SUPPORT_PLANS } from "@/lib/supportPlans";

export default async function SupporterSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ supported?: string }>;
}) {
  await requireUser();
  const { supported } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">応援する</h1>
        <p className="text-sm text-slate-500">
          毎月の支援で、先生・生徒の活動を資金面から応援できます。
        </p>
      </div>

      {supported === "1" && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          ご支援ありがとうございます！（テスト：実際の決済は準備中です）
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {SUPPORT_PLANS.map((p) => (
          <div key={p.id} className={`card flex flex-col ${p.popular ? "ring-2 ring-brand-400" : ""}`}>
            {p.popular && <span className="badge mb-2 w-fit bg-brand-100 text-brand-700">おすすめ</span>}
            <p className="font-bold">{p.label}</p>
            <p className="text-sm text-slate-500">{p.description}</p>
            <Link href={`/supporter/support/checkout?plan=${p.id}`} className="btn-primary mt-3 w-full">
              応援する
            </Link>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        ※ 決済システムは現在準備中です。実際の決済（クレジットカード等）は後日接続されます。
      </p>
    </div>
  );
}
