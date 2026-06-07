import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "TEACHER" ? "/teacher" : "/student");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-black text-white">
            肉
          </div>
          <h1 className="text-2xl font-bold text-slate-800">nikuTeach</h1>
          <p className="mt-1 text-sm text-slate-500">オンライン家庭教師</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          初期アカウント — 先生: teacher / teacher123 ・ 生徒: student / student123
        </p>
      </div>
    </main>
  );
}
