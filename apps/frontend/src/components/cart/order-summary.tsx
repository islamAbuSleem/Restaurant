import { formatPrice } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import type { CartEntry } from "@/components/cart/cart-provider";

type OrderSummaryProps = {
  entries: CartEntry[];
  totalCents: number;
};

export function OrderSummary({ entries, totalCents }: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2 text-sm">
        {entries.map((entry) => (
          <li key={entry.menuItemId} className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              {entry.quantity} × {entry.name}
            </span>
            <span>{formatPrice(entry.priceCents * entry.quantity)}</span>
          </li>
        ))}
      </ul>
      <Separator />
      <div className="flex justify-between font-display text-xl">
        <span>Total</span>
        <span>{formatPrice(totalCents)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        This is the full amount you pay. Nothing is added at the counter.
      </p>
    </div>
  );
}
