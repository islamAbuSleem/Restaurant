import { serviceHoursRows } from "@restaurant/shared";
import { getMenuItems } from "@/lib/data/menu";
import { getRestaurant } from "@/lib/data/restaurant";
import { HeroSection, FeaturedDishesSection, StorySection, HoursSection } from "@/components/site/home-sections";

export default async function HomePage() {
  const [menuItems, restaurant] = await Promise.all([getMenuItems(), getRestaurant()]);
  const hours = restaurant ? serviceHoursRows(restaurant.hours, restaurant.timezone) : [];

  return (
    <>
      <HeroSection />
      <FeaturedDishesSection items={menuItems} />
      <StorySection />
      {hours.length > 0 ? <HoursSection hours={hours} /> : null}
    </>
  );
}
