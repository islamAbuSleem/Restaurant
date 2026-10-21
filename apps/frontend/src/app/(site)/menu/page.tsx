import type { Metadata } from "next";
import { getCategories, getMenuItems } from "@/lib/data/menu";
import { MenuGrid } from "@/components/menu/menu-grid";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Menu",
  description: "Wood-fired plates, seasonal sides, and desserts made in house.",
};

export default async function MenuPage() {
  const [categories, items] = await Promise.all([getCategories(), getMenuItems()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        as="h1"
        eyebrow="Kitchen"
        title="The menu"
        description="Changes weekly with what the market gives us. Everything is cooked over live fire or made in this room."
      />
      <div className="mt-10">
        <MenuGrid categories={categories} items={items} />
      </div>
    </div>
  );
}
