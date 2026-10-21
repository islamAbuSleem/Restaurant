"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { User } from "@restaurant/shared";
import { cn } from "@/lib/utils";
import { isStaff } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

const NAV_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reservations" },
  { href: "/#story", label: "Our story" },
] as const;

export function SiteHeader({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const staff = isStaff(user);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-xl font-semibold tracking-tight">Ember &amp; Oak</span>
          <span className="hidden text-xs uppercase tracking-[0.25em] text-muted-foreground sm:inline">
            Wood fired
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link
                href={link.href}
                className={cn(pathname === link.href && "text-primary")}
              >
                {link.label}
              </Link>
            </Button>
          ))}
          {user ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders" className={cn(pathname === "/orders" && "text-primary")}>
                Your orders
              </Link>
            </Button>
          ) : null}
        </nav>

        <div className="flex items-center gap-1">
          <CartButton />
          {staff ? (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : null}
          {user ? (
            <>
              <span className="hidden max-w-[16ch] truncate text-sm text-muted-foreground lg:inline">
                {user.name}
              </span>
              <SignOutButton variant="ghost" size="sm" />
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background md:hidden" aria-label="Mobile">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            {staff ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                Dashboard
              </Link>
            ) : null}
            {user ? (
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                Your orders
              </Link>
            ) : null}
            {user ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="truncate text-sm text-muted-foreground">{user.name}</span>
                <SignOutButton variant="ghost" size="sm" />
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
