import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

// ポイントを付与する (購入完了時など)。履歴も残す。
export async function creditPoints(
  userId: string,
  amount: number,
  reason: "PURCHASE" | "REFUND",
  detail = ""
) {
  if (amount <= 0) return;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { pointsBalance: { increment: amount } },
    }),
    prisma.pointTransaction.create({
      data: { userId, amount, reason, detail },
    }),
  ]);
}

// トランザクション内でポイントを消費する。残高不足なら例外。
export async function consumePointsTx(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  detail = ""
) {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.pointsBalance < amount) {
    throw new Error("INSUFFICIENT_POINTS");
  }
  await tx.user.update({
    where: { id: userId },
    data: { pointsBalance: { decrement: amount } },
  });
  await tx.pointTransaction.create({
    data: { userId, amount: -amount, reason: "BOOKING", detail },
  });
}
