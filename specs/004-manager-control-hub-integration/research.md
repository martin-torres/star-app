# Research: Database State & Integration Path

**Date**: 2026-05-14
**Author**: Agent analysis

---

## Findings

### Existing Databases

#### 1. azucar-y-nuez (4d2djas5) — DEAD
- Was the original InsForge project for star-app
- Returns 503 — no backend services available
- Project no longer listed in `insforge list`
- The `.env` previously pointed here

#### 2. qr-restaurant-app (nq7vtye8) — ALIVE, WRONG SCHEMA
- Active InsForge project
- Contains "Di Pasquale" Italian restaurant data
- **Modern schema**: JSONB for i18n names/descriptions, FK-based categories, floor-plan coordinates on tables
- 8 menu items (Bruschetta, Calamari, Pizza Margherita, Pasta Carbonara, Grilled Salmon + drinks)
- 4 tables with x/y/shape/rotation coordinates
- 1 floor plan (800x600)
- 6 app modules (menu, floor_plan, ordering, promos, payments, staff)
- **Not compatible with star-app's code**: Column names differ (number vs table_number, category_id vs category, image_url vs image), JSONB names break star-app's string mappers, missing mode/currency/color columns on restaurants

#### 3. Dond my first project (2y542jyv) — EMPTY
- 0 tables, 0 storage, 0 functions
- Ready to be used as the fresh database
- Currently linked to `restaurant-platform` app (which also doesn't fit)

### Codebases

#### star-app (~/Documents/Project Apps/star-app)
- React 19 + Vite 6 + TailwindCSS 3 + InsForge SDK
- Features: customer ordering, kitchen view, analytics, dine-in flow, PIN locks, admin panel
- Data layer: `src/data/pocketbase/` with mappers expecting flat schema
- Was built for "El Arrocito" / "Azúcar y Nuez - Bakery"
- Has weight-based items, stock tracking, strain types — specific to a bakery/cannabis-adjacent menu

#### FloorPlan (~/Documents/Project Apps/FloorPlan)
- React 18 + Vite 5 (no Tailwind)
- Manager hub with 5 modules: floor editor, menu CRUD, pricing, promotions/events, imports
- All use localStorage-backed mock repos
- Domain logic is well-architected with pure functions (editorStore, overlapGuards, seatSizingRules)
- Floor plan editor has drag-and-drop canvas, chair management, prop placement

#### restaurant-platform (~/Documents/Project Apps/restaurant-platform)
- React 19 + Vite 8 + TailwindCSS 4 + i18next + Zustand + Recharts
- More modern stack but points to empty InsForge project
- Has migrations directory (possibly the correct schema for qr-restaurant-app?)

### Conclusion

The cleanest path is a **new database** that matches star-app's schema exactly, rather than:
- Forcing star-app to adapt to qr-restaurant-app's different schema (would break weight-based items, strain types, stock tracking, and all existing mappers)
- Forcing star-app to match restaurant-platform's patterns
- Keeping the dead azucar-y-nuez project

The new database should be created on "Dond my first project" (2y542jyv) or a fresh InsForge project, using the data model defined in `data-model.md`.
