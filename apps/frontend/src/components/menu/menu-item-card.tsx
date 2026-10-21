import Link from "next/link";
import Image from "next/image";
import type { MenuItem } from "@restaurant/shared";
import { formatPrice } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/menu/${item.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,hsl(var(--accent)/0.25),hsl(var(--primary)/0.2))]">
              <span className="font-display text-2xl text-foreground/60">{item.name.charAt(0)}</span>
            </div>
          )}
          {!item.isAvailable ? (
            <Badge variant="secondary" className="absolute left-3 top-3">
              Sold out
            </Badge>
          ) : null}
        </div>
        <CardContent className="flex flex-col gap-2 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg leading-tight">{item.name}</h3>
            <span className="font-display text-lg text-primary">{formatPrice(item.priceCents)}</span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          {item.categoryName ? (
            <span className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              {item.categoryName}
            </span>
          ) : null}
        </CardContent>
      </Link>
    </Card>
  );
}
