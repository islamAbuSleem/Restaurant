import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { getOrders } from "@/lib/data/dashboard";
import { getRestaurant } from "@/lib/data/restaurant";
import { OrderRow } from "@/components/dashboard/order-row";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Orders" };

export default async function DashboardOrdersPage() {
  const [orders, restaurant] = await Promise.all([getOrders(), getRestaurant()]);
  const timeZone = restaurant?.timezone ?? "UTC";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading eyebrow="Service" title="Orders" description="Advance each ticket as it moves through the kitchen." />
      {orders.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-8 w-8" aria-hidden="true" />}
          title="No orders yet"
          description="New orders will appear here as guests check out."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} timeZone={timeZone} />
          ))}
        </div>
      )}
    </div>
  );
}
