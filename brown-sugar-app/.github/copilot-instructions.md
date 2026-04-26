# Brown Sugar App — Project Guidelines

## Stack

- **Frontend**: React 19 (JSX, functional components, hooks only — no class components)
- **Build**: Vite 8, ESM throughout (`"type": "module"` in package.json)
- **Styling**: Plain CSS via `index.css` — no CSS-in-JS, no Tailwind
- **State**: React Context (`CartContext`) — no Redux or external state library
- **API**: Vercel serverless functions under `api/` (Node.js ESM, no framework)
- **Payments**: Square Web Payments SDK + Square Orders/Payments REST API
- **Storage**: `@vercel/blob` for admin settings persistence
- **Deployment**: Vercel — routes defined in `vercel.json`

## Architecture

- `src/components/` — page sections and UI components (one component per file)
- `src/context/CartContext.jsx` — single global context; exposes cart, checkout, toast, pickup, and product state
- `src/data/` — static seed data (`products.js`, `siteConfig.json`, `popUpEvents.json`); runtime data is fetched from `/api/admin-settings` on mount and overlays these defaults
- `src/hooks/useSquarePayment.js` — Square Web SDK integration hook
- `api/` — serverless endpoints; each file exports a default `async (req, res)` handler
- Admin UI lives at `/admin` (detected via `window.location.pathname`), rendered by `AdminDashboard`

## Conventions

- **Named exports** for context hooks (`useCart`); **default exports** for components and API handlers
- API handlers must validate `req.method` and return early with `405` for wrong methods
- Never expose `ADMIN_PASSWORD`, `SQUARE_ACCESS_TOKEN`, or other secrets to the client; env vars prefixed `VITE_` are public
- Square API errors must be mapped to user-friendly messages (see `api/create-payment.js` → `friendlyPaymentError`)
- All monetary values are in **cents** when sent to Square; display in dollars (`price / 100`)
- `siteConfig.json` holds UI-level defaults (order cap, pickup options); admin-settings API is the runtime source of truth

## Testing

- **Runner**: Vitest with jsdom environment
- **Libraries**: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- **Property-based**: `fast-check` for cart/flavor combination invariants
- Test files live in `src/__tests__/` (components/hooks) and `api/__tests__/` (serverless handlers)
- Mock `fetch` globally with `vi.fn()` in `beforeEach`; restore with `vi.clearAllMocks()`
- Wrap `renderHook` calls in `CartProvider` when testing context consumers
- Run tests: `pnpm test` or `npm test` (alias for `vitest run`)

## Build & Dev

```
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run test      # Vitest run (single pass)
npm run lint      # ESLint
```

## Do Not

- Do not add a routing library — admin detection uses `window.location.pathname`
- Do not add `console.log` statements to production code
- Do not import server-only modules (Node built-ins like `crypto`, `fs`) in `src/` files
- Do not store card data or PII in blob storage or logs
