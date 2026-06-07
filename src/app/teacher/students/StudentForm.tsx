"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStudentAction } from "./actions";

export default function StudentForm() {
  const [state, action, pending] = useActionState(
    createStudentAction,
    null as { error?: string; ok?: boolean } | null
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[140px]">
        <label className="label">名前</label>
        <input name="name" className="input" placeholder="山田 花子" required />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="label">ユーザー名(ログインID)</label>
        <input name="username" className="input" placeholder="hanako" required />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="label">初期パスワード</label>
        <input name="password" className="input" placeholder="6文字以上" required />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "作成中..." : "生徒を追加"}
      </button>
      {state?.ok && <p className="w-full text-sm text-emerald-600">生徒アカウントを作成しました。</p>}
      {state?.error && <p className="w-full text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}
