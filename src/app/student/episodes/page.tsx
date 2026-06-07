import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import EpisodeForm from "@/components/EpisodeForm";
import { postEpisodeAction, deleteEpisodeAction } from "./actions";

export default async function StudentEpisodesPage() {
  const user = await requireUser();
  const episodes = await prisma.episode.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">応援団へ報告</h1>
        <p className="text-sm text-slate-500">
          最近がんばっていることや勉強の状況を投稿すると、資金援助をしてくれる「応援団」の方々に届きます。
        </p>
      </div>

      <EpisodeForm action={postEpisodeAction} />

      {episodes.length === 0 ? (
        <p className="text-sm text-slate-400">まだ投稿していません。</p>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <div key={ep.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{ep.title}</h3>
                  <span className="text-xs text-slate-400">
                    {new Date(ep.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <form action={deleteEpisodeAction}>
                  <input type="hidden" name="id" value={ep.id} />
                  <button type="submit" className="text-sm text-slate-400 hover:text-rose-600">削除</button>
                </form>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{ep.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
