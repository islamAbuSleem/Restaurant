import Link from "next/link";
import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import type { RestaurantProfile } from "@restaurant/shared";

export function SiteFooter({ restaurant }: { restaurant: RestaurantProfile | null }) {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="font-display text-xl">{restaurant?.name ?? "Ember & Oak"}</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Seasonal cooking over live fire. Small room, big flavors, no shortcuts.
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" /> @emberandoak
          </a>
        </div>

        {restaurant ? (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Visit
            </span>
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {restaurant.address}
            </span>
            <a href={restaurant.phoneHref} className="flex items-center gap-2 hover:text-foreground">
              <Phone className="h-4 w-4" aria-hidden="true" /> {restaurant.phone}
            </a>
            <span className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {restaurant.hoursSummary}
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
            Explore
          </span>
          <Link href="/menu" className="hover:text-foreground">
            Menu
          </Link>
          <Link href="/reservations" className="hover:text-foreground">
            Reserve a table
          </Link>
          <Link href="/cart" className="hover:text-foreground">
            Order online
          </Link>
          <Link href="/login?next=/dashboard" className="hover:text-foreground">
            Staff sign in
          </Link>
        </div>
      </div>
      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {restaurant?.name ?? "Ember & Oak"}. All rights reserved.
      </div>
    </footer>
  );
}
