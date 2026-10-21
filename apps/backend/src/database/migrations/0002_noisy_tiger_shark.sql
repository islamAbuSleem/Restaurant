CREATE TYPE "public"."tax_policy" AS ENUM('none', 'included', 'rate');--> statement-breakpoint
CREATE TABLE "restaurant_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"weekday" integer NOT NULL,
	"open_hour" integer NOT NULL,
	"close_hour" integer NOT NULL,
	"closed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"phone_href" text NOT NULL,
	"timezone" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"seats_dining_room" integer NOT NULL,
	"seats_counter" integer NOT NULL,
	"max_party_size" integer NOT NULL,
	"tax_policy" "tax_policy" DEFAULT 'none' NOT NULL,
	"tax_rate_bps" integer,
	"collection_point" text NOT NULL,
	"hours_summary" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "restaurant_hours" ADD CONSTRAINT "restaurant_hours_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "restaurant_hours_restaurant_weekday" ON "restaurant_hours" USING btree ("restaurant_id","weekday");