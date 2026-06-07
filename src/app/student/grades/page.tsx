import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import GradeForm from "./GradeForm";
import GradeList from "@/components/GradeList";
import { deleteGradeAction } from "./actions";

export default async function GradesPage() {
  const user = await requireUser();
  const grades = await prisma.grade.findMany({
    where: { studentId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">成績の記録</h1>
        <p className="text-sm text-slate-500">テストの点数や内申点を入力します。先生はいつでも閲覧できます。</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-bold">新しい成績を追加</h2>
          <GradeForm />
        </div>
        <div className="card">
          <h2 className="mb-3 font-bold">記録一覧</h2>
          <GradeList grades={grades} onDelete={deleteGradeAction} />
        </div>
      </div>
    </div>
  );
}
