import { prisma } from "@/lib/db";
import { fmtRange } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";
import ProblemBoard from "./ProblemBoard";
import FeedbackForm from "./FeedbackForm";

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

  if (!lesson || (lesson.teacherId !== user.id && lesson.studentId !== user.id)) {
    return <p className="text-sm text-rose-600">この授業にアクセスできません。</p>;
  }

  const past = lesson.endTime.getTime() < Date.now();
  const partnerName = user.role === "TEACHER" ? lesson.student.name : lesson.teacher.name;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">{user.role === "TEACHER" ? "生徒" : "先生"}</p>
            <h1 className="text-xl font-bold">{partnerName} さんとの授業</h1>
            <p className="mt-1 text-sm text-slate-500">{fmtRange(lesson.startTime, lesson.endTime)}</p>
          </div>
          <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            🎥 ビデオ通話に参加
          </a>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          ビデオURL（自動生成）: <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline break-all">{lesson.videoUrl}</a>
        </div>
      </div>

      <section className="card">
        <h2 className="mb-3 font-bold">問題画像の共有</h2>
        <ProblemBoard lessonId={lesson.id} />
      </section>

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
    </div>
  );
}
