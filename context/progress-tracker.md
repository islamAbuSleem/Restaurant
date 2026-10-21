# Progress Tracker

## Current Status
Phase: **6 complete — restaurant facts moved from code into the database.**
The critique backlog is closed (phase 5) and the product's structural premise from PRODUCT.md —
"a product for any restaurant" — is now real: hours, seats, party limit, phone, address,
collection point, timezone and tax policy live in `restaurants` / `restaurant_hours`, and both
the site and the API read them from the profile. `pnpm -r build` green (15 routes); the
impeccable detector is clean on `apps/frontend/src`.
Next: an owner-facing screen for editing the profile, and the remaining critique backlog
(the staff pass as a real ticket rail, an order-detail view, staff search/filter, undo).
Blockers: none for demo; external credentials only for full feature enablement.

## Phase 6 — Per-restaurant configuration [done]
- [x] 6.1 `restaurants` + `restaurant_hours` tables (migration
      `0002_noisy_tiger_shark.sql`), with the Ember & Oak instance seeded.
- [x] 6.2 `RestaurantsService` + `GET /restaurants/current` (public).
- [x] 6.3 `packages/shared/src/restaurant.ts` is now a pure service-hours library: every
      function takes the profile's hours and timezone. No restaurant fact lives in code.
- [x] 6.4 The web app reads the profile through `lib/data/restaurant.ts` (React `cache`):
      home hours, footer contact and hours summary, reservations page (seats, party limit,
      phone, hours), reservation form (default slot, service window, party limit), checkout
      (pickup slots, collection point, service copy), order page, customer order history and
      every staff surface that shows restaurant time.
- [x] 6.5 The API enforces the profile: reservations reject times outside service hours and
      parties over the profile's limit; orders reject pickup times outside service hours.
- [x] 6.6 Verified by changing the seeded profile in the database (party limit 8 → 6, new
      hours summary): the site and the API followed immediately, then the seed values were
      restored.
- [x] 6.7 Reservations book a real seating slot: a date select (the next 14 open days) and
      a time select (30-minute steps inside service hours), both in restaurant time. The old
      free `datetime-local` field rendered in the guest's own timezone, so a 5pm service slot
      could display as "03:00 AM" and contradicted the hours printed beside it.

## Phase 5 — UI/UX polish (impeccable) [done]
- [x] 5.1 Session-aware shell: header shows Sign in / user + Sign out / Dashboard for staff;
      root layout resolves the user server-side; `?next=` support on login; customers land on
      `/`, staff on `/dashboard`.
- [x] 5.2 Staff dashboard gated: anonymous → `/login?next=/dashboard`, signed-in non-staff → `/`;
      "Demo mode" badge removed; dashboard moved to its own route group (no marketing chrome).
- [x] 5.3 Reservation truth: form captures the element before `await` (the old `reset()` threw a
      false "network error"), empty date no longer crashes, service-window validation on client
      and API, real confirmation with date/party/email, `aria-invalid` + `aria-describedby`.
- [x] 5.4 Checkout pickup promise: name/email/phone required, pickup slot from service hours,
      collection point stated, summary above the CTA on mobile, honest total ("nothing is added
      at the counter"), demo notice only outside production.
- [x] 5.5 Order data model: `customer_name`, `customer_phone`, `pickup_at` columns
      (migration `0001_volatile_mole_man.sql`), required contact fields on `POST /orders`.
- [x] 5.6 Truthful operations: revenue counts paid/completed only, covers use restaurant time,
      fake "Up" badges removed, order/reservation actions report failures instead of silently
      revalidating, order rows show guest contact + pickup time.
- [x] 5.7 Live order status: order page polls every 20s with "Checked HH:MM" + Refresh.
- [x] 5.8 One source of truth for service facts (`packages/shared/src/restaurant.ts`): hours,
      capacity, party limit, phone; home, footer, reservations page and the API now agree.
- [x] 5.9 Customer order history at `/orders` (makes "keep your orders in one place" true).
- [x] 5.10 Session revival: `POST /api/session/refresh` + `SessionRefresh` revive an expired
      access token from the refresh cookie (15-minute access TTL no longer drops users to guest).
- [x] 5.11 States and craft: site 404, site loading skeletons, `<main>` landmark on the
      dashboard, browser surfaces themed (selection, caret, scrollbars, tabular numerals),
      card radius 12px, honest ARIA on the menu filter, 11px minimum small type, redundant
      eyebrows removed.

## Decisions
- Neon Postgres replaces InsForge; Neon object storage for images.
- Auth is custom in NestJS (JWT + Google OAuth), not Neon Auth.
- Stripe Checkout (hosted) with webhook-driven status updates.
- Money stored as integer cents; dates as `timestamptz`.
- Cart persists in localStorage for MVP (guest checkout allowed).
- Directories are `apps/frontend` / `apps/backend` (per user; scopes `@restaurant/frontend`,
  `@restaurant/backend`). Docs and AGENTS.md updated to match.
- Guest checkout: `POST /orders` + `GET /orders/:id` use `OptionalJwtGuard`; ownership is
  guest-scoped by order id only in demo mode (no auth) — acceptable for MVP.
- Menu pages read live data; when the API is unreachable they render an empty state rather than
  demo fixtures (the previous fallback showed food the kitchen was not serving).
- Refresh tokens: stateless rotation (new pair issued on `POST /auth/refresh`); no
  server-side token store yet — fine for MVP, revisit before production.
- Dashboard route protection lives in `app/(dashboard)/dashboard/layout.tsx` (role check +
  redirect), not middleware (Next 16 proxy semantics). The dashboard is a separate route group
  with its own root layout, so it never inherits the marketing header/footer.
- Neon: reused existing project `plain-truth-84178091` (branch `br-spring-mouse-b5gs6xdh`) with a
  fresh database `restaurant` (legacy `neondb` tables are an incompatible older schema) and a
  new public `menu-images` storage bucket.
- JWT guard verifies with an explicit `JWT_ACCESS_SECRET` (JwtModule has no default secret);
  `JwtStrategy` must stay in sync with the same secret.
- Signed-in customers can pay their own orders: checkout and order pages pass the caller
  through (`OptionalJwtGuard` → `getByIdForUser`); guest orders remain id-as-capability.
- `findItemsByIds` uses `inArray` (an `and`-chain of `eq` matched nothing for >1 id).
- Service facts live in `packages/shared/src/restaurant.ts` (hours, seats, party limit, phone)
  so the public site, the reservations form and the API cannot drift apart again.
- All service times are evaluated in the restaurant's timezone (`America/Los_Angeles`), not the
  server's; `restaurantInstant()` converts a wall-clock service time to an instant.
- Reservations are only accepted inside service hours (server-enforced), and the API's party
  limit matches the site's (8) instead of 20.
- Orders now require a contact block (name, email, phone) and may carry a requested pickup time;
  the guest's email is required because it is the receipt.
- The eyebrow/kicker label is kept only where it labels a section instead of repeating the
  heading (craft floor bans repeating kickers).
- `pnpm -r build` rewrites `apps/backend/dist` and kills a running API dev server — restart the
  API after a build.

## Notes
- Stripe test mode only for MVP.
- Google OAuth requires `GOOGLE_CLIENT_ID/SECRET`; button renders disabled if
  `NEXT_PUBLIC_GOOGLE_ENABLED !== "true"` on the web app.
- Neon storage bucket `menu-images` exists; uploads additionally need
  `STORAGE_ACCESS_KEY_ID`/`STORAGE_SECRET_ACCESS_KEY` from the Neon console.
- Seed users (override via `SEED_*` env): admin@emberandoak.test / staff@emberandoak.test.
- bcrypt works at runtime under pnpm's ignored-build-scripts policy (verified by login E2E).

## Phase 1 — Foundation [done]
- [x] 1.1 Monorepo + tooling
- [x] 1.2 Design tokens + layout shell
- [x] 1.3 Landing page (mock)
- [x] 1.4 Menu pages (mock)
- [x] 1.5 Auth pages (mock)
- [x] 1.6 Cart + checkout (mock)
- [x] 1.7 Reservations page (mock)
- [x] 1.8 Dashboard shell (mock)
- [x] 1.9 Dashboard menu (mock)
- [x] 1.10 Dashboard orders/reservations (mock)

## Phase 2 — Domain [code complete]
- [x] 2.1 DB schema + migrations (drizzle `0000_bored_callisto.sql`, idempotent seed)
- [x] 2.2 Auth API (register/login/refresh/logout/me + Google strategy)
- [x] 2.3 Route protection (global JwtAuthGuard/RolesGuard + dashboard layout role check)
- [x] 2.4 Menu API + public pages (fallback fixtures when API down)
- [x] 2.5 Image upload (presign endpoint + dropzone w/ URL fallback)
- [x] 2.6 Orders API (transactional create, server-side totals, status transitions)
- [x] 2.7 Reservations API (status transitions; conflict check deferred — log if needed)
- [x] 2.8 Dashboard wiring (server fetch + `revalidatePath` server actions)

## Phase 3 — Advanced [code complete]
- [x] 3.1 Stripe Checkout (503 STRIPE_NOT_CONFIGURED → demo flow to order page)
- [x] 3.2 Stripe webhook (raw body, signature verify, idempotent `markPaidBySessionId`)
- [x] 3.3 Customer order page `/orders/[id]` (status timeline, ownership via API)

## Phase 4 — Polish
- [x] 4.1 Empty/loading/error states
- [x] 4.2 Accessibility pass (focus rings, labels, aria, contrast via tokens)
- [x] 4.3 Responsive pass (mobile nav, dashboard → scrollable tables/cards)
- [x] 4.4 Seed + demo data (real imagery in fixtures + seed)
- [x] 4.5 Final verification — `pnpm -r build` green; live E2E against Neon verified:
      login/session cookies, menu reads, guest + signed-in order create, status transitions,
      checkout (`STRIPE_NOT_CONFIGURED` → demo redirect), presign (`STORAGE_NOT_CONFIGURED`),
      guest reservation create, staff reservation list, full browser cart→checkout→order page flow.

## Verification log — Phase 5 (live, against Neon)
- Build: `pnpm -r build` green — 15 routes (adds `/orders`, `/api/session/refresh`).
- Detector: `impeccable.cmd detect --json apps/frontend/src` → `[]`, exit 0.
- Browser (1440 + 390): guest header shows Sign in and no Dashboard; `/dashboard` → 
  `/login?next=/dashboard`; staff login → `/dashboard` with no marketing chrome; customer
  login → `/` with name + Sign out; customer → `/dashboard` → `/`; reservation submit →
  "Your table is held"; checkout → order page with pickup/contact; "Mark paid" pending→paid;
  no horizontal overflow at 390px on checkout or the dashboard.
- Type loading was verified in the restaurant timezone (`America/Los_Angeles`) while the test
  machine runs GMT+3 — the default reservation slot resolves to Tuesday 5pm restaurant time.
