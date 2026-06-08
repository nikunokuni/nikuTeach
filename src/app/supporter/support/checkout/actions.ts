"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findSupportPlan } from "@/lib/supportPlans";

// 【決済完了の受け取り】
// 本番では決済プロバイダ(Stripe等)のWebhook/リダイレクトで決済成功を受け取る。
// 今は決済システム未接続のため、「支払いを完了する」ボタンから
// このアクションを呼んで擬似的に支払い完了として扱う。
export async function completeSupportPaymentAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "SUPPORTER") return;
  const planId = String(formData.get("plan") || "");
  const plan = findSupportPlan(planId);
  if (!plan) redirect("/supporter/support");

  // TODO: 実際の決済では、ここで決済セッションIDの検証・サブスクリプション登録を行う
  redirect("/supporter/support?supported=1");
}
