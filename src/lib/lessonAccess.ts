// 授業の参加者(先生 or 生徒本人)かどうかを判定する。
// 画像/フィードバック/授業ページなど複数箇所のアクセス制御で共通利用する。
export function isLessonParticipant(
  lesson: { teacherId: string; studentId: string },
  userId: string
): boolean {
  return lesson.teacherId === userId || lesson.studentId === userId;
}
