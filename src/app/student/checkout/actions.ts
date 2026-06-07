"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { creditPoints } from "@/lib/points";
import { findPack } from "@/lib/packs";

// 【決済完了の受け取り】
// 本番では決済プロバイダ(Stripe等)のWebhook/リダイレクトで決済成功を受け取り、
// ここでポイントを付与する。今は決済システム未接続のため、
// 「決済を完了する」ボタンからこのアクションを呼んで擬似的に付与する。
export async function completePaymentAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "STUDENT") return;
  const packId = String(formData.get("pack") || "");
  const pack = findPack(packId);
  if (!pack) redirect("/student/points");

  // TODO: 実際の決済では、ここで決済セッションIDの検証・二重付与防止を行う
  await creditPoints(user.id, pack.points, "PURCHASE", `${pack.label} 購入`);

  revalidatePath("/student/points");
  revalidatePath("/student/book");
  redirect("/student/points?purchased=1");
}
