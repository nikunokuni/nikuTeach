// 予約ポイントの購入パック (1pt = 30分)。
// 価格は仮設定。実際の決済システムを後で接続する。
export type Pack = {
  id: string;
  points: number;
  priceYen: number;
  label: string;
  popular?: boolean;
};

export const PACKS: Pack[] = [
  { id: "trial", points: 1, priceYen: 3000, label: "お試し (30分)" },
  { id: "standard", points: 4, priceYen: 11000, label: "スタンダード (2時間)", popular: true },
  { id: "value", points: 10, priceYen: 25000, label: "バリュー (5時間)" },
];

export function findPack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}
