import { prisma } from "@/lib/db";
import { fmtRange } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";
import { isLessonParticipant } from "@/lib/lessonAccess";
import ProblemBoard from "./ProblemBoard";
import FeedbackForm from "./FeedbackForm";
import CheatSheetPanel from "./CheatSheetPanel";
import StudentNotes from "./StudentNotes";
import { cancelLessonAction } from "@/lib/lessonActions";

function Stars({ n }: { n: number | null }) {
  if (!n) return null;
  return <span className="text-amber-500">{"★".repeat(n)}<span className="text-slate-300">{"★".repeat(5 - n)}</span></span>;
}

export default async function LessonRoom({
  lessonId,
  user,
}: {
  lessonId: string;
  user: SessionUser;
}) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      teacher: true,
      student: true,
      feedbacks: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!lesson || !isLessonParticipant(lesson, user.id)) {
    return <p className="text-sm text-rose-600">この授業にアクセスできません。</p>;
  }

  const isTeacher = user.role === "TEACHER";
  const past = lesson.endTime.getTime() < Date.now();
  const cancelled = lesson.status === "CANCELLED";
  const partnerName = isTeacher ? lesson.student.name : lesson.teacher.name;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">{isTeacher ? "生徒" : "先生"}</p>
            <h1 className="text-xl font-bold">
              {partnerName} さんとの授業
              {lesson.subject && <span className="ml-2 badge bg-brand-100 text-brand-700 align-middle">{lesson.subject}</span>}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {fmtRange(lesson.startTime, lesson.endTime)}・{lesson.pointsCost}pt
              {cancelled && <span className="ml-2 text-rose-500">（キャンセル済み）</span>}
            </p>
          </div>
          {!cancelled && (
            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              🎥 ビデオ通話に参加
            </a>
          )}
        </div>
        {!cancelled && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            ビデオURL（自動生成）: <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline break-all">{lesson.videoUrl}</a>
          </div>
        )}
        {!cancelled && !past && (
          <form action={cancelLessonAction} className="mt-3">
            <input type="hidden" name="lessonId" value={lesson.id} />
            <button type="submit" className="text-sm text-slate-400 hover:text-rose-600">
              この予約をキャンセルする（ポイントは返却されます）
            </button>
          </form>
        )}
      </div>

      {cancelled ? (
        <div className="card text-center text-sm text-slate-400">この授業はキャンセルされました。</div>
      ) : (
        <>
          {/* 先生専用: 授業カンペ */}
          {isTeacher && (
            <section className="card">
              <h2 className="mb-3 font-bold">授業カンペ（先生のみ）</h2>
              <CheatSheetPanel lessonSubject={lesson.subject} />
            </section>
          )}

          <section className="card">
            <h2 className="mb-3 font-bold">問題画像の共有</h2>
            <ProblemBoard lessonId={lesson.id} />
          </section>

          {/* 先生専用: 生徒メモ */}
          {isTeacher && (
            <section className="card">
              <h2 className="mb-1 font-bold">生徒メモ（先生のみ）</h2>
              <p className="mb-3 text-xs text-slate-400">授業中に気づいたことをその場で記録できます。</p>
              <StudentNotes studentId={lesson.studentId} />
            </section>
          )}

          <section className="card">
            <h2 className="font-bold">授業後フィードバック</h2>
            <p className="mb-4 text-sm text-slate-500">先生・生徒の双方から送れます。{past ? "" : "（授業終了後の記入がおすすめです）"}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-600">フィードバックを書く</h3>
                <FeedbackForm lessonId={lesson.id} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-600">これまでのフィードバック</h3>
                {lesson.feedbacks.length === 0 ? (
                  <p className="text-sm text-slate-400">まだフィードバックはありません。</p>
                ) : (
                  <ul className="space-y-2">
                    {lesson.feedbacks.map((f) => (
                      <li key={f.id} className="rounded-lg bg-slate-50 p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">
                            {f.author.name}（{f.authorRole === "TEACHER" ? "先生" : "生徒"}）
                          </span>
                          <Stars n={f.rating} />
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">{f.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
