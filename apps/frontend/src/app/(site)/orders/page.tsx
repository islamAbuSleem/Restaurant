import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import type { Order } from "@restaurant/shared";
import { apiFetch } from "@/lib/api";
import { getRestaurant } from "@/lib/data/restaurant";
import { formatDate, formatPrice, formatRestaurantDate } from "@/lib/format";
import { orderStatusVariant } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Your orders" };

export default async function CustomerOrdersPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader.includes("access_token")) {
    redirect("/login?next=/orders");
  }

  let orders: Order[] = [];
  const restaurant = await getRestaurant();
  const timeZone = restaurant?.timezone ?? "UTC";
  try {
    orders = await apiFetch<Order[]>("/orders/me", { cookieHeader });
  } catch {
    orders = [];
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-14 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-4xl leading-tight">Your orders</h1>
        <p className="max-w-lg text-muted-foreground">
          Every order you have placed, with where it is on the rail right now.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-8 w-8" aria-hidden="true" />}
          title="No orders yet"
          description="When you order from the menu, it shows up here with its status."
          action={
            <Button asChild>
              <Link href="/menu">Browse the menu</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Card>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">
                      {order.items.map((item) => `${item.quantity} × ${item.nameSnapshot}`).join(", ") ||
                        "Empty order"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.pickupAt
                        ? `Pickup ${formatRestaurantDate(order.pickupAt, timeZone)}`
                        : "Pickup as soon as possible"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg">{formatPrice(order.totalCents)}</span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/orders/${order.id}`}>Track</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
