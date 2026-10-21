import type { User } from "@restaurant/shared";

export function isStaff(user: User | null): boolean {
  return user?.role === "staff" || user?.role === "admin";
}

export function isDashboardPath(path: string): boolean {
  return path === "/dashboard" || path.startsWith("/dashboard/");
}

export function sanitizeNextPath(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith("/")) {
    return undefined;
  }
  if (candidate.startsWith("//") || candidate.includes("\\")) {
    return undefined;
  }
  return candidate;
}
