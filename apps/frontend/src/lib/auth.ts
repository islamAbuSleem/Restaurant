import { cookies } from "next/headers";
import type { User } from "@restaurant/shared";
import { safeApiFetch } from "./api";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader.includes("access_token")) {
    return null;
  }
  return safeApiFetch<User>("/auth/me", { cookieHeader });
}

/** True when the visitor still holds a refresh token, so a session can be revived. */
export async function hasRefreshSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.toString().includes("refresh_token");
}
