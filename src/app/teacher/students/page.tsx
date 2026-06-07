import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import StudentForm from "./StudentForm";

export default async function StudentsPage() {
  await requireUser();
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { grades: true, lessonsAsStudent: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">生徒・成績</h1>
        <p className="text-sm text-slate-500">生徒アカウントの作成、成績の確認ができます。</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">生徒アカウントを追加</h2>
        <StudentForm />
      </div>

      <div className="space-y-2">
        {students.map((s) => (
          <Link key={s.id} href={`/teacher/students/${s.id}`} className="card flex items-center justify-between !p-4 transition hover:ring-2 hover:ring-brand-200">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-slate-400">@{s.username}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>成績 {s._count.grades} 件</span>
              <span>授業 {s._count.lessonsAsStudent} 件</span>
              <span className="text-brand-600">詳細 →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
