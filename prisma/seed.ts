import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const teacherPass = await bcrypt.hash("teacher123", 10);
  const studentPass = await bcrypt.hash("student123", 10);

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

  console.log("Seeded:", { teacher: teacher.username, student: student.username });
  console.log("ログイン情報 -> 先生: teacher / teacher123 , 生徒: student / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
