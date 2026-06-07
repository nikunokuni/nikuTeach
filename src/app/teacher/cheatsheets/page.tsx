import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SUBJECTS } from "@/lib/subjects";
import CheatSheetEditor from "./CheatSheetEditor";
import { deleteCheatSheetAction } from "./actions";

export default async function CheatSheetsPage() {
  const user = await requireUser();
  const sheets = await prisma.cheatSheet.findMany({
    where: { teacherId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">授業カンペ</h1>
          <p className="text-sm text-slate-500">事前に作っておくと、授業中に各授業ページから参照できます。</p>
        </div>
      </div>

      <CheatSheetEditor subjects={[...SUBJECTS]} />

      {sheets.length === 0 ? (
        <p className="text-sm text-slate-400">まだカンペがありません。</p>
      ) : (
        <div className="space-y-3">
          {sheets.map((cs) => (
            <div key={cs.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{cs.title}</h3>
                  {cs.subject && <span className="badge bg-slate-100 text-slate-600">{cs.subject}</span>}
                </div>
                <form action={deleteCheatSheetAction}>
                  <input type="hidden" name="id" value={cs.id} />
                  <button type="submit" className="text-sm text-slate-400 hover:text-rose-600">削除</button>
                </form>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{cs.body}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
