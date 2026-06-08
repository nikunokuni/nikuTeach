import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { toggleFavoriteAction } from "./actions";

export default async function SupporterStudentsPage() {
  const user = await requireUser();
  const [students, favorites] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { episodes: true } } },
    }),
    prisma.favorite.findMany({ where: { supporterId: user.id } }),
  ]);
  const favoriteIds = new Set(favorites.map((f) => f.studentId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">お気に入りの生徒</h1>
        <p className="text-sm text-slate-500">
          登録すると、その生徒の投稿がホームのフィードで優先的に表示されます。
        </p>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-slate-400">生徒がまだいません。</p>
      ) : (
        <div className="space-y-2">
          {students.map((s) => {
            const isFavorite = favoriteIds.has(s.id);
            return (
              <div key={s.id} className="card flex items-center justify-between !p-4">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-slate-400">投稿 {s._count.episodes} 件</p>
                </div>
                <form action={toggleFavoriteAction}>
                  <input type="hidden" name="studentId" value={s.id} />
                  <button
                    type="submit"
                    className={`btn ${isFavorite ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`}
                  >
                    {isFavorite ? "★ お気に入り中" : "☆ お気に入りに追加"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
