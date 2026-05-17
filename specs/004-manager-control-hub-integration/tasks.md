# Tasks: Manager Control Hub — Full Integration

**Branch**: `004-manager-control-hub-integration` | **Date**: 2026-05-17

## Strategy

The target InsForge project (`2y542jyv`) already has 37 well-designed tables from the `restaurant-platform` work. We **extend this existing schema** rather than rebuild from scratch — adding missing columns/tables where needed. The `insforge-repos` data layer adapts to match the actual DB schema.

---

## Phase A: InsForge Database — Schema Extension & Seeding

### A1. Extend existing tables
- [ ] Add weight-based columns to `menu_items`: `is_weight_based`, `weight_price_per_kg`, `weight_in_grams`, `strain`
- [ ] Add column `items` (jsonb) to `orders` for denormalized order snapshots
- [ ] Add `customer_address`, `payment_method`, `pay_with_amount`, `delivery_fee`, `order_type`, `timestamp`, `delivery_distance_km` to `orders`
- [ ] Add `instructions`, `weight_in_grams`, `is_bundle`, `bundle_items` to `order_items`
- [ ] Add `code`, `type`, `offer_type`, `offer_value`, `bundle_items`, `item_id`, `target_date`, `target_weekday`, `conditions`, `action` to `promos`
- [ ] Add `qr_code_url`, `location` to `restaurant_tables`
- [ ] Add `hero_text`, `hero_image_url`, `tagline`, `google_font_url`, `google_font_name` to `restaurants`

### A2. Create missing tables
- [ ] Create `menu_categories` table (id, restaurant_id, name, sort_order, created_at, updated_at)
- [ ] Create `dining_sessions` table (id, restaurant_id, table_id, customer_name, customer_phone, status, order_ids jsonb, session_start, session_end, created_at, updated_at)
- [ ] Create `bill_requests` table (id, restaurant_id, table_id, order_ids jsonb, subtotal, tax, tip, total, status, payments jsonb, requested_at, created_at, updated_at)
- [ ] Create `app_modules` table (id, restaurant_id, slug, enabled, settings jsonb, created_at, updated_at)

### A3. Seed demo data
- [ ] Insert "El Arrocito" restaurant with colors/mode/currency
- [ ] Insert 4-6 menu categories (Entradas, Platos Fuertes, Postres, Bebidas)
- [ ] Insert 10-15 menu items with realistic pricing
- [ ] Insert 4-6 restaurant tables with floor plan coordinates
- [ ] Insert 1 floor plan (800x600 canvas)
- [ ] Insert app modules (menu, floor_plan, ordering, promos, payments, staff)
- [ ] Update `.env` to point to the new InsForge project

### A4. Verify database
- [ ] Run end-to-end query: `SELECT * FROM restaurants` returns seed data
- [ ] Run end-to-end query: `SELECT * FROM menu_items` returns seed data
- [ ] Verify all FK relationships

---

## Phase B: New Data Layer (`src/data/insforge/`)

### B1. Client Configuration
- [ ] Create `src/data/insforge/client.ts` — InsForge SDK client config
- [ ] Create `src/data/insforge/index.ts` — barrel exports

### B2. Repository Implementations
- [ ] Create `src/data/insforge/menu-repo.ts` — menu_items + menu_categories CRUD
- [ ] Create `src/data/insforge/orders-repo.ts` — orders + order_items CRUD
- [ ] Create `src/data/insforge/settings-repo.ts` — restaurants + restaurant_settings CRUD
- [ ] Create `src/data/insforge/tables-repo.ts` — restaurant_tables CRUD
- [ ] Create `src/data/insforge/floor-plan-repo.ts` — floor_plans CRUD
- [ ] Create `src/data/insforge/floor-props-repo.ts` — floor_props CRUD
- [ ] Create `src/data/insforge/promos-repo.ts` — promos CRUD
- [ ] Create `src/data/insforge/imports-repo.ts` — import job CRUD
- [ ] Create `src/data/insforge/staff-repo.ts` — staff + shifts CRUD
- [ ] Create `src/data/insforge/dinein-repo.ts` — dining_sessions + bill_requests CRUD
- [ ] Create `src/data/insforge/app-modules-repo.ts` — app_modules CRUD

### B3. Mappers / Adapters
- [ ] Create `src/data/insforge/mappers.ts` — DB ↔ TypeScript type converters
- [ ] Map restaurant-platform schema to star-app's existing TypeScript types

### B4. Data Layer Switch
- [ ] Update `App.tsx` to import from `insforge/` instead of (or alongside) pocketbase
- [ ] Verify customer flow loads correctly from new DB

---

## Phase C: Manager Shell + Floor Editor (Port from FloorPlan)

### C1. Shared Types
- [ ] Create `src/core/managerTypes.ts` — ManagerModuleRoute, ManagerNavItem, OpsViewMode

### C2. Manager Shell
- [ ] Port `ManagerNavRail.tsx` — collapsible left rail with Floor/Ops/Analytics icons
- [ ] Port `ModuleHost.tsx` — center workspace host route
- [ ] Port `OperationsModule.tsx` — top tool strip (Catalog, Promos, Imports)
- [ ] Port `AnalyticsPlaceholder.tsx` — deferred placeholder
- [ ] Port `ManagerHubPage.tsx` — main shell assembly
- [ ] Port `moduleSwitchController.ts` — module switching logic with auto-save
- [ ] Port `floorPlanPersistence.ts` — auto-save floor plan on module switch

### C3. Floor Editor Domain
- [ ] Port `layoutTypes.ts` — FloorTable, FloorProp, ChairNode types
- [ ] Port `overlapGuards.ts` — collision detection for table placement
- [ ] Port `seatSizingRules.ts` — auto seat count calculation

### C4. Floor Editor State
- [ ] Port `editorStore.ts` — canvas state management (tables, props, selection, tool modes)
- [ ] Port `unsavedChanges.ts` — dirty tracking

### C5. Floor Editor Data (wire to InsForge)
- [ ] Convert `floorTablesRepo.ts` from localStorage → insforge SDK
- [ ] Convert `floorPropsRepo.ts` from localStorage → insforge SDK

### C6. Floor Editor UI
- [ ] Port `FloorCanvas.tsx` — main canvas with grid, zoom, drag/drop
- [ ] Port `LeftToolPanel.tsx` — tool selection (add table, add prop, select)
- [ ] Port `RightInspectorPanel.tsx` — selected item properties
- [ ] Port `ChairEditorOverlay.tsx` — chair add/remove on selected table

### C7. Register in App
- [ ] Add `?mode=dashboard` routing to App.tsx
- [ ] Add Manager Nav in the switcher
- [ ] Replace existing `AdminModule` with new ManagerHubPage

### C8. Verify
- [ ] Load `?mode=dashboard` — shell renders with 3 modules
- [ ] Navigate Floor ↔ Ops ↔ Analytics — smooth transitions
- [ ] Place a table on canvas — persists after reload

---

## Phase D: Menu CRUD + Pricing (Port from FloorPlan)

### D1. Menu Module — State & Data
- [ ] Port `menuStore.ts` — menu catalog state management
- [ ] Convert `menuRepo.ts` from localStorage → insforge SDK menu-repo
- [ ] Expand MenuItem schema: add weight-based pricing, options, stock, strain fields

### D2. Menu Module — UI
- [ ] Port `MenuModule.tsx` — category cards + item listing
- [ ] Extend item editor: weight toggle, option builder, stock input, strain selector
- [ ] Add category management (add/edit/delete categories)
- [ ] Wire image upload to InsForge storage

### D3. Pricing Module
- [ ] Port `pricingStore.ts` — pricing state
- [ ] Convert `pricingRepo.ts` from localStorage → insforge SDK menu-repo (price field)
- [ ] Port `PricingModule.tsx` — inline price editor in item inspector
- [ ] Add numeric validation (non-negative, finite)

### D4. Deprecate old adminApi menu methods
- [ ] Mark `adminApi.ts` menu methods as deprecated
- [ ] Ensure no customer-facing breakage

### D5. Verify
- [ ] Create a menu item with all fields — persists after reload
- [ ] Edit price — validated and persisted
- [ ] Customer menu reflects changes

---

## Phase E: Promotions/Events (Port from FloorPlan)

### E1. Promotions Store & Data
- [ ] Port `promotionsStore.ts` — promo/event state
- [ ] Convert `promotionsRepo.ts` from localStorage → insforge SDK promos-repo
- [ ] Extend schema: support both promotion and event paradigms

### E2. Threshold Rules
- [ ] Port `thresholdRules.ts` — max 2 promos or events per day warning

### E3. Promotions UI
- [ ] Port `PromotionsModule.tsx` — calendar view, promo creation, event creation
- [ ] Add conditions editor (orderBeforeHour, orderAfterHour, minOrderAmount, daysOfWeek)
- [ ] Add action editor (free_item, discount_percent, discount_fixed)

### E4. Customer-facing integration
- [ ] Wire active promos to customer menu display

### E5. Verify
- [ ] Create a promotion — appears in schedule
- [ ] Create 3 promos on same day — threshold warning fires
- [ ] Customer menu shows active promotions

---

## Phase F: File Imports (Port from FloorPlan)

### F1. Imports Store & Data
- [ ] Port `importsStore.ts` — import job state management
- [ ] Convert `importsRepo.ts` from localStorage → insforge SDK

### F2. Imports UI
- [ ] Port `ImportsModule.tsx` — drag-and-drop zone, preview, results

### F3. Verify
- [ ] Drop a CSV — preview shows parsed data
- [ ] Apply import — success/failure summary displayed

---

## Phase G: Verification & Cleanup

### G1. End-to-end Test
- [ ] Customer flow: menu loads → add item → place order → kitchen receives
- [ ] Manager flow: dashboard → floor editor → save → reload
- [ ] Manager flow: menu CRUD → create item → customer sees it
- [ ] Manager flow: create promotion → customer menu shows it
- [ ] Dine-in flow: QR scan → table selection → order → bill → pay
- [ ] Analytics loads correctly

### G2. Cleanup
- [ ] Remove deprecated `adminApi.ts` menu/promos methods
- [ ] Remove unused pocketbase references (keep as fallback)
- [ ] Remove localStorage mock files from ported modules
- [ ] Update `.env` if needed

### G3. Quickstart Doc
- [ ] Create `quickstart.md` with setup steps
