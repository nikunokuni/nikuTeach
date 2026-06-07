"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addGradeAction } from "./actions";

export default function GradeForm() {
  const [state, action, pending] = useActionState(
    addGradeAction,
    null as { error?: string; ok?: boolean } | null
  );
  const [type, setType] = useState("TEST");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      ref.current?.reset();
      setType("TEST");
    }
  }, [state]);

  const isTest = type === "TEST";
  return (
    <form ref={ref} action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">種類</label>
          <select name="type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="TEST">テストの点数</option>
            <option value="NAISHIN">内申点</option>
          </select>
        </div>
        <div>
          <label className="label">教科</label>
          <input name="subject" className="input" placeholder="数学" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">{isTest ? "点数" : "評定 (例: 4)"}</label>
          <input name="score" type="number" step="any" className="input" required />
        </div>
        <div>
          <label className="label">{isTest ? "満点 (任意)" : "（不要）"}</label>
          <input name="maxScore" type="number" step="any" className="input" placeholder={isTest ? "100" : ""} disabled={!isTest} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">{isTest ? "テスト名 (任意)" : "学期等 (任意)"}</label>
          <input name="examName" className="input" placeholder={isTest ? "1学期中間" : "1学期"} />
        </div>
        <div>
          <label className="label">日付</label>
          <input name="date" type="date" className="input" required />
        </div>
      </div>
      <div>
        <label className="label">メモ (任意)</label>
        <input name="note" className="input" placeholder="平均点など" />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "保存中..." : "成績を記録する"}
      </button>
    </form>
  );
}
