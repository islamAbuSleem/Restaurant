import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/auth";
import { isStaff } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }
  if (!isStaff(user)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Dashboard</p>
            <h1 className="text-xl">Service board</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
            <div className="flex items-center gap-1 lg:hidden">
              <Button asChild variant="ghost" size="sm" className="gap-1.5 px-2 text-muted-foreground">
                <Link href="/">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Site
                </Link>
              </Button>
              <SignOutButton
                variant="ghost"
                size="sm"
                className="gap-1.5 px-2 text-muted-foreground"
                showLabel={false}
              />
            </div>
          </div>
        </div>
        <DashboardMobileNav />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
