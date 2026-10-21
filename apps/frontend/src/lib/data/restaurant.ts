import { cache } from "react";
import type { RestaurantProfile } from "@restaurant/shared";
import { safeApiFetch } from "@/lib/api";

/**
 * The restaurant this deployment serves. Its facts — hours, seats, party
 * limit, phone, collection point, timezone — live in the database, not in
 * code, so another restaurant is another row rather than another fork.
 */
export const getRestaurant = cache(async (): Promise<RestaurantProfile | null> => {
  return safeApiFetch<RestaurantProfile>("/restaurants/current");
});
