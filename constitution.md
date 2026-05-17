# Star Multi-Tenant Restaurant App — Constitution

## Core Principles

### I. Multi-Tenant Data Isolation
Every restaurant is a tenant with full data isolation enforced by `restaurant_id` on all entities (menu_items, orders, settings, tables, dining_sessions, promos, visitors). No cross-tenant data leakage. Tenant identity is resolved from URL query parameter (`?restaurant_id=`) on the client side.

### II. Mode-First Architecture
The app supports three restaurant operating modes — `to-go` (pickup/delivery), `dine-in` (QR table ordering), and `both`. The mode is stored per-restaurant in `settings.mode` and determines the entire customer flow: view composition, checkout paths, table selection workflow, and bill/payment lifecycle. Mode selection happens at tenant provisioning, not at runtime.

### III. Repository Pattern with Contract Interfaces
All data access goes through repository abstractions defined in `src/data/contracts/*.ts` with PocketBase implementations in `src/data/pocketbase/*.ts`. The contract layer is the source of truth for data operations. Mappers (`src/data/pocketbase/mappers.ts`) handle schema translation between the DB and the UI type system. Direct DB access from feature code is prohibited.

### IV. Database-Driven Theming (NON-NEGOTIABLE)
Every restaurant's visual identity — primaryColor, secondaryColor, accentColor, backgroundColor, logoUrl, googleFont — is stored in `settings` and loaded at runtime. No hardcoded brand colors in CSS or components. The theme resolves via `src/hooks/useTheme.ts` and `src/core/uiSettings.ts`. UI text overrides live in `settings.uiText` with safe defaults.

### V. Progressive Web App (PWA) First
The app is designed as a mobile-first PWA with `vite-plugin-pwa`. Service worker caching uses NetworkFirst for API routes and CacheFirst for images. Offline resilience is required for menu browsing. The app is installable (manifest.json) and must work as a standalone app on mobile devices.

### VI. Dual Routing via URL Mode + Restaurant ID
All app state is driven by URL query parameters. `mode` selects the view layer: `customer` (default), `admin`, `data`, `dashboard`. `restaurant_id` selects the tenant. There is no client-side router library — URL params drive conditional view rendering in `App.tsx`. This keeps the architecture simple and deployable as a single-page app on any static host.

### VII. Real-Time Order Flow
Orders use real-time subscriptions (`subscribeToOrders` via PocketBase/InsForge WebSocket) to push status changes from kitchen to customer view without polling. Order lifecycle is a defined status pipeline: `recibido → preparando → empaquetando → listo → en_camino → entregado` (delivery) or `recibido → paid` (pickup), plus `pendiente_pago`, `cancelled`.

### VIII. Dine-In Lifecycle as First-Class Flow
Dine-in has its own end-to-end lifecycle: QR scan → restaurant info display → table selection → menu ordering → kitchen fulfillment → bill request → split bill → payment. Dedicated types (`DiningSession`, `BillRequest`, `BillPayment`, `DineInStage`) and feature module (`src/features/dinein/`) handle this flow independently of the To-Go path.

## Technology Stack & Constraints

### Frontend
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6 + SWC
- **Styling**: TailwindCSS 3
- **PWA**: vite-plugin-pwa with Workbox service worker
- **Icons**: lucide-react
- **State**: React hooks + context (no Redux/Zustand)

### Backend (Migration in Progress)
- **Legacy**: PocketBase (SQLite, local `pocketbase/pb_data/`)
- **Target**: InsForge (via `@insforge/sdk` and `@insforge/cli`)
- **Collections**: restaurants, menu_items, orders, settings, tables, dining_sessions, bill_requests, promos, visitors
- **Auth**: PocketBase auth (legacy), InsForge Auth with GitHub + Google OAuth (target)

### Deployment
- **Frontend**: Vercel (static SPA) or Docker container
- **Backend**: Fly.io (PocketBase), InsForge cloud (target)
- **Database**: SQLite via PocketBase (legacy), InsForge managed (target)

### Development Conventions
- TypeScript strict mode. All data shapes defined in `src/core/types.ts` and re-exported via `types.ts`.
- Feature modules under `src/features/<name>/` are self-contained with their own components and logic.
- Shared utilities live in `src/core/` (pure logic) and `src/hooks/` (React hooks).
- Environment config via `.env` files with `VITE_` prefix. No hardcoded URLs, keys, or credentials.
- PocketBase schema definition in `pocketbase-schema.json` is the single source of truth.

## Quality Gates

- Build must pass (`npm run build`) before any commit.
- No `console.log` in production code — use structured patterns if debugging is needed.
- All new features require a spec file created via the speckit pipeline before implementation.
- Schema changes require migrations (PocketBase `pb_migrations/` or InsForge migrations) — direct DB edits are prohibited.
- API access patterns: always use repository abstractions, never raw fetch to backend from feature code.
- Feature branches follow naming: `###-feature-description`.

## Governance

This constitution supersedes ad-hoc development practices. Amendments require a documented proposal, team review, and migration plan. All speckit pipeline phases (specify → plan → tasks → implement) must verify compliance with these principles. The `PROJECT_SNAPSHOT.md` file serves as the runtime reference for current architecture state.

**Version**: 1.0.0 | **Ratified**: 2026-05-14 | **Last Amended**: 2026-05-14
