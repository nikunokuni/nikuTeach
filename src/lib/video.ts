import crypto from "crypto";

// 授業用ビデオチャットURLを自動生成する。
// 既定では meet.jit.si のユニークなルームURLを生成（APIキー不要・即利用可）。
// 将来 Zoom/Google Meet などに差し替える場合はこの関数だけ変更すればよい。
export function generateVideoUrl(lessonHint?: string): string {
  const base = process.env.VIDEO_BASE_URL || "https://meet.jit.si";
  const slug = (lessonHint || "lesson").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
  const token = crypto.randomBytes(6).toString("hex");
  return `${base}/nikuTeach-${slug}-${token}`;
}
