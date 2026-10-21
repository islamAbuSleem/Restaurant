import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame } from "lucide-react";
import type { MenuItem } from "@restaurant/shared";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu/menu-item-card";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.16),transparent_50%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div className="animate-fade-rise flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Cooked over live fire since 2014
          </span>
          <h1 className="text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            A table by the fire, <span className="text-primary">every night.</span>
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            Twelve seats, one hearth, and a menu that changes with what the market gives us.
            Reserve a table or order the whole menu to go.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/reservations">
                Reserve a table
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/menu">View the menu</Link>
            </Button>
          </div>
          <dl className="mt-4 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Seats</dt>
              <dd className="font-display text-2xl">12</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Local farms</dt>
              <dd className="font-display text-2xl">9</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Years</dt>
              <dd className="font-display text-2xl">12</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-secondary">
            <Image
              src="https://images.unsplash.com/photo-1706011465964-7a226eea129a?w=1200&q=75&auto=format&fit=crop"
              alt="A live fire burning in the restaurant's brick hearth"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8 text-background">
              <span className="text-xs uppercase tracking-[0.3em] opacity-80">The room</span>
              <p className="font-display text-3xl leading-tight">Twelve seats around the fire.</p>
              <p className="max-w-sm text-sm opacity-90">
                Dinner is cooked in front of you, Tuesday through Sunday.
              </p>
            </div>
          </div>
          <div className="absolute -top-4 right-4 hidden rounded-full border border-border bg-card px-4 py-2 shadow-sm sm:block">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Counter</p>
            <p className="font-display text-sm">Walk-ins welcome</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedDishesSection({ items }: { items: MenuItem[] }) {
  const featured = items.filter((item) => item.categoryName === "Mains").slice(0, 3);
  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            From the hearth
          </span>
          <h2 className="text-3xl sm:text-4xl">This week&apos;s plates</h2>
        </div>
        <Button asChild variant="link">
          <Link href="/menu">
            See the full menu <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function StorySection() {
  return (
    <section id="story" className="border-y border-border bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our story
          </span>
          <h2 className="text-balance text-3xl leading-tight sm:text-4xl">
            One fire, a short menu, and no wasted motion.
          </h2>
          <p className="text-muted-foreground">
            We cook the way a campfire cooks: directly, patiently, and only with what&apos;s in season.
            Everything you taste is made in this room — the bread, the butter, the stocks, the
            dessert.
          </p>
          <p className="text-muted-foreground">
            Our team of six works an open hearth so you can watch the whole thing happen. Ask us
            anything; we like talking about fire.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Local farms", value: "9" },
            { label: "Menu changes", value: "Weekly" },
            { label: "Wine labels", value: "60+" },
            { label: "Staff", value: "6" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
              <p className="font-display text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HoursSection({ hours }: { hours: { day: string; time: string }[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Come hungry
          </span>
          <h2 className="text-3xl sm:text-4xl">Find us on Kiln Street</h2>
          <p className="text-muted-foreground">
            Walk-ins are welcome at the six-seat counter. For the dining room, we recommend
            booking ahead — especially on weekends.
          </p>
          <Button asChild className="w-fit">
            <Link href="/reservations">
              Book a table <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg">Opening hours</h3>
          <dl className="mt-4 divide-y divide-border">
            {hours.map((row) => (
              <div key={row.day} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-muted-foreground">{row.day}</dt>
                <dd className="font-medium">{row.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
