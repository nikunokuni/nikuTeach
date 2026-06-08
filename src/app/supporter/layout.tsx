import { redirect } from "next/navigation";
import { getCurrentUser, roleHomePath } from "@/lib/auth";
import AppShell from "@/components/AppShell";

const NAV = [
  { href: "/supporter", label: "ホーム" },
  { href: "/supporter/students", label: "お気に入りの生徒" },
  { href: "/supporter/support", label: "応援する" },
];

export default async function SupporterLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPPORTER") redirect(roleHomePath(user.role));
  return <AppShell user={user} nav={NAV}>{children}</AppShell>;
}
