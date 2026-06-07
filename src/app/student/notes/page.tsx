import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function StudentNotesPage() {
  const user = await requireUser();
  const notes = await prisma.summaryNote.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">まとめノート</h1>
        <p className="text-sm text-slate-500">先生が作成したまとめノートです。いつでも見返せます。</p>
      </div>

      {notes.length === 0 ? (
        <div className="card text-center text-sm text-slate-400">まだノートはありません。</div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <article key={n.id} className="card">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-bold">{n.title}</h2>
                <span className="text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{n.body}</pre>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
