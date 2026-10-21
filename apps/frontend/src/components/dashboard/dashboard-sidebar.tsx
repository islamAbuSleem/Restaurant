"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChefHat, LayoutDashboard, Receipt, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: ChefHat },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/reservations", label: "Reservations", icon: CalendarDays },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/dashboard" className="font-display text-lg">
          Ember &amp; Oak
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Dashboard">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Users className="h-4 w-4" aria-hidden="true" /> View site
        </Link>
        <SignOutButton
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 py-2 text-left font-normal text-muted-foreground hover:bg-secondary hover:text-foreground"
        />      </div>
    </aside>
  );
}
