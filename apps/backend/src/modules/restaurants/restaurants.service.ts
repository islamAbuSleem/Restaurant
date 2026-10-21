import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import type { RestaurantProfile, ServiceHours } from "@restaurant/shared";
import { DB, type Database } from "../../database/database.module";
import {
  restaurantHours,
  restaurants,
  type RestaurantHoursRow,
  type RestaurantRow,
} from "../../database/schema";

@Injectable()
export class RestaurantsService {
  constructor(@Inject(DB) private readonly db: Database) {}

  /** The restaurant this deployment serves. */
  async getCurrent(): Promise<RestaurantProfile> {
    const [row] = await this.db
      .select()
      .from(restaurants)
      .where(eq(restaurants.isActive, true))
      .orderBy(asc(restaurants.createdAt))
      .limit(1);
    if (!row) {
      throw new NotFoundException({
        code: "RESTAURANT_NOT_FOUND",
        message: "No restaurant is configured for this deployment",
      });
    }
    return this.toProfile(row, await this.hoursFor(row.id));
  }

  async listAll(): Promise<RestaurantProfile[]> {
    const rows = await this.db.select().from(restaurants).orderBy(asc(restaurants.createdAt));
    const profiles: RestaurantProfile[] = [];
    for (const row of rows) {
      profiles.push(this.toProfile(row, await this.hoursFor(row.id)));
    }
    return profiles;
  }

  private async hoursFor(restaurantId: string): Promise<ServiceHours> {
    const rows = await this.db
      .select()
      .from(restaurantHours)
      .where(eq(restaurantHours.restaurantId, restaurantId));
    const hours: ServiceHours = {};
    for (const row of rows) {
      hours[row.weekday] = {
        openHour: row.openHour,
        closeHour: row.closeHour,
        closed: row.closed,
      };
    }
    return hours;
  }

  private toProfile(row: RestaurantRow, hours: ServiceHours): RestaurantProfile {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      address: row.address,
      phone: row.phone,
      phoneHref: row.phoneHref,
      timezone: row.timezone,
      currency: row.currency,
      seatsDiningRoom: row.seatsDiningRoom,
      seatsCounter: row.seatsCounter,
      maxPartySize: row.maxPartySize,
      taxPolicy: row.taxPolicy,
      taxRateBps: row.taxRateBps,
      collectionPoint: row.collectionPoint,
      hours,
      hoursSummary: row.hoursSummary,
    };
  }
}

export type { RestaurantHoursRow };
