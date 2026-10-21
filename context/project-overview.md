# Project Overview

## About
A full-stack restaurant web app with a public menu and reservation flow, plus a protected dashboard for staff and admins to manage menu items, orders, and reservations.

## Problem
Restaurants need one system where customers browse the menu, reserve a table, and order online, while staff manage operations without spreadsheets or separate tools.

## Stack Summary
Next.js 16 (App Router, TS strict, Tailwind, shadcn/ui) + NestJS v11 API + Neon Postgres + Stripe Checkout + Neon object storage.

## Pages / Routes
| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing: hero, featured dishes, hours, CTA |
| `/menu` | Public | Category-filtered menu grid |
| `/menu/[slug]` | Public | Item detail: image, description, price, add to cart |
| `/cart` | Public | Cart review, quantity edit |
| `/checkout` | Customer | Stripe Checkout redirect |
| `/reservations` | Public | Reservation form (date, time, party size) |
| `/login` | Public | Email/password + Google OAuth |
| `/register` | Public | Email/password signup |
| `/dashboard` | Staff + Admin | KPI overview |
| `/dashboard/menu` | Staff + Admin | CRUD menu items + image upload |
| `/dashboard/orders` | Staff + Admin | Order list, status transitions |
| `/dashboard/reservations` | Staff + Admin | Reservation list, confirm/cancel |

## User Flows
1. **Browse**: Home → Menu → Item detail → Add to cart.
2. **Order**: Cart → Checkout → Stripe hosted page → webhook marks order paid → confirmation.
3. **Reserve**: Reservations → submit form → pending → staff confirms in dashboard.
4. **Manage**: Login → Dashboard → update menu/orders/reservations.
5. **Auth**: Email/password or Google OAuth → JWT stored in httpOnly cookie → role-gated dashboard.

## Roles
- **Customer**: browse, order, reserve, view own orders.
- **Staff**: dashboard read/write for orders and reservations; no menu deletion, no user management.
- **Admin**: full dashboard access including menu CRUD and staff management.

## In Scope (MVP)
- Public menu with categories, item detail, images.
- Cart + Stripe Checkout (test mode) + webhook.
- Reservations with staff confirmation.
- JWT auth (email/password + Google OAuth), role-based route guards.
- Dashboard: menu CRUD, order status, reservation status, KPI cards.
- Image upload to Neon object storage via presigned URLs.

## Out of Scope (Deferred)
- Online payments beyond Stripe Checkout, refunds, and partial payments.
- Delivery tracking and driver assignment.
- Loyalty/rewards, coupons, gift cards.
- Multi-language and multi-currency.
- Real-time order updates (polling/manual refresh only).
- Mobile native apps.

## Success Criteria
- Customer can browse menu, add to cart, pay via Stripe test mode, and see a paid order.
- Customer can submit a reservation and staff can confirm it.
- Staff/admin can log in (email or Google), manage menu/orders/reservations.
- Unauthenticated users cannot access `/dashboard/*`; customers cannot access staff actions.
- `npm run build` passes for both apps; no TypeScript `any`; no hardcoded hex in components.
