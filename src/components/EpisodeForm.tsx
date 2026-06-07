"use client";

import { useActionState, useEffect, useRef, useState } from "react";

type ActionState = { error?: string; ok?: boolean } | null;
type EpisodeAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export default function EpisodeForm({ action }: { action: EpisodeAction }) {
  const [state, formAction, pending] = useActionState(action, null as ActionState);
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
      <button onClick={() => setOpen(true)} className="btn-primary">＋ がんばってることを報告する</button>
    );
  }

  return (
    <form ref={ref} action={formAction} className="card space-y-3">
      <div>
        <label className="label">タイトル</label>
        <input name="title" className="input" placeholder="模試で過去最高点が出ました" required />
      </div>
      <div>
        <label className="label">エピソード（最近がんばってること・勉強の状況など）</label>
        <textarea name="body" rows={5} className="input" placeholder="例: 毎日ノートに復習をまとめて、苦手だった単元が解けるようになってきました。" required />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "投稿中..." : "応援団に投稿する"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">キャンセル</button>
      </div>
    </form>
  );
}
