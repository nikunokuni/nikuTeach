import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { getCurrentUser, type SessionUser } from "./auth";

export type ApiAuthResult =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

// API route用の認証チェック。未ログインなら401、role指定時に不一致なら403を返す。
// 呼び出し側は `if (auth.error) return auth.error;` で早期returnする。
export async function requireApiUser(role?: Role): Promise<ApiAuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (role && user.role !== role) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user };
}
