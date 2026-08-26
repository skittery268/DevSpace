# DevSpace — client

Next.js (App Router) + TypeScript frontend for the DevSpace marketplace API in
[`../server`](../server).

## Running it

The backend's `CLIENT_URL` is `http://localhost:3001` and its CORS policy allows
exactly that origin, so the client must run on port 3001 (the `dev` and `start`
scripts already pass `--port 3001`).

```bash
cp .env.example .env.local   # then point NEXT_PUBLIC_API_URL at the backend
npm install
npm run dev                  # http://localhost:3001
```

Start the API first, from `../server`: `node app.js` (it listens on `PORT`,
`3000` by default).

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the build on port 3001 |
| `npm run lint` | ESLint |
| `npm run typecheck` | Regenerate route types, then `tsc --noEmit` |

## How it is organised

```
src/
├── app/          Routes. Pages are Server Components that mount a client view.
├── components/   UI primitives (ui/) and per-domain presentation.
├── features/     TanStack Query hooks — one folder per domain.
├── services/     Axios calls. The only place a URL is written.
├── store/        Zustand: session mirror, cart, wishlist, theme, toasts.
├── types/        Backend document shapes plus the flat view models.
├── lib/          Mappers, permissions, validation schemas, error handling.
└── providers/    Query client, session bootstrap, theme.
```

Two rules keep it navigable: a URL only ever appears in `services/`, and the
shape difference between what the API returns and what the UI renders is
resolved in `lib/mappers.ts` — never in a component.

## The design system

Everything visual comes from one token layer in `app/globals.css`. Components
never reach for a raw palette entry.

- **`ink-*` is the neutral ramp, expressed as distance from the page**: `ink-50`
  sits against the background, `ink-900` is the strongest text. Dark mode
  redefines the ramp rather than the components, so `text-ink-900` still means
  "the strongest text" in both themes and almost nothing needs a `dark:` variant.
- **`brand-*` keeps its hue in both themes**, because `bg-brand-600` always
  carries white text. Anything that has to *read* as brand-coloured text uses
  `text-link`, which does flip.
- **Surfaces, lines, status tones and scrims are semantic tokens** — `bg-surface`,
  `bg-surface-2`, `border-ink-200`, `bg-danger-soft`, `bg-scrim/60`. A scrim is
  deliberately outside the neutral ramp: `ink-900` inverts to near-white in dark,
  which would turn every image overlay and modal backdrop into a white sheet.
- **Elevation is `elev-1…3`, not `shadow-sm…lg`.** Tailwind inlines `--shadow-*`
  theme keys at build time, so a shadow that changes per theme has to travel
  through custom properties of its own.

`Reveal`, the scroll-in wrapper, stores its state on the DOM node as a
`data-reveal` attribute. Markup ships with no attribute at all, so content stays
visible when JavaScript never runs, and `prefers-reduced-motion` drops the
offset in CSS.

### Theme

`store/theme.store.ts` holds `light | dark | system` (default `system`),
persisted to `devspace-theme`. `providers/ThemeProvider.tsx` keeps the `dark`
class on `<html>` in step with it and follows the OS while the preference is
`system`. The class is already correct on arrival: `app/layout.tsx` inlines
`themeBootstrapScript`, which reads the same storage key before the first paint.
Both halves must agree on that key and on the shape `persist` writes.

## Things about the backend worth knowing

- **Auth is an httpOnly `at` cookie.** There is no token to store; `withCredentials`
  is on and `GET /auth/me` is the only way to learn who is signed in.
- **There is no cart on the server.** It lives in `store/cart.store.ts`, persisted
  to localStorage, and is turned into `userOrder: [{ id, quantity }]` at checkout.
- **There is no wishlist on the server either.** `store/wishlist.store.ts` mirrors
  the cart's shape and keeps a full mapped `Product` per entry, which is what lets
  the wishlist page render the same `ProductCard` as every other grid, reuse the
  cart's entry point for "add to cart", and open without firing a request. Prices
  and stock in those snapshots are a display hint, exactly like the cart's.
- **Orders are created by the Stripe webhook**, not by the client. `/success` is a
  plain redirect target with no session id, so it cannot confirm anything itself.
- **Product fields live under `universal.*`** in the database while every request
  payload is flat, and a review's rating and text live in two collections. Both
  are flattened by `lib/mappers.ts`.
- **Search requires a session** and returns every match unpaginated. `/search`
  therefore pages and filters the results client-side (`lib/product-filters.ts`);
  that code must never be pointed at `GET /product`, whose pages come from the
  server.
- **There is no stored average rating and no sort parameter on the catalog.** The
  product page averages the reviews it actually loaded, and the home page's "most
  reviewed" shelf ranks the page of products it already fetched — both say so in
  their copy rather than implying a global figure.

`lib/permissions.ts` mirrors the server's role gates so the UI never offers an
action that would 403. It is not a security boundary — the API is.
