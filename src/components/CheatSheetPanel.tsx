"use client";

import { useEffect, useState } from "react";

type Sheet = { id: string; title: string; subject: string; body: string };

export default function CheatSheetPanel({ lessonSubject }: { lessonSubject: string }) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [onlySubject, setOnlySubject] = useState(!!lessonSubject);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = onlySubject && lessonSubject ? `?subject=${encodeURIComponent(lessonSubject)}` : "";
    fetch(`/api/cheatsheets${q}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { sheets: [] }))
      .then((d) => setSheets(d.sheets ?? []))
      .finally(() => setLoading(false));
  }, [onlySubject, lessonSubject]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">事前に作ったカンペを見ながら授業を進められます。</p>
        {lessonSubject && (
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            <input type="checkbox" checked={onlySubject} onChange={(e) => setOnlySubject(e.target.checked)} />
            この科目（{lessonSubject}）のみ
          </label>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">読み込み中...</p>
      ) : sheets.length === 0 ? (
        <p className="text-sm text-slate-400">
          表示できるカンペがありません。「カンペ」ページで作成してください。
        </p>
      ) : (
        <div className="space-y-2">
          {sheets.map((cs) => {
            const open = openId === cs.id;
            return (
              <div key={cs.id} className="rounded-lg ring-1 ring-slate-200">
                <button
                  onClick={() => setOpenId(open ? null : cs.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
                >
                  <span>
                    {cs.title}
                    {cs.subject && <span className="ml-2 text-xs text-slate-400">{cs.subject}</span>}
                  </span>
                  <span className="text-slate-400">{open ? "−" : "＋"}</span>
                </button>
                {open && (
                  <pre className="whitespace-pre-wrap border-t border-slate-100 px-3 py-2 font-sans text-sm text-slate-700">
                    {cs.body}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
