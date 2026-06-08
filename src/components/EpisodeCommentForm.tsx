"use client";

import { useActionState, useEffect, useRef } from "react";
import { postCommentAction } from "@/app/supporter/actions";

type ActionState = { error?: string; ok?: boolean } | null;

export default function EpisodeCommentForm({ episodeId }: { episodeId: string }) {
  const [state, action, pending] = useActionState(postCommentAction, null as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex items-start gap-2">
      <input type="hidden" name="episodeId" value={episodeId} />
      <textarea
        name="body"
        rows={1}
        className="input flex-1"
        placeholder="応援コメントを送る..."
        required
      />
      <button type="submit" className="btn-primary !px-3 !py-2" disabled={pending}>
        {pending ? "送信中..." : "送信"}
      </button>
      {state?.error && <p className="text-xs text-rose-600">{state.error}</p>}
    </form>
  );
}
