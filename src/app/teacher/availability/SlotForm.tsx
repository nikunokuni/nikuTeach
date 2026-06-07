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
        <input id="start" name="start" type="datetime-local" className="input" required />
      </div>
      <div className="w-32">
        <label className="label" htmlFor="duration">時間</label>
        <select id="duration" name="duration" className="input" defaultValue="60">
          <option value="30">30分</option>
          <option value="45">45分</option>
          <option value="60">60分</option>
          <option value="90">90分</option>
          <option value="120">120分</option>
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "追加中..." : "枠を追加"}
      </button>
      {state?.error && <p className="w-full text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}
