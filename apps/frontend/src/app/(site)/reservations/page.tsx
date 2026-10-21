import type { Metadata } from "next";
import { serviceHoursRows } from "@restaurant/shared";
import { getRestaurant } from "@/lib/data/restaurant";
import { ReservationForm } from "@/components/site/reservation-form";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Book a table at Ember & Oak.",
};

export default async function ReservationsPage() {
  const restaurant = await getRestaurant();
  const hours = restaurant ? serviceHoursRows(restaurant.hours, restaurant.timezone) : [];

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-5">
        <h1 className="text-balance text-4xl leading-tight">Save your seat by the fire.</h1>
        {restaurant ? (
          <>
            <p className="text-muted-foreground">
              We hold {restaurant.seatsDiningRoom} seats in the dining room and{" "}
              {restaurant.seatsCounter} at the counter. Tell us when you&apos;re coming and
              we&apos;ll confirm by email.
            </p>
            <dl className="mt-2 flex flex-col gap-3 text-sm">
              {hours.map((row) => (
                <div
                  key={row.day}
                  className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0"
                >
                  <dt className="text-muted-foreground">{row.day}</dt>
                  <dd className="text-right font-medium">{row.time}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">Largest party</dt>
                <dd className="text-right font-medium">{restaurant.maxPartySize} guests online</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">Larger groups</dt>
                <dd className="text-right font-medium">
                  <a href={restaurant.phoneHref} className="hover:text-foreground hover:underline">
                    {restaurant.phone}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Cancellation</dt>
                <dd className="text-right font-medium">Up to 4 hours before</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="text-muted-foreground">
            We are not taking bookings right now. Please try again shortly.
          </p>
        )}
      </div>

      {restaurant ? <ReservationForm restaurant={restaurant} /> : null}
    </div>
  );
}
