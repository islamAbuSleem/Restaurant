import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, ChefHat, Clock, CreditCard, Flame } from "lucide-react";
import type { Order } from "@restaurant/shared";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { getRestaurant } from "@/lib/data/restaurant";
import { formatDate, formatPrice, formatRestaurantDate } from "@/lib/format";
import { orderStatusVariant, orderSummary } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DemoNotice } from "@/components/shared/demo-notice";
import { OrderStatusLive } from "@/components/orders/order-status-live";

export const metadata: Metadata = { title: "Your order" };

const STEPS = ["pending", "paid", "preparing", "ready", "completed"] as const;

const STEP_META: Record<
  (typeof STEPS)[number],
  { label: string; description: string; icon: typeof Clock }
> = {
  pending: { label: "Awaiting payment", description: "We've saved your order.", icon: CreditCard },
  paid: { label: "Payment received", description: "The pass has your ticket.", icon: CheckCircle2 },
  preparing: { label: "In the kitchen", description: "Your dishes are on the fire.", icon: Flame },
  ready: { label: "Ready", description: "Hot and waiting for pickup or service.", icon: ChefHat },
  completed: { label: "Completed", description: "Thanks for dining with us.", icon: CheckCircle2 },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const restaurant = await getRestaurant();
  const timeZone = restaurant?.timezone ?? "UTC";

  let order: Order;
  try {
    const cookieStore = await cookies();
    order = await apiFetch<Order>(`/orders/${id}`, { cookieHeader: cookieStore.toString() });
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-lg font-medium">We couldn&apos;t load this order</p>
            <p className="text-sm text-muted-foreground">
              The API isn&apos;t reachable right now. Your order is safe — try refreshing in a moment.
            </p>
            <Button asChild className="mt-2">
              <Link href="/menu">Back to the menu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const currentIndex = STEPS.indexOf(order.status === "cancelled" ? "pending" : order.status);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
        <h1 className="text-balance text-4xl">
          {cancelled ? "This order was cancelled" : status === "success" ? "Payment confirmed" : "Order received"}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {cancelled
            ? "Nothing was charged. Feel free to start a new order whenever you're ready."
            : order.status === "pending"
              ? "We have your order. Keep this page open and we'll check the pass every 20 seconds — each step updates as the kitchen works."
              : "We're on it. Each step below updates as the kitchen works through the rail."}
        </p>
        <span className="font-mono text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</span>
        <OrderStatusLive status={order.status} />
      </div>

      {order.status === "pending" ? <DemoNotice /> : null}

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="text-lg">Progress</h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step, index) => {
              const meta = STEP_META[step];
              const Icon = meta.icon;
              const done = !cancelled && index <= currentIndex;
              const active = !cancelled && index === currentIndex;
              return (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className={
                      done
                        ? "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground"
                    }
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className={done ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
                      {meta.label}
                      {active ? " — now" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg">Your dishes</h2>
            <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  {item.quantity} × {item.nameSnapshot}
                </span>
                <span>{formatPrice(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex items-center justify-between font-display text-xl">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{orderSummary(order)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="text-lg">Collection</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Pickup</dt>
              <dd className="font-medium">
                {order.pickupAt
                  ? formatRestaurantDate(order.pickupAt, timeZone)
                  : "As soon as we can"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Where</dt>
              <dd className="font-medium">{restaurant?.collectionPoint ?? "The counter"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">For</dt>
              <dd className="font-medium">{order.customerName ?? "Guest"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">We&apos;ll call</dt>
              <dd className="font-medium">{order.customerPhone ?? "—"}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            {order.customerEmail
              ? `A receipt is on its way to ${order.customerEmail}.`
              : "We will call you when it is plated."}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/menu">Order something else</Link>
        </Button>
        <Button asChild>
          <Link href="/reservations">Book a table</Link>
        </Button>
      </div>
    </div>
  );
}
