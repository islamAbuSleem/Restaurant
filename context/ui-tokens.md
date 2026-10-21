# UI Tokens

## Rule: no hardcoded hex in code
All colors come from CSS variables in `apps/frontend/src/styles/globals.css`, consumed via Tailwind theme (`bg-background`, `text-foreground`, `border-border`, etc.). Hex values appear **only** in `globals.css`.

## Service facts (not colors, but the same discipline)
Hours, seat counts, party limits, phone number, address, collection point, timezone and tax
policy are **data, not code**: they live in the `restaurants` / `restaurant_hours` tables and
reach the app through `GET /restaurants/current` (`lib/data/restaurant.ts` on the web side).
`packages/shared/src/restaurant.ts` is now only the *service-hours library* (timezone maths,
slot generation, display rows) — it holds no restaurant's facts. Never hard-code a number that
belongs to a restaurant.

## Font tokens
```css
:root {
  --font-heading: var(--font-fraunces), Georgia, "Times New Roman", serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
}
```
`--font-fraunces` / `--font-inter` are set by `next/font` on the `<html>` element (both root
layouts). They must stay on `<html>`: the tokens above are declared on `:root`, and a custom
property declared on `<body>` is invisible to `:root`, which silently drops the fonts.

## Tailwind theme mapping
`@theme inline` maps `--color-*` to `hsl(var(--token))` and `--font-display` / `--font-sans` to
`--font-heading` / `--font-body`.

## Spacing / Radius / Type
- Spacing scale: Tailwind default (4px base).
- Radius: `var(--radius)` (0.5rem) for controls; cards use `rounded-xl` (12px); pills are `rounded-full`.
- Type scale: `text-sm` body-sm, `text-base` body, `text-2xl` h3, `text-4xl` h2, `text-6xl` h1 hero.
- Type steps are the ones in `DESIGN.md` — use `text-xs`/`text-sm`/`text-base`/`text-lg`/`text-xl`/
  `text-3xl`/`text-4xl`/`text-5xl`/`text-6xl`/`text-7xl`, never arbitrary pixel sizes. The
  detector enforces this against `DESIGN.md`.
- Body measure 65–75ch. Tracking floor -0.04em.
