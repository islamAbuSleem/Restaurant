"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function CartView() {
  const { entries, totalCents, setQuantity, removeItem, hydrated } = useCart();

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-8 w-8" aria-hidden="true" />}
        title="Your cart is empty"
        description="Browse the menu and add a few plates — the hearth is hot."
        action={
          <Button asChild>
            <Link href="/menu">Browse the menu</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <Card key={entry.menuItemId}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                {entry.imageUrl ? (
                  <Image src={entry.imageUrl} alt={entry.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,hsl(var(--accent)/0.25),hsl(var(--primary)/0.2))]">
                    <span className="font-display text-xl text-foreground/60">
                      {entry.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/menu/${entry.slug}`} className="text-base font-medium hover:text-primary">
                  {entry.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{formatPrice(entry.priceCents)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Decrease ${entry.name}`}
                  onClick={() => setQuantity(entry.menuItemId, entry.quantity - 1)}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                  {entry.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Increase ${entry.name}`}
                  onClick={() => setQuantity(entry.menuItemId, entry.quantity + 1)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${entry.name}`}
                  onClick={() => removeItem(entry.menuItemId)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Button>
              </div>

              <span className="w-20 text-right font-display text-lg">
                {formatPrice(entry.priceCents * entry.quantity)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="lg:sticky lg:top-24">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="text-lg">Order summary</h2>
          <div className="flex justify-between font-display text-xl">
            <span>Total</span>
            <span>{formatPrice(totalCents)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            No fees are added online — this is the full amount you pay.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">Go to checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/menu">Add more plates</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
