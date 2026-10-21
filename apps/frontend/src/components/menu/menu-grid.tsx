"use client";

import { useMemo, useState } from "react";
import type { Category, MenuItem } from "@restaurant/shared";
import { cn } from "@/lib/utils";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { EmptyState } from "@/components/ui/empty-state";
import { UtensilsCrossed } from "lucide-react";

type MenuGridProps = {
  categories: Category[];
  items: MenuItem[];
};

export function MenuGrid({ categories, items }: MenuGridProps) {
  const [activeSlug, setActiveSlug] = useState<string>("all");

  const visibleItems = useMemo(() => {
    if (activeSlug === "all") {
      return items;
    }
    const category = categories.find((entry) => entry.slug === activeSlug);
    return category ? items.filter((item) => item.categoryId === category.id) : items;
  }, [activeSlug, categories, items]);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="sr-only">Dishes</h2>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter the menu by course"
      >
        <button
          type="button"
          aria-pressed={activeSlug === "all"}
          onClick={() => setActiveSlug("all")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            activeSlug === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:bg-secondary",
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={activeSlug === category.slug}
            onClick={() => setActiveSlug(category.slug)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeSlug === category.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-8 w-8" aria-hidden="true" />}
          title="Nothing on the fire yet"
          description="This category is empty right now. Check back soon."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
