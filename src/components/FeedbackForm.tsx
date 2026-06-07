"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitFeedbackAction } from "@/lib/lessonActions";

export default function FeedbackForm({ lessonId }: { lessonId: string }) {
  const [state, action, pending] = useActionState(
    submitFeedbackAction,
    null as { error?: string; ok?: boolean } | null
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      <div>
        <label className="label">評価（任意）</label>
        <select name="rating" className="input" defaultValue="">
          <option value="">評価なし</option>
          <option value="5">★★★★★ とても良い</option>
          <option value="4">★★★★ 良い</option>
          <option value="3">★★★ 普通</option>
          <option value="2">★★ いまひとつ</option>
          <option value="1">★ 改善が必要</option>
        </select>
      </div>
      <div>
        <label className="label">フィードバック</label>
        <textarea name="body" rows={3} className="input" placeholder="授業の感想・気づいた点などを記入" required />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "送信中..." : "フィードバックを送る"}
      </button>
    </form>
  );
}
