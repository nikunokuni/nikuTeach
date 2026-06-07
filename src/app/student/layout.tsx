import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

const NAV = [
  { href: "/student", label: "ホーム" },
  { href: "/student/book", label: "予約する" },
  { href: "/student/grades", label: "成績入力" },
  { href: "/student/chat", label: "チャット" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/teacher");
  return <AppShell user={user} nav={NAV}>{children}</AppShell>;
}
