"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Reservation, ReservationStatus } from "@restaurant/shared";
import { formatRestaurantDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateReservationStatusAction } from "@/lib/actions/reservations";

const STATUS_VARIANTS: Record<ReservationStatus, "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "warning",
  confirmed: "success",
  seated: "outline",
  cancelled: "destructive",
};

const ACTIONS: Partial<Record<ReservationStatus, { label: string; status: ReservationStatus }[]>> = {
  pending: [
    { label: "Confirm", status: "confirmed" },
    { label: "Cancel", status: "cancelled" },
  ],
  confirmed: [
    { label: "Seat", status: "seated" },
    { label: "Cancel", status: "cancelled" },
  ],
  seated: [{ label: "Cancel", status: "cancelled" }],
  cancelled: [],
};

export function ReservationRow({
  reservation,
  timeZone,
}: {
  reservation: Reservation;
  timeZone: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<ReservationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = ACTIONS[reservation.status] ?? [];

  async function apply(status: ReservationStatus): Promise<void> {
    setPending(status);
    setError(null);

    const formData = new FormData();
    formData.set("reservationId", reservation.id);
    formData.set("status", status);

    const result = await updateReservationStatusAction(formData);
    setPending(null);

    if (!result.ok) {
      setError(result.error ?? "We couldn't update that reservation. Try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANTS[reservation.status]}>{reservation.status}</Badge>
          <span className="text-sm font-medium">{reservation.name}</span>
          <span className="text-xs text-muted-foreground">{reservation.partySize} guests</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{formatRestaurantDate(reservation.reservedFor, timeZone)}</p>
        <p className="text-xs text-muted-foreground">
          {reservation.email} · {reservation.phone}
        </p>
        {reservation.notes ? (
          <p className="mt-1 text-xs italic text-muted-foreground">{reservation.notes}</p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      {actions.length > 0 ? (
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              type="button"
              size="sm"
              variant={action.status === "cancelled" ? "outline" : "default"}
              onClick={() => void apply(action.status)}
              disabled={pending !== null}
            >
              {pending === action.status ? "Working…" : action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
