import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getMenuItem } from "@/lib/data/menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/menu/add-to-cart-button";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMenuItem(slug);
  return { title: item?.name ?? "Menu item" };
}

export default async function MenuItemPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getMenuItem(slug);
  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-6">
        <Link href="/menu">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to menu
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-secondary">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(140deg,hsl(var(--accent)/0.3),hsl(var(--primary)/0.22))]">
              <span className="font-display text-5xl text-foreground/50">{item.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{item.categoryName}</Badge>
            {!item.isAvailable ? <Badge variant="secondary">Sold out</Badge> : null}
          </div>
          <h1 className="text-balance text-4xl leading-tight">{item.name}</h1>
          <p className="font-display text-3xl text-primary">{formatPrice(item.priceCents)}</p>
          <p className="text-muted-foreground">{item.description}</p>

          <div className="mt-2 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            <AddToCartButton item={item} />
            <Button asChild variant="outline" size="lg">
              <Link href="/reservations">Reserve a table instead</Link>
            </Button>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border border-border bg-card p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Allergens</dt>
              <dd className="mt-1">Ask your server</dd>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Pairs with</dt>
              <dd className="mt-1">House red or dry cider</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
