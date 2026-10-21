"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { RESERVATION_STATUSES, type ReservationStatus } from "@restaurant/shared";
import { apiFetch } from "@/lib/api";
import type { ActionResult } from "./types";

export async function updateReservationStatusAction(formData: FormData): Promise<ActionResult> {
  const reservationId = String(formData.get("reservationId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!reservationId || !RESERVATION_STATUSES.includes(status as ReservationStatus)) {
    return { ok: false, error: "That status change was not understood. Try again." };
  }

  const cookieStore = await cookies();
  try {
    await apiFetch(`/reservations/${reservationId}/status`, {
      method: "PATCH",
      body: { status },
      cookieHeader: cookieStore.toString(),
    });
  } catch (error) {
    console.error("[PATCH /reservations/:id/status] failed", error);
    return {
      ok: false,
      error: "We couldn't update that reservation. Refresh and try again.",
    };
  }

  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard");
  return { ok: true };
}
