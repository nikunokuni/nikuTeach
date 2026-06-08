import { prisma } from "./db";

// 指定IDのユーザーが「生徒」であることを確認して取得する。
// 先生のIDが渡された場合などは null を返す。
export function findStudentById(id: string) {
  return prisma.user.findFirst({ where: { id, role: "STUDENT" } });
}
