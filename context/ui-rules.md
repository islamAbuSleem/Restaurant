# UI Rules

## Rendering
- **Server Components by default.** Add `"use client"` only for interactivity (cart, forms, filters, dialogs).
- Data fetching happens in Server Components via `fetch` to the NestJS API with `credentials: "include"`; mutations use Server Actions or route handlers.
- No client-side data libraries for MVP (no React Query/SWR) — use server fetch + `router.refresh()`.

## Components
- **One component per file.** File name = component name in kebab-case (`menu-item-card.tsx`), export = PascalCase (`MenuItemCard`).
- shadcn/ui primitives live in `src/components/ui/`; feature components in `src/components/<feature>/`.
- Shared types/schemas imported from `packages/shared`; never duplicate DTO types.
- Images: always `next/image`, with `width`/`height` or `fill` + sized parent.

## Layout
- Mobile-first. Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- Public pages use a shared `SiteHeader` + `SiteFooter`; dashboard uses `DashboardSidebar` + `DashboardHeader`.
- Dashboard is responsive: sidebar collapses to a sheet under `lg`.

## Accessibility
- Every interactive element has a visible focus ring (`focus-visible:ring-2 ring-ring`).
- Form fields always have `<Label>` + `aria-describedby` for errors.
- Color is never the only signal (status badges include text).
- Minimum contrast 4.5:1 for text.

## States (required per screen)
- Loading: skeleton components, not spinners on full pages.
- Empty: icon + message + primary action.
- Error: inline message + retry action.

## Copy
- Sentence case for buttons and headings ("Add to cart", "Reserve a table").
- Prices formatted `$12.50` via `Intl.NumberFormat`.
- Dates via `Intl.DateTimeFormat` with restaurant locale (default `en-US`).
