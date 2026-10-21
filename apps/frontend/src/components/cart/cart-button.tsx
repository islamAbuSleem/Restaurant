"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function CartButton() {
  const { count } = useCart();
  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label={`Cart, ${count} items`}>
      <Link href="/cart">
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
