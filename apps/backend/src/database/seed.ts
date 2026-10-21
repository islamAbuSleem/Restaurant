import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { demoCategories, demoMenuItems } from "@restaurant/shared";
import {
  menuCategories,
  menuItems,
  users,
  diningTables,
  restaurantHours,
  restaurants,
} from "./schema";

const TABLES = [
  { label: "Hearth 1", seats: 2 },
  { label: "Hearth 2", seats: 2 },
  { label: "Hearth 3", seats: 4 },
  { label: "Hearth 4", seats: 4 },
  { label: "Oak 1", seats: 6 },
  { label: "Oak 2", seats: 6 },
  { label: "The Pass", seats: 2 },
  { label: "Back Room", seats: 10 },
];

/**
 * The seeded instance. Everything the product shows a guest about this
 * restaurant lives here, so a different restaurant is a different row.
 */
const RESTAURANT = {
  slug: "ember-and-oak",
  name: "Ember & Oak",
  tagline: "Cooked over live fire since 2014",
  description:
    "Seasonal cooking over live fire, natural wine, and a table that feels like home. Browse the menu, reserve, or order online.",
  address: "42 Kiln Street, Portland, OR",
  phone: "(503) 555-0142",
  phoneHref: "tel:+15035550142",
  timezone: "America/Los_Angeles",
  currency: "USD",
  seatsDiningRoom: 12,
  seatsCounter: 6,
  maxPartySize: 8,
  taxPolicy: "none" as const,
  taxRateBps: null,
  collectionPoint: "Counter, 42 Kiln Street",
  hoursSummary: "Tue – Sat from 5pm, Sun from 4pm, closed Mondays",
};

/** Weekly service windows, keyed by weekday index (0 = Sunday … 6 = Saturday). */
const HOURS = [
  { weekday: 0, openHour: 16, closeHour: 21, closed: false },
  { weekday: 1, openHour: 0, closeHour: 0, closed: true },
  { weekday: 2, openHour: 17, closeHour: 22, closed: false },
  { weekday: 3, openHour: 17, closeHour: 22, closed: false },
  { weekday: 4, openHour: 17, closeHour: 22, closed: false },
  { weekday: 5, openHour: 17, closeHour: 23, closed: false },
  { weekday: 6, openHour: 17, closeHour: 23, closed: false },
];

async function hashPassword(value: string): Promise<string> {
  const { hash } = await import("bcrypt");
  return hash(value, 12);
}

async function run(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("[db:seed] DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    for (const category of demoCategories) {
      await db
        .insert(menuCategories)
        .values({ id: category.id, name: category.name, slug: category.slug, sortOrder: category.sortOrder })
        .onConflictDoUpdate({
          target: menuCategories.slug,
          set: { name: category.name, sortOrder: category.sortOrder },
        });
    }
    console.log(`[db:seed] categories: ${demoCategories.length} upserted`);

    for (const item of demoMenuItems) {
      await db
        .insert(menuItems)
        .values({
          id: item.id,
          categoryId: item.categoryId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
          imageKey: item.imageKey,
          isAvailable: item.isAvailable,
        })
        .onConflictDoUpdate({
          target: menuItems.slug,
          set: {
            categoryId: item.categoryId,
            name: item.name,
            description: item.description,
            priceCents: item.priceCents,
            imageUrl: item.imageUrl,
            isAvailable: item.isAvailable,
          },
        });
    }
    console.log(`[db:seed] menu items: ${demoMenuItems.length} upserted`);

    for (const table of TABLES) {
      await db.insert(diningTables).values(table).onConflictDoNothing({ target: diningTables.label });
    }
    console.log(`[db:seed] tables: ${TABLES.length} ensured`);

    const [existingRestaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.slug, RESTAURANT.slug))
      .limit(1);
    let restaurantId = existingRestaurant?.id;
    if (!restaurantId) {
      const inserted = await db
        .insert(restaurants)
        .values(RESTAURANT)
        .onConflictDoUpdate({
          target: restaurants.slug,
          set: {
            name: RESTAURANT.name,
            tagline: RESTAURANT.tagline,
            description: RESTAURANT.description,
            address: RESTAURANT.address,
            phone: RESTAURANT.phone,
            phoneHref: RESTAURANT.phoneHref,
            timezone: RESTAURANT.timezone,
            currency: RESTAURANT.currency,
            seatsDiningRoom: RESTAURANT.seatsDiningRoom,
            seatsCounter: RESTAURANT.seatsCounter,
            maxPartySize: RESTAURANT.maxPartySize,
            taxPolicy: RESTAURANT.taxPolicy,
            taxRateBps: RESTAURANT.taxRateBps,
            collectionPoint: RESTAURANT.collectionPoint,
            hoursSummary: RESTAURANT.hoursSummary,
          },
        })
        .returning();
      const [created] = inserted;
      if (!created) {
        throw new Error("[db:seed] Failed to upsert the restaurant profile");
      }
      restaurantId = created.id;
    }

    for (const window of HOURS) {
      await db
        .insert(restaurantHours)
        .values({ restaurantId, ...window })
        .onConflictDoUpdate({
          target: [restaurantHours.restaurantId, restaurantHours.weekday],
          set: {
            openHour: window.openHour,
            closeHour: window.closeHour,
            closed: window.closed,
          },
        });
    }
    console.log(`[db:seed] restaurant: ${RESTAURANT.name} with ${HOURS.length} service days`);

    const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@emberandoak.test").toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ember-admin-123";
    const staffEmail = (process.env.SEED_STAFF_EMAIL ?? "staff@emberandoak.test").toLowerCase();
    const staffPassword = process.env.SEED_STAFF_PASSWORD ?? "ember-staff-123";

    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        email: adminEmail,
        name: "Owner",
        role: "admin",
        passwordHash: await hashPassword(adminPassword),
      });
      console.log(`[db:seed] admin user created: ${adminEmail}`);
    } else {
      console.log(`[db:seed] admin user exists: ${adminEmail}`);
    }

    const existingStaff = await db.select().from(users).where(eq(users.email, staffEmail)).limit(1);
    if (existingStaff.length === 0) {
      await db.insert(users).values({
        email: staffEmail,
        name: "Service",
        role: "staff",
        passwordHash: await hashPassword(staffPassword),
      });
      console.log(`[db:seed] staff user created: ${staffEmail}`);
    } else {
      console.log(`[db:seed] staff user exists: ${staffEmail}`);
    }

    console.log("[db:seed] done");
  } finally {
    await pool.end();
  }
}

void run();
