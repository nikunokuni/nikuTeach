// 応援団による資金援助プラン (仮)。実際の決済システムを後で接続する。
export type SupportPlan = {
  id: string;
  amountYen: number;
  label: string;
  description: string;
  popular?: boolean;
};

export const SUPPORT_PLANS: SupportPlan[] = [
  { id: "monthly-1000", amountYen: 1000, label: "月々 ¥1,000", description: "気軽に応援したい方に" },
  { id: "monthly-3000", amountYen: 3000, label: "月々 ¥3,000", description: "しっかり応援したい方に", popular: true },
  { id: "monthly-5000", amountYen: 5000, label: "月々 ¥5,000", description: "がっつり応援したい方に" },
];

export function findSupportPlan(id: string): SupportPlan | undefined {
  return SUPPORT_PLANS.find((p) => p.id === id);
}
