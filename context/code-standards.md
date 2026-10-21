# Code Standards

## TypeScript
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- **No `any`.** Use `unknown` + narrowing, or a Zod schema.
- Prefer `type` for object shapes, `interface` for extendable contracts.
- All exported functions have explicit return types in the API app.

## Modules
- **Named exports only** (except Next.js pages/layouts which require default exports).
- `@/` alias → `src/` in web; `src/` in api.
- No barrel files beyond `index.ts` at module roots.

## API Responses
Every controller returns:
```ts
{ success: true, data: T }
{ success: false, error: { code: string, message: string } }
```
Implemented once via `ResponseInterceptor` + `HttpExceptionFilter`; controllers return raw data.

## Errors
- Wrap all route handlers / service calls in `try/catch`.
- Log with route prefix: `console.error("[POST /orders] ...", err)` or Nest `Logger` with context `OrdersService`.
- Never leak stack traces or DB errors to clients.
- Validation via `class-validator` DTOs on API; Zod on web forms and in `packages/shared`.

## Database
- Parameterized queries only (Drizzle/Prisma — no string-concatenated SQL).
- Migrations committed; never edit applied migrations.
- UUID v4 primary keys, `timestamptz` for dates, integer cents for money.
- Transactions for multi-table writes (order + order_items).

## Security
- Passwords: bcrypt cost 12. Never log tokens or secrets.
- Cookies: `httpOnly`, `secure` in prod, `sameSite=lax`.
- Validate Stripe webhook signatures before any DB write.
- Presigned uploads: verify role before generating; limit content-type to images; key prefix `menu/`.
- CORS: allow only `WEB_ORIGIN`; `credentials: true`.

## Env
- Never commit `.env`. Provide `.env.example` per app.
- Access env via a validated config module; fail fast on missing vars.

## Git
- Branch per feature (`feat/menu-crud`). Never commit to `main`.
- Conventional commits. Do not commit or push until user approves.
