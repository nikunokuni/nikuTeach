import { fmtDate } from "@/lib/format";

type Grade = {
  id: string;
  type: string;
  subject: string;
  score: number;
  maxScore: number | null;
  examName: string;
  date: Date;
  note: string;
};

export default function GradeList({
  grades,
  onDelete,
}: {
  grades: Grade[];
  onDelete?: (formData: FormData) => void;
}) {
  const tests = grades.filter((g) => g.type === "TEST");
  const naishin = grades.filter((g) => g.type === "NAISHIN");

  const Section = ({ title, items, isTest }: { title: string; items: Grade[]; isTest: boolean }) => (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-600">{title}（{items.length}）</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">記録がありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                <th className="py-2 pr-3">日付</th>
                <th className="py-2 pr-3">教科</th>
                <th className="py-2 pr-3">{isTest ? "テスト名" : "学期等"}</th>
                <th className="py-2 pr-3 text-right">{isTest ? "点数" : "評定"}</th>
                {onDelete && <th></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((g) => (
                <tr key={g.id} className="border-b border-slate-50">
                  <td className="py-2 pr-3 text-slate-500">{fmtDate(g.date)}</td>
                  <td className="py-2 pr-3 font-medium">{g.subject}</td>
                  <td className="py-2 pr-3 text-slate-500">{g.examName || "—"}{g.note ? ` / ${g.note}` : ""}</td>
                  <td className="py-2 pr-3 text-right font-bold text-slate-800">
                    {g.score}{isTest && g.maxScore ? <span className="text-xs font-normal text-slate-400">/{g.maxScore}</span> : ""}
                  </td>
                  {onDelete && (
                    <td className="py-2 text-right">
                      <form action={onDelete}>
                        <input type="hidden" name="id" value={g.id} />
                        <button type="submit" className="text-xs text-slate-400 hover:text-rose-600">削除</button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Section title="テストの点数" items={tests} isTest={true} />
      <Section title="内申点" items={naishin} isTest={false} />
    </div>
  );
}
