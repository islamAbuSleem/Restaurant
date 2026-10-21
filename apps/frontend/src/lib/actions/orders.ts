"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ORDER_STATUSES, type OrderStatus } from "@restaurant/shared";
import { apiFetch } from "@/lib/api";
import type { ActionResult } from "./types";

export async function updateOrderStatusAction(formData: FormData): Promise<ActionResult> {
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!orderId || !ORDER_STATUSES.includes(status as OrderStatus)) {
    return { ok: false, error: "That status change was not understood. Try again." };
  }

  const cookieStore = await cookies();
  try {
    await apiFetch(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status },
      cookieHeader: cookieStore.toString(),
    });
  } catch (error) {
    console.error("[PATCH /orders/:id/status] failed", error);
    return {
      ok: false,
      error: "We couldn't move that ticket. It may already be in another state — refresh and try again.",
    };
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return { ok: true };
}
