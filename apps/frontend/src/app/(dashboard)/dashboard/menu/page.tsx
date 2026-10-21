import type { Metadata } from "next";
import { getCategories, getMenuItems } from "@/lib/data/menu";
import { MenuTable } from "@/components/dashboard/menu-table";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Menu management" };

export default async function DashboardMenuPage() {
  const [categories, items] = await Promise.all([
    getCategories(),
    getMenuItems({ includeUnavailable: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Kitchen"
        title="Menu"
        description="Add dishes, update prices, and mark items sold out as the night runs."
      />
      <MenuTable categories={categories} items={items} />
    </div>
  );
}
