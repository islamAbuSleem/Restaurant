# UI Registry

Track every component built. Update after each ticket.

## Primitives (`src/components/ui`) — ticket 1.2
| Component | Path | Used In | Status |
|---|---|---|---|
| Button (variants: default/secondary/outline/ghost/destructive/link; sizes sm/default/lg/icon) | `ui/button.tsx` | everywhere | done |
| Card / CardHeader / CardTitle / CardContent (12px radius, border only) | `ui/card.tsx` | menu, cart, checkout, dashboard | done |
| Input / Textarea / Label / Select | `ui/input.tsx`, `ui/textarea.tsx`, `ui/label.tsx`, `ui/select.tsx` | forms | done |
| Badge (default/secondary/outline/success/warning/destructive) | `ui/badge.tsx` | statuses, dashboard | done |
| Dialog (Radix) | `ui/dialog.tsx` | menu item form | done |
| Table family | `ui/table.tsx` | dashboard menu | done |
| Separator / Skeleton / EmptyState / SectionHeading (`as` prop for h1/h2) | `ui/*.tsx` | cart, dashboard, sections | done |

## Site shell — ticket 1.2–1.3, phase 5
| Component | Path | Used In | Status |
|---|---|---|---|
| SiteHeader (client; session-aware: Sign in / user + Sign out / Dashboard for staff; mobile drawer) | `components/site/site-header.tsx` | `(site)` root layout | done |
| SiteFooter | `components/site/site-footer.tsx` | `(site)` root layout | done |
| Home sections (hero, featured, story, hours, CTA) | `components/site/home-sections.tsx` | `/` | done |
| ReservationForm (service-window validation, real confirmation, a11y-linked errors) | `components/site/reservation-form.tsx` | `/reservations` | done |
| DemoNotice (hidden in production) | `components/shared/demo-notice.tsx` | checkout, order page | done |

## Menu & cart — tickets 1.4, 1.6, phase 5
| Component | Path | Used In | Status |
|---|---|---|---|
| MenuGrid (category filter, `aria-pressed` group, sr-only h2) | `components/menu/menu-grid.tsx` | `/menu` | done |
| MenuItemCard | `components/menu/menu-item-card.tsx` | `/menu`, home featured | done |
| AddToCartButton | `components/menu/add-to-cart-button.tsx` | menu card, detail | done |
| CartProvider (localStorage key `ember-oak-cart`) | `components/cart/cart-provider.tsx` | `(site)` root layout | done |
| CartButton (header count) | `components/cart/cart-button.tsx` | header | done |
| CartView (single honest total, no tax promise) | `components/cart/cart-view.tsx` | `/cart` | done |
| CheckoutForm (contact + pickup slot + collection point; summary above CTA on mobile) | `components/cart/checkout-form.tsx` | `/checkout` | done |
| OrderSummary (shared by mobile + desktop checkout) | `components/cart/order-summary.tsx` | `/checkout` | done |

## Auth & orders — ticket 1.5, phase 5
| Component | Path | Used In | Status |
|---|---|---|---|
| AuthForm (login/register, Zod-aligned validation, `next` support, role-aware redirect) | `components/auth/auth-form.tsx` | `/login`, `/register` | done |
| GoogleButton (disabled unless NEXT_PUBLIC_GOOGLE_ENABLED) | `components/auth/google-button.tsx` | auth form | done |
| SignOutButton (icon or label, clears the session and returns to `/`) | `components/auth/sign-out-button.tsx` | header, dashboard sidebar, dashboard top bar | done |
| SessionRefresh (revives an expired access token from the refresh cookie) | `components/auth/session-refresh.tsx` | `(site)` root layout | done |
| OrderStatusLive (20s poll, "Checked HH:MM", manual Refresh) | `components/orders/order-status-live.tsx` | `/orders/[id]` | done |

## Dashboard — tickets 1.8–1.10, phase 5
| Component | Path | Used In | Status |
|---|---|---|---|
| DashboardSidebar / DashboardMobileNav | `components/dashboard/*.tsx` | `/dashboard/*` | done |
| StatCard (no fake trend badges) | `components/dashboard/stat-card.tsx` | `/dashboard` | done |
| OrderRow (status transitions with surfaced failures, guest contact + pickup) | `components/dashboard/order-row.tsx` | `/dashboard/orders` | done |
| ReservationRow (confirm/seat/cancel with surfaced failures) | `components/dashboard/reservation-row.tsx` | `/dashboard/reservations` | done |
| MenuTable (edit/delete) | `components/dashboard/menu-table.tsx` | `/dashboard/menu` | done |
| MenuItemFormDialog | `components/dashboard/menu-item-form-dialog.tsx` | menu table | done |
| ImageUploadField (presign → PUT → {url,key}; URL fallback) | `components/dashboard/image-upload-field.tsx` | menu dialog | done |

## Conventions
- All colors via tokens (`globals.css`); no hex outside that file.
- Restaurant facts (hours, seats, party limit, phone, address, collection point, timezone) come
  from the `restaurants` / `restaurant_hours` tables via `lib/data/restaurant.ts`; components
  that need them take them as props (`RestaurantProfile`, `hours`, `timeZone`,
  `collectionPoint`) rather than importing constants.
- Icons: lucide-react only, `aria-hidden` when decorative.
- Focus: `focus-visible:ring-2 ring-ring ring-offset-2` on all interactive elements.
- Status variants centralized in `lib/status.ts` (orders) and inline maps (reservations).
- Fonts: Fraunces (headings) + Inter (body) declared on `<html>` so the `:root` tokens resolve;
  `--font-heading` / `--font-body` in `globals.css` are the only font tokens.
- Times shown to the restaurant use `formatRestaurantDate` (America/Los_Angeles); guest-local
  times use `formatDate`.
- Small type floor is 11px; eyebrows are used only when they label a section, not repeat a heading.
- Browser surfaces (selection, caret, scrollbars, tabular numerals) are themed in `globals.css`.
- Route groups: `(site)` owns the public shell, `(dashboard)` owns the staff shell; each has its
  own root layout and `<main>` landmark.
