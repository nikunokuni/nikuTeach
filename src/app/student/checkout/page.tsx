import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findPack } from "@/lib/packs";
import { completePaymentAction } from "./actions";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string }>;
}) {
  await requireUser();
  const { pack: packId } = await searchParams;
  const pack = findPack(packId || "");
  if (!pack) redirect("/student/points");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/student/points" className="text-sm text-slate-400 hover:text-slate-600">← 戻る</Link>
        <h1 className="text-xl font-bold">お支払い</h1>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="font-bold">{pack.label}</p>
            <p className="text-sm text-slate-500">{pack.points} ポイント（{pack.points * 30}分）</p>
          </div>
          <p className="text-2xl font-black">¥{pack.priceYen.toLocaleString()}</p>
        </div>

        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200">
          ⚠️ 決済システムは現在準備中です。下のボタンは本番では決済画面（クレジットカード入力など）に遷移します。
          ここでは動作確認用に、押すと決済完了として扱いポイントを付与します。
        </div>

        {/* 本番ではここが決済プロバイダのフォーム/リダイレクトになる */}
        <form action={completePaymentAction}>
          <input type="hidden" name="pack" value={pack.id} />
          <button type="submit" className="btn-primary w-full">
            決済を完了する（テスト）
          </button>
        </form>
        <Link href="/student/points" className="btn-ghost w-full">キャンセル</Link>
      </div>
    </div>
  );
}
