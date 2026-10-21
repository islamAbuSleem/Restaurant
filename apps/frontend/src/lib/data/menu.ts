import { cookies } from "next/headers";
import { safeApiFetch } from "../api";
import type { Category, MenuItem } from "@restaurant/shared";

export async function getCategories(): Promise<Category[]> {
  const cookieStore = await cookies();
  const data = await safeApiFetch<Category[]>("/menu/categories", {
    cookieHeader: cookieStore.toString(),
  });
  return data ?? [];
}

export async function getMenuItems(options?: {
  category?: string;
  includeUnavailable?: boolean;
}): Promise<MenuItem[]> {
  const cookieStore = await cookies();
  const params = new URLSearchParams();
  if (options?.category) {
    params.set("category", options.category);
  }
  if (options?.includeUnavailable) {
    params.set("includeUnavailable", "true");
  }
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const data = await safeApiFetch<MenuItem[]>(`/menu/items${query}`, {
    cookieHeader: cookieStore.toString(),
  });
  return data ?? [];
}

export async function getMenuItem(slug: string): Promise<MenuItem | null> {
  const cookieStore = await cookies();
  return safeApiFetch<MenuItem>(`/menu/items/${slug}`, {
    cookieHeader: cookieStore.toString(),
  });
}
