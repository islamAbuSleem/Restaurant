import { cookies } from "next/headers";
import type { Order, Reservation } from "@restaurant/shared";
import { safeApiFetch } from "../api";

export async function getOrders(): Promise<Order[]> {
  const cookieStore = await cookies();
  const data = await safeApiFetch<Order[]>("/orders", { cookieHeader: cookieStore.toString() });
  return data ?? [];
}

export async function getReservations(): Promise<Reservation[]> {
  const cookieStore = await cookies();
  const data = await safeApiFetch<Reservation[]>("/reservations", {
    cookieHeader: cookieStore.toString(),
  });
  return data ?? [];
}
