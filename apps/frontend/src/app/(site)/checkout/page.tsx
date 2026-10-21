import type { Metadata } from "next";
import { serviceHoursRows } from "@restaurant/shared";
import { getRestaurant } from "@/lib/data/restaurant";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const restaurant = await getRestaurant();
  const serviceHint = restaurant
    ? serviceHoursRows(restaurant.hours, restaurant.timezone)
        .map((row) => `${row.day} ${row.time}`)
        .join(", ")
    : "";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <SectionHeading as="h1" title="Finish your order" />
      <div className="mt-10">
        {restaurant ? (
          <CheckoutForm
            hours={restaurant.hours}
            timeZone={restaurant.timezone}
            collectionPoint={restaurant.collectionPoint}
            serviceHint={serviceHint}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Ordering is briefly unavailable. Please try again in a moment.
          </p>
        )}
      </div>
    </div>
  );
}
