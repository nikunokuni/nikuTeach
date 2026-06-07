"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
};

export default function Chat({ studentId }: { studentId?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const query = studentId ? `?studentId=${studentId}` : "";

  const load = useCallback(async () => {
    const res = await fetch(`/api/messages${query}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages);
    setMe(data.me);
  }, [query]);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, studentId }),
    });
    if (res.ok) {
      const { message } = await res.json();
      setMessages((m) => [...m, message]);
    } else {
      setText(body);
    }
    setSending(false);
  }

  return (
    <div className="flex h-[28rem] flex-col rounded-2xl bg-white ring-1 ring-slate-100">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-400">まだメッセージはありません。</p>
        )}
        {messages.map((m) => {
          const mine = m.sender.id === me;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                {!mine && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.sender.name}</p>}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary" disabled={sending || !text.trim()}>送信</button>
      </form>
    </div>
  );
}
