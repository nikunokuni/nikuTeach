// 予約・カンペ・成績で使う科目の選択肢
export const SUBJECTS = [
  "国語",
  "数学",
  "英語",
  "理科",
  "社会",
  "物理",
  "化学",
  "生物",
  "地理",
  "歴史",
  "現代文",
  "古文",
  "その他",
] as const;

export type Subject = (typeof SUBJECTS)[number];

// 1ポイント = 30分
export const MINUTES_PER_POINT = 30;

// 予約可能な授業の長さ(分)の選択肢
export const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180];

export function minutesToPoints(minutes: number): number {
  return Math.ceil(minutes / MINUTES_PER_POINT);
}
