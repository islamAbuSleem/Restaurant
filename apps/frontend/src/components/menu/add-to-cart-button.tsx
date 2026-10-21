"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { MenuItem } from "@restaurant/shared";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

export function AddToCartButton({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(): void {
    addItem({
      menuItemId: item.id,
      slug: item.slug,
      name: item.name,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button size="lg" onClick={handleAdd} disabled={!item.isAvailable}>
      {added ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" /> Added to cart
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add to cart
        </>
      )}
    </Button>
  );
}
