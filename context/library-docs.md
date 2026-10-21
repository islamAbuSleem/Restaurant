# Library Docs

Project-specific patterns. Read before writing integration code.

## Neon Postgres (NestJS)
- Use `pg` `Pool` in a `DatabaseModule` with `@nestjs/config`; connection string from `DATABASE_URL` (pooled).
- For migrations use Drizzle Kit (`drizzle-orm` + `drizzle-kit`) — schema in `apps/api/src/database/schema.ts`.
- Always parameterized:
```ts
await db.select().from(menuItems).where(eq(menuItems.slug, slug));
```
- Transactions for order creation:
```ts
await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders).values({...}).returning();
  await tx.insert(orderItems).values(items.map(i => ({ ...i, orderId: order.id })));
});
```
- `timestamptz` for all dates; store money as integer cents.

## Neon Object Storage (S3-compatible)
- Backend creates presigned URLs with `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`:
```ts
const cmd = new PutObjectCommand({ Bucket: "menu-images", Key: `menu/${uuid}.${ext}`, ContentType });
const url = await getSignedUrl(s3, cmd, { expiresIn: 300 });
```
- Web uploads directly with `fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })`.
- Persist **both** `image_url` (public URL) and `image_key` (for deletion) on `menu_items`.
- Only `staff|admin` may request an upload URL. Max 5MB, `image/jpeg|png|webp`.

## Auth (NestJS)
- `@nestjs/jwt` + `@nestjs/passport`, `passport-jwt`, `passport-google-oauth20`.
- Hash with `bcrypt` cost 12. OAuth-only users have `password_hash = null`.
- Tokens in httpOnly cookies (`access_token` 15m, `refresh_token` 7d). Refresh rotates and invalidates old token (store hash in `refresh_tokens` or bump `token_version`).
- JWT payload: `{ sub: userId, role, email }`.
- Guards: `JwtAuthGuard` (global, opt-out via `@Public()`), `RolesGuard` with `@Roles('staff','admin')`.
- Google callback redirects to `${WEB_ORIGIN}/dashboard` after setting cookies.

## Stripe
- Server-side only: `new Stripe(process.env.STRIPE_SECRET_KEY!)`.
- Checkout session creation (in orders service):
```ts
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: items.map(i => ({
    quantity: i.quantity,
    price_data: { currency: "usd", unit_amount: i.priceCents,
      product_data: { name: i.nameSnapshot } },
  })),
  success_url: `${WEB_ORIGIN}/orders/${order.id}?status=success`,
  cancel_url: `${WEB_ORIGIN}/cart`,
  metadata: { orderId: order.id },
});
```
- Webhook: mount `POST /payments/webhook` with **raw body** (`bodyParser: false` for that route), verify with `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`, then mark order `paid` idempotently by `stripe_session_id`.
- Webhook must be `@Public()` and must never trust the client.

## Next.js 16
- Server Components fetch the API directly with `headers()` forwarding cookies.
- Mutations via Server Actions; revalidate with `revalidatePath`.
- Protected routes: middleware checks presence of `access_token` cookie and redirects to `/login`; role checks happen in layout Server Components (call `GET /auth/me`).
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_ENABLED`.

## Shared Package
- Zod schemas define request/response shapes; infer TS types with `z.infer`.
- Export from `packages/shared/src/index.ts`; both apps import via workspace path.
