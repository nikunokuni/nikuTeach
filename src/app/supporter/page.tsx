import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function SupporterHome() {
  const user = await requireUser();
  const episodes = await prisma.episode.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">こんにちは、{user.name}さん</h1>
          <p className="mt-1 text-sm text-slate-500">
            先生や生徒が投稿した「最近がんばってること」「勉強の状況」のエピソードです。応援の気持ちを届けてください。
          </p>
        </div>
        <Link href="/supporter/support" className="btn-primary whitespace-nowrap">＋ 応援する</Link>
      </div>

      {episodes.length === 0 ? (
        <div className="card text-center text-sm text-slate-400">まだ投稿されたエピソードはありません。</div>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <article key={ep.id} className="card">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge ${ep.authorRole === "TEACHER" ? "bg-brand-100 text-brand-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {ep.authorRole === "TEACHER" ? "先生" : "生徒"}
                  </span>
                  <span className="font-semibold">{ep.author.name}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ep.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <h2 className="mb-1 font-bold">{ep.title}</h2>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{ep.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
