"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSummaryNoteAction } from "./actions";

export default function SummaryNoteForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState(
    createSummaryNoteAction,
    null as { error?: string; ok?: boolean } | null
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) { ref.current?.reset(); setOpen(false); }
  }, [state]);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-ghost !py-1.5">＋ ノートを投稿</button>;
  }

  return (
    <form ref={ref} action={action} className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3">
      <input type="hidden" name="studentId" value={studentId} />
      <div>
        <label className="label">タイトル</label>
        <input name="title" className="input" placeholder="今日の授業のまとめ" required />
      </div>
      <div>
        <label className="label">本文</label>
        <textarea name="body" rows={5} className="input" placeholder="授業の要点・宿題・復習ポイントなど" required />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary !py-1.5" disabled={pending}>{pending ? "投稿中..." : "投稿する"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-1.5">キャンセル</button>
      </div>
    </form>
  );
}
