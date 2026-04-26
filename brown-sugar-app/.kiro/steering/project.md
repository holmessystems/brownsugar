---
inclusion: always
---

# Brown Sugar App — Project Steering

## What This Is

A small-batch cinnamon roll ordering app for a Houston-area home bakery. Customers browse products, select flavors, pick a drop location/time, and pay via Square. An admin dashboard at `/admin` lets the owner manage inventory, pickup options, and sold-out status.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 — functional components and hooks only |
| Build | Vite 8, ESM (`"type": "module"` project-wide) |
| Styling | Plain CSS (`src/index.css`) — no Tailwind, no CSS-in-JS |
| State | React Context (`CartContext`) — no external state library |
| API | Vercel serverless functions (`api/*.js`) — Node.js ESM, no framework |
| Payments | Square Web Payments SDK (client) + Square REST API (server) |
| Persistence | `@vercel/blob` for admin settings |
| Deployment | Vercel (config in `vercel.json`) |
| Testing | Vitest + jsdom + Testing Library + fast-check |

## Project Layout

```
api/                  # Vercel serverless handlers (Node.js ESM)
  create-payment.js   # Square order + payment charge
  admin-settings.js   # GET/POST settings via @vercel/blob
  admin-login.js      # Password check (ADMIN_PASSWORD env var)
  admin-location.js   # Location/event management
  send-confirmation.js
  __tests__/          # API unit tests

src/
  App.jsx             # Root — detects /admin path, renders either AdminDashboard or storefront
  context/
    CartContext.jsx   # Global state: cart, checkout, toast, pickup options, sold-out flag
  components/         # One component per file, default export
  data/               # Static seed data (siteConfig.json, products.js, popUpEvents.json)
  hooks/
    useSquarePayment.js
  __tests__/          # Component/hook tests
```

## Key Conventions

### Components
- Functional components with hooks only; no class components
- Default export per file
- `useCart()` is the hook to access `CartContext` — do not read context directly

### API Handlers
- Each file: `export default async function handler(req, res) { ... }`
- Always validate `req.method` first; return `405` for unsupported methods
- Never leak secrets — `ADMIN_PASSWORD` and `SQUARE_ACCESS_TOKEN` are server-only; `VITE_` prefix = public

### Payments & Money
- Amounts sent to Square are in **cents** (integer); display to users as dollars
- Map Square error codes to friendly messages (see `friendlyPaymentError` in `create-payment.js`)
- Use `randomUUID()` from `node:crypto` for idempotency keys

### Data Flow
- `siteConfig.json` provides UI defaults (order cap, pickup options)
- On mount, `CartContext` fetches `/api/admin-settings` and overlays live data over those defaults
- Admin writes settings back via `POST /api/admin-settings`; data stored in `@vercel/blob`

### Testing
- Mock `fetch` with `vi.fn()` in `beforeEach`; call `vi.clearAllMocks()` after each test
- Wrap `renderHook` in `CartProvider` when testing context consumers
- Use `fast-check` for cart/flavor combination invariants (see `CartContext.test.jsx` for patterns)
- Tests: `npm test` (single pass via `vitest run`)

## Hard Rules

- No routing library — admin is detected via `window.location.pathname === '/admin'`
- No Node built-ins (`crypto`, `fs`, etc.) imported inside `src/` — server-only modules stay in `api/`
- No `console.log` in production code
- Never store card data, CVV, or full PANs anywhere — tokenization only via Square SDK
- Do not add features not asked for; keep components focused on their single responsibility
