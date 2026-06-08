import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findSupportPlan } from "@/lib/supportPlans";
import { completeSupportPaymentAction } from "./actions";

export default async function SupporterCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  await requireUser();
  const { plan: planId } = await searchParams;
  const plan = findSupportPlan(planId || "");
  if (!plan) redirect("/supporter/support");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/supporter/support" className="text-sm text-slate-400 hover:text-slate-600">← 戻る</Link>
        <h1 className="text-xl font-bold">お支払い</h1>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="font-bold">{plan.label}</p>
            <p className="text-sm text-slate-500">{plan.description}</p>
          </div>
          <p className="text-2xl font-black">¥{plan.amountYen.toLocaleString()}<span className="text-sm font-normal text-slate-400">/月</span></p>
        </div>

        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200">
          ⚠️ 決済システムは現在準備中です。下のボタンは本番では決済画面（クレジットカード入力など）に遷移します。
          ここでは動作確認用に、押すと支払い完了として扱います。
        </div>

        {/* 本番ではここが決済プロバイダのフォーム/リダイレクトになる */}
        <form action={completeSupportPaymentAction}>
          <input type="hidden" name="plan" value={plan.id} />
          <button type="submit" className="btn-primary w-full">
            支払いを完了する（テスト）
          </button>
        </form>
        <Link href="/supporter/support" className="btn-ghost w-full">キャンセル</Link>
      </div>
    </div>
  );
}
