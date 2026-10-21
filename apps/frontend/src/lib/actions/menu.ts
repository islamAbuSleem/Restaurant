"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import type { ActionResult } from "./types";

function parsePrice(formData: FormData): number | null {
  const dollars = Number(formData.get("priceDollars") ?? "");
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return null;
  }
  return Math.round(dollars * 100);
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createMenuItemAction(formData: FormData): Promise<ActionResult> {
  const priceCents = parsePrice(formData);
  if (priceCents === null) {
    return { ok: false, error: "Enter a price greater than zero." };
  }

  const cookieStore = await cookies();
  try {
    await apiFetch("/menu/items", {
      method: "POST",
      cookieHeader: cookieStore.toString(),
      body: {
        categoryId: String(formData.get("categoryId") ?? ""),
        name: String(formData.get("name") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        priceCents,
        imageUrl: readOptionalString(formData, "imageUrl"),
        imageKey: readOptionalString(formData, "imageKey"),
        isAvailable: formData.get("isAvailable") === "on",
      },
    });
  } catch (error) {
    console.error("[POST /menu/items] failed", error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not create item." };
  }

  revalidatePath("/dashboard/menu");
  revalidatePath("/menu", "layout");
  revalidatePath("/");
  return { ok: true };
}

export async function updateMenuItemAction(id: string, formData: FormData): Promise<ActionResult> {
  const priceCents = parsePrice(formData);
  if (priceCents === null) {
    return { ok: false, error: "Enter a price greater than zero." };
  }

  const cookieStore = await cookies();
  try {
    await apiFetch(`/menu/items/${id}`, {
      method: "PATCH",
      cookieHeader: cookieStore.toString(),
      body: {
        categoryId: String(formData.get("categoryId") ?? ""),
        name: String(formData.get("name") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        priceCents,
        imageUrl: readOptionalString(formData, "imageUrl"),
        imageKey: readOptionalString(formData, "imageKey"),
        isAvailable: formData.get("isAvailable") === "on",
      },
    });
  } catch (error) {
    console.error("[PATCH /menu/items/:id] failed", error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not update item." };
  }

  revalidatePath("/dashboard/menu");
  revalidatePath("/menu", "layout");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteMenuItemAction(id: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  try {
    await apiFetch(`/menu/items/${id}`, {
      method: "DELETE",
      cookieHeader: cookieStore.toString(),
    });
  } catch (error) {
    console.error("[DELETE /menu/items/:id] failed", error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete item." };
  }

  revalidatePath("/dashboard/menu");
  revalidatePath("/menu", "layout");
  revalidatePath("/");
  return { ok: true };
}
