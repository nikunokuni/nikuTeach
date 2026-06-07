import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Chat from "@/components/Chat";

export default async function TeacherChatPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  await requireUser();
  const { studentId } = await searchParams;
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
  });
  const active = students.find((s) => s.id === studentId) ?? null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">チャット</h1>
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <aside className="space-y-1">
          {students.length === 0 && <p className="text-sm text-slate-400">生徒がいません。</p>}
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/teacher/chat?studentId=${s.id}`}
              className={`block rounded-lg px-3 py-2 text-sm ${active?.id === s.id ? "bg-brand-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-100 hover:bg-slate-50"}`}
            >
              {s.name}
            </Link>
          ))}
        </aside>
        <div>
          {active ? (
            <>
              <p className="mb-2 text-sm font-semibold text-slate-600">{active.name} さんとのチャット</p>
              <Chat studentId={active.id} />
            </>
          ) : (
            <div className="card flex h-[28rem] items-center justify-center text-sm text-slate-400">
              左から生徒を選んでください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
