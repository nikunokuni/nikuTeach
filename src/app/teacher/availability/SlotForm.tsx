"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSlotAction } from "./actions";

export default function SlotForm() {
  const [state, formAction, pending] = useActionState(
    createSlotAction,
    null as { error?: string; ok?: boolean } | null
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="label" htmlFor="start">開始日時</label>
        <input id="start" name="start" type="datetime-local" step="1800" className="input" required />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="label" htmlFor="end">終了日時</label>
        <input id="end" name="end" type="datetime-local" step="1800" className="input" required />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "追加中..." : "枠を追加"}
      </button>
      {state?.error && <p className="w-full text-sm text-rose-600">{state.error}</p>}
      <p className="w-full text-xs text-slate-400">
        この時間帯の中から、生徒が30分単位で開始時間・長さ・科目を選んで予約します。
      </p>
    </form>
  );
}
