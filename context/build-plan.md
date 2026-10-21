# Build Plan

Each ticket is vertical: **UI + Logic + API contract**, visible and testable. Verify every ticket with `npm run build` (both apps). Branch per ticket.

## Phase 1 — Foundation (mock-first UI)
| # | Ticket | UI | Logic | API Contract |
|---|---|---|---|---|
| 1.1 | Monorepo + tooling | — | pnpm workspaces, TS strict, ESLint, Prettier, env validation, `.env.example` | — |
| 1.2 | Design tokens + layout shell | `globals.css` tokens, Tailwind theme, fonts, `SiteHeader`, `SiteFooter`, `Button`/`Card`/`Input`/`Badge` from shadcn | Theme provider | — |
| 1.3 | Landing page (mock) | Hero, featured dishes, hours, CTA — static data | — | — |
| 1.4 | Menu pages (mock) | `/menu` grid + category filter, `/menu/[slug]` detail | Static fixtures from `packages/shared` | — |
| 1.5 | Auth pages (mock) | `/login`, `/register`, Google button (disabled state) | Form validation with Zod | — |
| 1.6 | Cart + checkout (mock) | `/cart`, `/checkout` summary, empty/loading states | Local cart state (context + localStorage) | — |
| 1.7 | Reservations page (mock) | Form: name, email, phone, party size, date/time | Zod validation | — |
| 1.8 | Dashboard shell (mock) | Sidebar, header, KPI cards | Role-aware nav | — |
| 1.9 | Dashboard menu (mock) | Table + create/edit dialog + image dropzone | Local state | — |
| 1.10 | Dashboard orders/reservations (mock) | Lists with status badges + transitions | Local state | — |

## Phase 2 — Domain (real API)
| # | Ticket | UI | Logic | API Contract |
|---|---|---|---|---|
| 2.1 | DB schema + migrations | — | Drizzle schema, seed (categories, items, tables) | — |
| 2.2 | Auth API | Wire `/login`, `/register`, Google button | bcrypt, JWT cookies, refresh rotation, Google strategy | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/me` |
| 2.3 | Route protection | Middleware + dashboard layout role check | `JwtAuthGuard`, `RolesGuard` | `401` / `403` with error codes |
| 2.4 | Menu API + public pages | Replace fixtures with fetch | CRUD, slug generation, availability | `GET /menu/categories`, `GET /menu/items?category=`, `GET /menu/items/:slug`, `POST/PATCH/DELETE /menu/items` (staff+), `POST /menu/categories` (admin) |
| 2.5 | Image upload | Dropzone → presign → PUT → save | Presign endpoint, role check, size/type limits | `POST /storage/presign` → `{ uploadUrl, url, key }` |
| 2.6 | Orders API | Checkout button creates order | Cart → order + items in transaction, totals server-side | `POST /orders`, `GET /orders/me`, `GET /orders` (staff), `PATCH /orders/:id/status` (staff) |
| 2.7 | Reservations API | Submit form, confirmation state | Create, list, status transitions, conflict check (table/time) | `POST /reservations`, `GET /reservations` (staff), `PATCH /reservations/:id/status` (staff) |
| 2.8 | Dashboard wiring | Menu/orders/reservations use API | Server fetch + `revalidatePath` after mutations | — |

## Phase 3 — Advanced (payments)
| # | Ticket | UI | Logic | API Contract |
|---|---|---|---|---|
| 3.1 | Stripe Checkout | Redirect to Stripe, success/cancel pages | Create session with server totals, store `stripe_session_id` | `POST /payments/checkout` → `{ url }` |
| 3.2 | Stripe webhook | Order status reflects `paid` | Raw-body route, signature verify, idempotent update | `POST /payments/webhook` |
| 3.3 | Customer order page | `/orders/[id]` with status timeline | Ownership check | `GET /orders/:id` |

## Phase 4 — Polish
| # | Ticket | UI | Logic | API Contract |
|---|---|---|---|---|
| 4.1 | Empty/loading/error states | Skeletons, empty states, error boundaries | — | — |
| 4.2 | Accessibility pass | Focus rings, labels, contrast, keyboard nav | — | — |
| 4.3 | Responsive pass | Mobile nav sheet, dashboard tables → cards | — | — |
| 4.4 | Seed + demo data | Demo images + realistic menu | Seed script idempotent | — |
| 4.5 | Final verification | — | `npm run build` both apps, lint, manual flow | — |

## Definition of Done (per ticket)
- UI matches `ui-rules.md`, uses tokens only, all states implemented.
- API returns `{ success, data }` envelope; validation + guards in place.
- `npm run build` passes for web and api.
- `context/ui-registry.md` updated; `context/progress-tracker.md` checkbox ticked.
