import { redirect } from "next/navigation";
import { getCurrentUser, roleHomePath } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(roleHomePath(user.role));
}
