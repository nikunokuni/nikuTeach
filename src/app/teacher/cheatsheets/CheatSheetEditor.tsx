"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveCheatSheetAction } from "./actions";

export default function CheatSheetEditor({ subjects }: { subjects: string[] }) {
  const [state, action, pending] = useActionState(
    saveCheatSheetAction,
    null as { error?: string; ok?: boolean } | null
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      ref.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">＋ 新しいカンペを作成</button>
    );
  }

  return (
    <form ref={ref} action={action} className="card space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <div>
          <label className="label">タイトル</label>
          <input name="title" className="input" placeholder="二次関数の導入" required />
        </div>
        <div>
          <label className="label">科目</label>
          <select name="subject" className="input" defaultValue="">
            <option value="">未設定</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">本文（授業中に見る内容・手順・例題など）</label>
        <textarea name="body" rows={6} className="input" placeholder="・導入: 〜&#10;・例題1: 〜&#10;・つまずきポイント: 〜" required />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "保存中..." : "保存"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">キャンセル</button>
      </div>
    </form>
  );
}
