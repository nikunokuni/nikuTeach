import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { creditPoints } from "@/lib/points";
import { findPack } from "@/lib/packs";

// 【決済プロバイダからの通知を受け取る場所】
// 後で実際の決済システム(Stripe等)を接続する際、決済完了Webhookをここで受ける。
// 本番では必ず署名検証を行い、決済イベントIDで二重付与を防ぐこと。
//
// 期待するペイロード例:
//   { "userId": "...", "packId": "standard", "providerEventId": "evt_xxx" }
export async function POST(req: Request) {
  // TODO: 決済プロバイダの署名ヘッダを検証する
  //   const sig = req.headers.get("stripe-signature");
  //   verifyWebhookSignature(rawBody, sig, process.env.PAYMENT_WEBHOOK_SECRET);

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const packId = body?.packId as string | undefined;
  if (!userId || !packId) {
    return NextResponse.json({ error: "userId と packId が必要です" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const pack = findPack(packId);
  if (!user || !pack) {
    return NextResponse.json({ error: "ユーザーまたはパックが不正です" }, { status: 404 });
  }

  // TODO: providerEventId で冪等性を担保 (同じ決済で複数回付与しない)
  await creditPoints(userId, pack.points, "PURCHASE", `${pack.label} (Webhook)`);

  return NextResponse.json({ ok: true, granted: pack.points });
}
