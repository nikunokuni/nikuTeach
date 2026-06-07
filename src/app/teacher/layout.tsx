import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

const NAV = [
  { href: "/teacher", label: "ホーム" },
  { href: "/teacher/availability", label: "予約枠" },
  { href: "/teacher/students", label: "生徒・成績" },
  { href: "/teacher/chat", label: "チャット" },
];

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "TEACHER") redirect("/student");
  return <AppShell user={user} nav={NAV}>{children}</AppShell>;
}
