import type { Order, OrderStatus } from "@restaurant/shared";

const ORDER_VARIANTS: Record<OrderStatus, "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "warning",
  paid: "success",
  preparing: "warning",
  ready: "outline",
  completed: "secondary",
  cancelled: "destructive",
};

export function orderStatusVariant(
  status: OrderStatus,
): "secondary" | "success" | "warning" | "destructive" | "outline" {
  return ORDER_VARIANTS[status];
}

export function orderSummary(order: Order): string {
  if (order.items.length === 0) {
    return "Empty order";
  }
  const first = order.items[0];
  if (!first) {
    return "Empty order";
  }
  const remaining = order.items.length - 1;
  const base = `${first.quantity} × ${first.nameSnapshot}`;
  return remaining > 0 ? `${base} +${remaining} more` : base;
}
