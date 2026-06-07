import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const teacherPass = await bcrypt.hash("teacher123", 10);
  const studentPass = await bcrypt.hash("student123", 10);
  const supporterPass = await bcrypt.hash("supporter123", 10);

  const teacher = await prisma.user.upsert({
    where: { username: "teacher" },
    update: {},
    create: {
      username: "teacher",
      passwordHash: teacherPass,
      name: "先生",
      role: Role.TEACHER,
    },
  });

  const student = await prisma.user.upsert({
    where: { username: "student" },
    update: {},
    create: {
      username: "student",
      passwordHash: studentPass,
      name: "山田 太郎",
      role: Role.STUDENT,
      pointsBalance: 4,
    },
  });

  const supporter = await prisma.user.upsert({
    where: { username: "supporter" },
    update: {},
    create: {
      username: "supporter",
      passwordHash: supporterPass,
      name: "応援団 花子",
      role: Role.SUPPORTER,
    },
  });

  // 動作確認用に初期ポイントを付与
  if (student.pointsBalance < 4) {
    await prisma.user.update({ where: { id: student.id }, data: { pointsBalance: 4 } });
  }
  const hasTx = await prisma.pointTransaction.count({ where: { userId: student.id } });
  if (hasTx === 0) {
    await prisma.pointTransaction.create({
      data: { userId: student.id, amount: 4, reason: "PURCHASE", detail: "初期付与(お試し)" },
    });
  }

  // 応援団向けサンプルエピソード
  const hasEpisodes = await prisma.episode.count();
  if (hasEpisodes === 0) {
    await prisma.episode.createMany({
      data: [
        {
          authorId: student.id,
          authorRole: "STUDENT",
          title: "苦手だった数学のテストで自己ベストでした",
          body: "毎日コツコツ復習ノートを作ってきた成果が出て、前回より20点も上がりました。次は応用問題にも挑戦したいです。",
        },
        {
          authorId: teacher.id,
          authorRole: "TEACHER",
          title: "生徒が自分から質問してくれるようになりました",
          body: "最初は緊張していた生徒が、最近は授業の合間に「ここがわからない」と自分から聞いてくれるようになり、成長を感じています。",
        },
      ],
    });
  }

  console.log("Seeded:", { teacher: teacher.username, student: student.username, supporter: supporter.username });
  console.log("ログイン情報 -> 先生: teacher / teacher123 , 生徒: student / student123 , 応援団: supporter / supporter123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
