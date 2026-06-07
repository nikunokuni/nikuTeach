import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import type { SessionUser } from "@/lib/auth";

type NavItem = { href: string; label: string };

export default function AppShell({
  user,
  nav,
  children,
}: {
  user: SessionUser;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const isTeacher = user.role === "TEACHER";
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href={isTeacher ? "/teacher" : "/student"} className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-black text-white">肉</span>
            <span className="hidden sm:inline">nikuTeach</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className={`badge ${isTeacher ? "bg-brand-100 text-brand-700" : "bg-emerald-100 text-emerald-700"}`}>
              {isTeacher ? "先生" : "生徒"}
            </span>
            <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-sm text-slate-400 hover:text-rose-600">ログアウト</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
