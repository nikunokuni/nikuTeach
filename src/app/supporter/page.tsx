import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import EpisodeCommentForm from "@/components/EpisodeCommentForm";
import { toggleLikeAction } from "./actions";

export default async function SupporterHome() {
  const user = await requireUser();
  const [episodes, favorites] = await Promise.all([
    prisma.episode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: true,
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
      take: 50,
    }),
    prisma.favorite.findMany({ where: { supporterId: user.id } }),
  ]);
  const favoriteIds = new Set(favorites.map((f) => f.studentId));

  // お気に入り登録した生徒の投稿を優先表示(その中・それ以外はそれぞれ新着順)
  const sorted = [...episodes].sort((a, b) => {
    const aFav = favoriteIds.has(a.authorId) ? 1 : 0;
    const bFav = favoriteIds.has(b.authorId) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return b.createdAt.getTime() - a.createdAt.getTime();
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

      {sorted.length === 0 ? (
        <div className="card text-center text-sm text-slate-400">まだ投稿されたエピソードはありません。</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ep) => {
            const isFavoriteAuthor = ep.authorRole === "STUDENT" && favoriteIds.has(ep.authorId);
            const liked = ep.likes.some((l) => l.supporterId === user.id);
            return (
              <article key={ep.id} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${ep.authorRole === "TEACHER" ? "bg-brand-100 text-brand-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {ep.authorRole === "TEACHER" ? "先生" : "生徒"}
                    </span>
                    <span className="font-semibold">{ep.author.name}</span>
                    {isFavoriteAuthor && <span className="badge bg-amber-100 text-amber-700">★ お気に入り</span>}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(ep.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <h2 className="mb-1 font-bold">{ep.title}</h2>
                <p className="whitespace-pre-wrap text-sm text-slate-700">{ep.body}</p>

                <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
                  <form action={toggleLikeAction}>
                    <input type="hidden" name="episodeId" value={ep.id} />
                    <button
                      type="submit"
                      className={`btn !px-3 !py-1.5 text-sm ${liked ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
                    >
                      {liked ? "❤ いいね" : "🤍 いいね"} {ep.likes.length > 0 && <span>{ep.likes.length}</span>}
                    </button>
                  </form>
                  {ep.comments.length > 0 && (
                    <span className="text-xs text-slate-400">コメント {ep.comments.length} 件</span>
                  )}
                </div>

                {ep.comments.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {ep.comments.map((c) => (
                      <li key={c.id} className="rounded-lg bg-slate-50 p-2.5 text-sm">
                        <span className="font-semibold">{c.author.name}</span>
                        <span className="ml-2 text-slate-600">{c.body}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3">
                  <EpisodeCommentForm episodeId={ep.id} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
