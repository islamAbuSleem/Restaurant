# Architecture

## Stack
| Layer | Choice |
|---|---|
| Web | Next.js 16 App Router, TypeScript strict, Tailwind CSS, shadcn/ui |
| API | NestJS v11, TypeScript strict, class-validator DTOs |
| DB | Neon Postgres (serverless driver for edge, `pg` pool for NestJS) |
| Auth | NestJS JWT (access + refresh, httpOnly cookies), bcrypt, Passport Google OAuth 2.0 |
| Payments | Stripe Checkout (test mode) + webhook |
| Storage | Neon object storage (S3-compatible, presigned upload/download) |
| Shared | Zod schemas + TS types in `packages/shared` |

## Monorepo Structure
```
restaurant/
  apps/
    frontend/            # Next.js 16 (@restaurant/frontend)
      src/app/           # routes (public + dashboard)
      src/components/    # ui/ (shadcn-style) + feature components
      src/lib/           # api client, auth helpers, data fetchers, server actions
      src/styles/        # globals.css (tokens)
    backend/             # NestJS v11 (@restaurant/backend)
      src/modules/       # auth, users, menu, orders, reservations, payments, storage
      src/common/        # guards, interceptors, filters, decorators
      src/database/      # drizzle schema, migrations, migrate + seed scripts
  packages/
    shared/              # zod schemas, DTO types, constants, demo fixtures
  context/               # specs (this folder)
```
Note: directory names are `apps/frontend` + `apps/backend` per user request
(“Frontend”/“Backend” folders), implemented with npm scopes `@restaurant/frontend`
and `@restaurant/backend`.

## System Boundaries
- **Web** never touches the DB directly. All reads/writes go through NestJS REST.
- **NestJS** owns auth, business rules, Stripe webhook verification, presigned URL generation.
- **Neon** is the single source of truth for data; object storage holds images only.
- **Stripe** is the only external payment authority; order status changes on verified webhook only.

## Data Flow
1. Web calls `NEXT_PUBLIC_API_URL` with `credentials: include`.
2. Access token in httpOnly cookie; refresh endpoint rotates on 401.
3. NestJS guards check JWT + role (`customer | staff | admin`).
4. Stripe Checkout: web → API creates session → redirect → Stripe webhook → API marks order `paid`.
5. Image upload: web → API presign → direct PUT to storage → web sends `{ url, key }` to menu item.

## Database Schema
### users
`id uuid pk`, `email citext unique`, `password_hash text null` (null for OAuth-only), `name text`, `role enum(customer,staff,admin) default customer`, `google_id text unique null`, `created_at`, `updated_at`.

### menu_categories
`id uuid pk`, `name text`, `slug text unique`, `sort_order int`, `created_at`.

### menu_items
`id uuid pk`, `category_id uuid fk → menu_categories`, `name text`, `slug text unique`, `description text`, `price_cents int`, `image_url text null`, `image_key text null`, `is_available bool default true`, `created_at`, `updated_at`.

### orders
`id uuid pk`, `user_id uuid fk → users null` (null for guest), `status enum(pending,paid,preparing,ready,completed,cancelled) default pending`, `total_cents int`, `stripe_session_id text unique null`, `created_at`, `updated_at`.

### order_items
`id uuid pk`, `order_id uuid fk → orders`, `menu_item_id uuid fk → menu_items`, `name_snapshot text`, `price_cents int`, `quantity int`.

### tables
`id uuid pk`, `label text unique`, `seats int`, `is_active bool default true`.

### reservations
`id uuid pk`, `user_id uuid fk → users null`, `table_id uuid fk → tables null`, `name text`, `email text`, `phone text`, `party_size int`, `reserved_for timestamptz`, `status enum(pending,confirmed,seated,cancelled) default pending`, `notes text null`, `created_at`.

### restaurants
`id uuid pk`, `slug text unique`, `name text`, `tagline text`, `description text`, `address text`, `phone text`, `phone_href text`, `timezone text`, `currency text default 'USD'`, `seats_dining_room int`, `seats_counter int`, `max_party_size int`, `tax_policy enum(none,included,rate) default none`, `tax_rate_bps int null`, `collection_point text`, `hours_summary text`, `is_active bool default true`, `created_at`, `updated_at`.

### restaurant_hours
`id uuid pk`, `restaurant_id uuid fk → restaurants (cascade)`, `weekday int` (0 = Sunday), `open_hour int`, `close_hour int`, `closed bool default false`; unique `(restaurant_id, weekday)`.

Restaurant-level facts (hours, seats, party limit, phone, collection point, timezone) are data,
not code — the web app reads them from `GET /restaurants/current`, and the API enforces the
profile's service window and party limit whenever a reservation or pickup time is chosen.

## Storage Buckets
- `menu-images` — public read, presigned upload (admin/staff only). Persist `image_url` + `image_key`.

## Auth Contract
- `POST /auth/register` → sets cookies, returns user.
- `POST /auth/login` → sets cookies, returns user.
- `GET /auth/google` → redirect; `GET /auth/google/callback` → sets cookies, redirects by role
  (staff → `/dashboard`, customer → `/`).
- `POST /auth/refresh` → rotates tokens.
- `POST /auth/logout` → clears cookies.
- Access token 15m, refresh 7d. Roles embedded in JWT claim `role`.

## Restaurant Profile Contract
- `GET /restaurants/current` → the restaurant this deployment serves, including its weekly
  service hours. Public.

## Restaurant Profile Contract
- `GET /restaurants/current` → the restaurant this deployment serves, including its weekly
  service hours. Public.

## API Conventions
- Base path `/api/v1`.
- All responses `{ success: true, data }` or `{ success: false, error: { code, message } }`.
- Pagination: `?page=1&limit=20` → `{ items, page, limit, total }`.
- Errors use NestJS exception filters with a stable `code` string.
