import { Fraunces, Inter } from "next/font/google";
import type { Metadata } from "next";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentUser, hasRefreshSession } from "@/lib/auth";
import { getRestaurant } from "@/lib/data/restaurant";
import { SessionRefresh } from "@/components/auth/session-refresh";
import "@/styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Ember & Oak — Wood-fired restaurant",
    template: "%s — Ember & Oak",
  },
  description:
    "Seasonal cooking over live fire, natural wine, and a table that feels like home. Browse the menu, reserve, or order online.",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, restaurant] = await Promise.all([getCurrentUser(), getRestaurant()]);
  const staleSession = !user && (await hasRefreshSession());

  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader user={user} />
            {staleSession ? <SessionRefresh /> : null}
            <main className="flex-1">{children}</main>
            <SiteFooter restaurant={restaurant} />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
