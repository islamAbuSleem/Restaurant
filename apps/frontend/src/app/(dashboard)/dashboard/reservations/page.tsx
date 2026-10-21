import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { getReservations } from "@/lib/data/dashboard";
import { getRestaurant } from "@/lib/data/restaurant";
import { ReservationRow } from "@/components/dashboard/reservation-row";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Reservations" };

export default async function DashboardReservationsPage() {
  const [reservations, restaurant] = await Promise.all([getReservations(), getRestaurant()]);
  const timeZone = restaurant?.timezone ?? "UTC";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Front of house"
        title="Reservations"
        description="Confirm, seat, or cancel requests as the book fills up."
      />
      {reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" aria-hidden="true" />}
          title="No reservations yet"
          description="Requests from the public site will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {reservations.map((reservation) => (
            <ReservationRow key={reservation.id} reservation={reservation} timeZone={timeZone} />
          ))}
        </div>
      )}
    </div>
  );
}
