"use client";

import { useActionState, useMemo, useState } from "react";
import { bookLessonAction } from "./actions";
import { fmtDate, fmtTime } from "@/lib/format";

type Win = {
  id: string;
  teacherName: string;
  start: string;
  end: string;
  booked: { start: string; end: string }[];
};

const STEP = 30 * 60 * 1000;

// 指定区間が予約済みと重ならないか
function isFree(start: number, end: number, booked: { s: number; e: number }[]) {
  return !booked.some((b) => start < b.e && end > b.s);
}

export default function BookingWizard({
  windows,
  balance,
  subjects,
}: {
  windows: Win[];
  balance: number;
  subjects: string[];
}) {
  const [state, action, pending] = useActionState(
    bookLessonAction,
    null as { error?: string } | null
  );
  const [winId, setWinId] = useState("");
  const [subject, setSubject] = useState(subjects[1] ?? subjects[0]);
  const [startISO, setStartISO] = useState("");
  const [duration, setDuration] = useState(30);

  const now = Date.now();

  const win = useMemo(() => windows.find((w) => w.id === winId) || null, [windows, winId]);

  const booked = useMemo(
    () => (win ? win.booked.map((b) => ({ s: +new Date(b.start), e: +new Date(b.end) })) : []),
    [win]
  );

  // 開始可能な時刻(30分グリッド)
  const startOptions = useMemo(() => {
    if (!win) return [];
    const ws = +new Date(win.start);
    const we = +new Date(win.end);
    const opts: number[] = [];
    for (let t = ws; t + STEP <= we; t += STEP) {
      if (t < now) continue;
      if (isFree(t, t + STEP, booked)) opts.push(t);
    }
    return opts;
  }, [win, booked, now]);

  // 選択した開始時刻から取れる最大の長さ(分)
  const maxDuration = useMemo(() => {
    if (!startISO) return 0;
    const start = +new Date(startISO);
    const we = win ? +new Date(win.end) : start;
    let end = start + STEP;
    let max = 0;
    while (end <= we && isFree(start, end, booked)) {
      max += 30;
      end += STEP;
    }
    return max;
  }, [startISO, win, booked]);

  const durationOptions = useMemo(() => {
    const opts: number[] = [];
    for (let d = 30; d <= maxDuration; d += 30) opts.push(d);
    return opts;
  }, [maxDuration]);

  const cost = duration / 30;
  const enough = cost <= balance;
  const canSubmit = !!winId && !!startISO && duration > 0 && enough && !pending;

  // 窓を日付ごとにグルーピング
  const groups = useMemo(() => {
    const m = new Map<string, Win[]>();
    for (const w of windows) {
      const key = fmtDate(new Date(w.start));
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(w);
    }
    return [...m.entries()];
  }, [windows]);

  function selectWindow(id: string) {
    setWinId(id);
    setStartISO("");
    setDuration(30);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      {/* 枠の選択 */}
      <div className="space-y-4">
        {groups.map(([date, wins]) => (
          <div key={date}>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">{date}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {wins.map((w) => {
                const active = w.id === winId;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => selectWindow(w.id)}
                    className={`card flex flex-col items-start gap-0.5 !p-3 text-left transition ${active ? "ring-2 ring-brand-500" : "hover:ring-2 hover:ring-brand-200"}`}
                  >
                    <span className="text-sm font-bold text-slate-800">
                      {fmtTime(new Date(w.start))}〜{fmtTime(new Date(w.end))}
                    </span>
                    <span className="text-[11px] text-slate-400">{w.teacherName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 予約フォーム */}
      <form action={action} className="card sticky top-20 h-fit space-y-4">
        <h2 className="font-bold">予約内容</h2>
        {!win ? (
          <p className="text-sm text-slate-400">左から時間帯を選んでください。</p>
        ) : (
          <>
            <input type="hidden" name="slotId" value={win.id} />
            <input type="hidden" name="start" value={startISO} />
            <input type="hidden" name="duration" value={duration} />

            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-medium">{fmtDate(new Date(win.start))}</p>
              <p className="text-slate-500">
                枠: {fmtTime(new Date(win.start))}〜{fmtTime(new Date(win.end))}（{win.teacherName}）
              </p>
            </div>

            <div>
              <label className="label">科目</label>
              <select name="subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">開始時間</label>
              {startOptions.length === 0 ? (
                <p className="text-sm text-rose-500">この枠に空きがありません。</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {startOptions.map((t) => {
                    const iso = new Date(t).toISOString();
                    const active = iso === startISO;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setStartISO(iso); setDuration(30); }}
                        className={`rounded-lg px-2 py-1.5 text-sm ${active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                      >
                        {fmtTime(new Date(t))}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {startISO && (
              <div>
                <label className="label">授業の長さ</label>
                <select
                  className="input"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                >
                  {durationOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}分（{d / 30}pt）
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm">
              <span className="text-slate-600">消費ポイント</span>
              <span className={`font-bold ${enough ? "text-brand-700" : "text-rose-600"}`}>
                {cost}pt / 残高 {balance}pt
              </span>
            </div>

            {!enough && (
              <p className="text-sm text-rose-600">ポイントが足りません。購入してください。</p>
            )}
            {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={!canSubmit}>
              {pending ? "予約中..." : "この内容で予約する"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
