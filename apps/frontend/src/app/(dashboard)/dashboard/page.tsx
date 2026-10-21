import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isSameRestaurantDay } from "@restaurant/shared";
import { getOrders, getReservations } from "@/lib/data/dashboard";
import { getMenuItems } from "@/lib/data/menu";
import { getRestaurant } from "@/lib/data/restaurant";
import { formatPrice, formatRestaurantDate } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const [orders, reservations, items, restaurant] = await Promise.all([
    getOrders(),
    getReservations(),
    getMenuItems({ includeUnavailable: true }),
    getRestaurant(),
  ]);
  const timeZone = restaurant?.timezone ?? "UTC";

  const openOrders = orders.filter(
    (order) => order.status !== "completed" && order.status !== "cancelled",
  );
  const collected = orders
    .filter((order) => order.status === "paid" || order.status === "completed")
    .reduce((sum, order) => sum + order.totalCents, 0);
  const pendingReservations = reservations.filter((reservation) => reservation.status === "pending");
  const now = new Date();
  const todaysReservations = reservations.filter(
    (reservation) =>
      reservation.status !== "cancelled" &&
      isSameRestaurantDay(new Date(reservation.reservedFor), now, timeZone),
  );
  const covers = todaysReservations.reduce((sum, entry) => sum + entry.partySize, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open orders"
          value={String(openOrders.length)}
          detail="Awaiting prep or pickup"
          href="/dashboard/orders"
        />
        <StatCard
          label="Revenue"
          value={formatPrice(collected)}
          detail="Paid and completed orders"
        />
        <StatCard
          label="Today's covers"
          value={String(covers)}
          detail={`${todaysReservations.length} reservations today`}
          href="/dashboard/reservations"
        />
        <StatCard
          label="Menu items"
          value={String(items.length)}
          detail={`${items.filter((item) => !item.isAvailable).length} marked sold out`}
          href="/dashboard/menu"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Latest orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/orders">
                All orders <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {order.items.map((item) => item.nameSnapshot).join(", ") || "Empty order"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRestaurantDate(order.createdAt, timeZone)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={order.status === "paid" ? "success" : "secondary"}>{order.status}</Badge>
                  <span className="font-display">{formatPrice(order.totalCents)}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No orders yet. They&apos;ll appear here the moment a guest checks out.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Reservations needing a reply</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/reservations">
                All reservations <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingReservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {reservation.name} · {reservation.partySize} guests
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRestaurantDate(reservation.reservedFor, timeZone)}</p>
                </div>
                <Badge variant="warning">pending</Badge>
              </div>
            ))}
            {pendingReservations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                All caught up — no reservations waiting on confirmation.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
