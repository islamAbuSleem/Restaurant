"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRestaurantDate, formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@restaurant/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orderStatusVariant, orderSummary } from "@/lib/status";
import { updateOrderStatusAction } from "@/lib/actions/orders";

const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; status: OrderStatus }>> = {
  pending: { label: "Mark paid", status: "paid" },
  paid: { label: "Start prep", status: "preparing" },
  preparing: { label: "Mark ready", status: "ready" },
  ready: { label: "Complete", status: "completed" },
};

export function OrderRow({ order, timeZone }: { order: Order; timeZone: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = NEXT_STATUS[order.status];

  async function advance(): Promise<void> {
    if (!next) {
      return;
    }
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("orderId", order.id);
    formData.set("status", next.status);

    const result = await updateOrderStatusAction(formData);
    setPending(false);

    if (!result.ok) {
      setError(result.error ?? "We couldn't move that ticket. Try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
          <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
          <span className="text-xs text-muted-foreground">{formatRestaurantDate(order.createdAt, timeZone)}</span>
        </div>
        <p className="mt-2 truncate text-sm font-medium">{orderSummary(order)}</p>
        <p className="text-xs text-muted-foreground">
          {order.customerName ?? "Guest checkout"}
          {order.customerPhone ? ` · ${order.customerPhone}` : ""}
          {order.customerEmail ? ` · ${order.customerEmail}` : ""}
        </p>
        {order.pickupAt ? (
          <p className="text-xs text-muted-foreground">Pickup {formatRestaurantDate(order.pickupAt, timeZone)}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Pickup as soon as possible</p>
        )}
        {error ? (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <span className="font-display text-lg">{formatPrice(order.totalCents)}</span>
        {next ? (
          <Button type="button" size="sm" onClick={() => void advance()} disabled={pending}>
            {pending ? "Working…" : next.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
