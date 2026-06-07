"use client";

import { useCallback, useEffect, useState } from "react";

type Note = { id: string; body: string; createdAt: string; updatedAt: string };

export default function StudentNotes({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/students/${studentId}/notes`, { cache: "no-store" });
    if (res.ok) setNotes((await res.json()).notes);
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    const res = await fetch(`/api/students/${studentId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      setText("");
      await load();
    }
    setBusy(false);
  }

  async function saveEdit(id: string) {
    const body = editText.trim();
    if (!body) return;
    const res = await fetch(`/api/student-notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      setEditing(null);
      await load();
    }
  }

  async function remove(id: string) {
    if (!confirm("このメモを削除しますか？")) return;
    const res = await fetch(`/api/student-notes/${id}`, { method: "DELETE" });
    if (res.ok) setNotes((n) => n.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="input flex-1"
          placeholder="生徒の特徴・習熟度・気づいたことをメモ（授業中でも追記できます）"
        />
        <button onClick={add} className="btn-primary self-end" disabled={busy || !text.trim()}>追加</button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-slate-400">まだメモはありません。</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100">
              {editing === n.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="input"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(n.id)} className="btn-primary !py-1 text-xs">保存</button>
                    <button onClick={() => setEditing(null)} className="btn-ghost !py-1 text-xs">取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{n.body}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>更新: {new Date(n.updatedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="flex gap-2">
                      <button onClick={() => { setEditing(n.id); setEditText(n.body); }} className="hover:text-brand-600">編集</button>
                      <button onClick={() => remove(n.id)} className="hover:text-rose-600">削除</button>
                    </span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
