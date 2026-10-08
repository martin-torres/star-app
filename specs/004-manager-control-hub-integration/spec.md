# Feature Specification: Manager Control Hub — Full Integration

**Feature Branch**: `004-manager-control-hub-integration`
**Created**: 2026-05-14
**Status**: Draft
**Input**: User description: "Integrate all 5 FloorPlan modules into star-app. FloorPlan supersedes overlapping existing features. App must remain workable. FloorPlan modules currently use mock/localStorage data — wire them to InsForge. Fill gaps, eliminate redundancy, keep nothing out."

---

## Context & Integration Strategy

The FloorPlan project (`~/Documents/Project Apps/FloorPlan`) contains a Manager Control Hub with 5 modules built in React 18 + Vite 5 + TypeScript. All modules currently use localStorage-backed mock repos. This spec defines the full integration of all 5 modules into star-app (`~/Documents/Project Apps/star-app`), which uses React 19 + Vite 6 + TailwindCSS 3 + InsForge backend.

**Supersession rule**: Where FloorPlan modules overlap with existing star-app features, FloorPlan's implementation replaces the existing one. The app must remain fully functional throughout — no feature loss.

### Module Mapping & Supersession

| # | FloorPlan Module | star-app Existing | Action |
|---|---|---|---|
| 1 | Floor Plan Editor | None (new capability) | **Add** as new `src/features/floor-editor/` |
| 2 | Menu CRUD | `src/features/admin/adminApi.ts` menu methods + seed scripts | **Replace** — FloorPlan's full CRUD UI supersedes adminApi menu ops |
| 3 | Pricing | `adminApi.ts` update price inline | **Replace** — FloorPlan's pricing module supersedes |
| 4 | Promotions/Events | `adminApi.ts` promos CRUD + `Promotion` types in `core/types.ts` | **Replace** — FloorPlan's richer UI with calendar, thresholds, events supersedes |
| 5 | File Imports | None (new capability) | **Add** as new `src/features/manager-hub/imports/` |

### Preserved star-app Features (No Overlap)

These existing star-app features are **NOT** replaced and must remain intact:
- Customer ordering flow (landing → menu → checkout → tracking)
- Kitchen view (`src/features/kitchen/kitchenView.tsx`) — real-time order management
- Analytics (`src/features/analytics/dataView.tsx`) — sales dashboard with calendar, best sellers, time logs
- Dine-in flow (`src/features/dinein/`) — QR scan, table selection, dining, bill
- Lock screens (`src/features/locks/pins.tsx`) — PIN protection for kitchen/data views
- Settings/theming system (`src/core/uiSettings.ts`, `src/hooks/useTheme.ts`)
- Visitor tracking (`src/hooks/useVisitorTracking.ts`)
- Telegram notifications (`lib/telegram.ts`)

### Architecture Adaptations Required

| Concern | FloorPlan | star-app Target |
|---|---|---|
| React version | 18 | 19 |
| Styling | Inline CSS / CSS modules | TailwindCSS 3 |
| Data persistence | localStorage mock repos | InsForge SDK (`@insforge/sdk`) |
| Multi-tenancy | None | `restaurant_id` on all queries |
| Backend | None (mock) | InsForge collections |
| PWA | Not configured | Already configured in star-app |
| State management | Local useState | Zustand or context (match star-app pattern) |
| Routing | None (single page) | URL query params (`?mode=dashboard`) |

---

## User Scenarios & Testing

### User Story 1 — Floor Plan Editor (NEW, Priority: P1)

As a manager, I can visually design my restaurant layout by dragging tables, chairs, and props (kitchen, doors, windows, bathrooms, stages, staircases) onto a canvas, with full resize, rotate, and chair management.

**Why this priority**: This is the flagship capability with no existing equivalent. It closes the loop between manager setup and dine-in customer experience.

**Independent Test**: Open Manager Hub → Floor section, drag a table onto canvas, resize it, add chairs, place a kitchen prop, save, reload, verify layout persists.

**Acceptance Scenarios**:
1. **Given** I open the Floor section, **When** I select "add table" tool and click on canvas, **Then** a table appears at that position with default size and auto-calculated seat count.
2. **Given** a table is selected, **When** I drag it, **Then** it moves on canvas with overlap prevention (cannot collide with other tables).
3. **Given** a table is selected, **When** I use corner handles, **Then** it resizes with min/max constraints and seat count updates automatically.
4. **Given** a table is selected, **When** I click "add chair", **Then** a chair is added and auto-distributed around the table perimeter.
5. **Given** I place props (door, window, kitchen, bathroom, stage, staircase), **When** I reload, **Then** all prop positions and sizes persist.
6. **Given** I switch from Floor to Ops section, **When** there are unsaved changes, **Then** changes are auto-saved before navigation completes.
7. **Given** the floor plan is saved, **When** a dine-in customer views table selection, **Then** the visual layout reflects the manager's designed arrangement.

---

### User Story 2 — Menu CRUD (REPLACES adminApi menu ops, Priority: P1)

As a manager, I can create, edit, and delete menu items with name, category, description, image, and active status — all from a visual catalog interface inside the Manager Hub.

**Why this priority**: Core daily operation. Replaces the current adminApi.ts programmatic approach with a full UI.

**Independent Test**: Open Manager Hub → Ops → Catalog, add a menu item with image, edit it, delete it, verify changes reflect in the customer-facing menu.

**Acceptance Scenarios**:
1. **Given** Ops → Catalog is open, **When** I add a menu item with required fields (name, category), **Then** it appears in the category card immediately and persists to InsForge.
2. **Given** an existing menu item, **When** I edit name/description/category/image, **Then** changes save and persist after reload.
3. **Given** an existing menu item, **When** I delete it, **Then** it disappears from the catalog and is removed from InsForge.
4. **Given** items exist in multiple categories, **When** I view the catalog, **Then** items are grouped by category cards (no separate category index sidebar).
5. **Given** a menu item is created/updated in Manager Hub, **When** a customer views the menu, **Then** the item appears with correct details.

---

### User Story 3 — Pricing (REPLACES adminApi price updates, Priority: P1)

As a manager, I can update prices for menu items directly in the item inspector within the Catalog, with numeric validation.

**Why this priority**: High-frequency operation. Must be integrated into the same inspector flow as menu editing.

**Independent Test**: Open a menu item in Catalog inspector, change price, save, reload, verify updated price. Verify customer-facing menu shows new price.

**Acceptance Scenarios**:
1. **Given** a menu item is selected in Catalog, **When** I edit the price in the inspector, **Then** the new price persists after save.
2. **Given** I enter a negative or non-numeric price, **When** I attempt to save, **Then** validation rejects with an error message.
3. **Given** a price is updated, **When** a customer views the menu, **Then** the updated price is displayed.

---

### User Story 4 — Promotions & Events (REPLACES adminApi promos, Priority: P2)

As a manager, I can schedule promotions and events for specific dates or days of the week, with a threshold warning system (max 2 promotions/day and 2 events/day before warning).

**Why this priority**: Richer than the existing adminApi promos CRUD — adds calendar scheduling, event types, and threshold rules.

**Independent Test**: Create a promotion for Monday, create an event for a specific date, exceed 2 promotions on one day, verify warning appears.

**Acceptance Scenarios**:
1. **Given** Ops → Promos is open, **When** I create a promotion with target date/day and rules, **Then** it saves and appears in the schedule list.
2. **Given** Ops → Promos is open, **When** I create an event with kind, title, and target date (independent of promo item selection), **Then** it saves and appears in the event list.
3. **Given** a promotion/event exists, **When** I edit or deactivate it, **Then** updated state persists.
4. **Given** a calendar day has 2 promotions and 2 events, **When** I view the day, **Then** no warning is shown.
5. **Given** a calendar day has 3 promotions or 3 events, **When** I view the day, **Then** a warning is shown for that day.
6. **Given** a promotion is active for today, **When** a customer views the menu, **Then** the promotion is displayed.

---

### User Story 5 — File Imports (NEW, Priority: P2)

As a manager, I can drag and drop CSV, image, or document files to bulk-import or assist updates for menu items, pricing, and promotions, with validation preview and result reporting.

**Why this priority**: Reduces manual effort for large data updates. No existing equivalent in star-app.

**Independent Test**: Drop a CSV file with menu item data in Ops → Imports, preview the parsed data, apply import, verify success/error summary, check that items appear in catalog.

**Acceptance Scenarios**:
1. **Given** Ops → Imports is open, **When** I drag/drop a supported file (CSV/image/doc), **Then** the system validates type/size and shows an import preview.
2. **Given** a preview is shown, **When** I apply the import, **Then** records are updated with a success/error summary.
3. **Given** a CSV has invalid headers/columns, **When** the import runs, **Then** invalid rows are rejected with actionable error details.
4. **Given** a CSV has duplicate menu items, **When** the import runs, **Then** deterministic merge/skip behavior is applied.
5. **Given** a large file is uploaded, **When** processing, **Then** non-blocking progress feedback is shown.

---

### User Story 6 — Unified Manager Shell (Priority: P1)

As a manager, I can access all modules (Floor, Ops with Catalog/Promos/Imports, Analytics) from a single unified page with a collapsible navigation rail.

**Why this priority**: The shell is the integration scaffold. Without it, modules are disconnected.

**Independent Test**: Open Manager Hub, navigate between Floor → Ops (Catalog → Promos → Imports) → Analytics, verify smooth transitions and state preservation.

**Acceptance Scenarios**:
1. **Given** I open the Manager Hub, **When** the page loads, **Then** I see a left rail with Floor, Ops, Analytics icons and a center workspace.
2. **Given** I'm in Floor section, **When** I click Ops in the rail, **Then** the center workspace switches to Ops with Catalog/Promos/Imports top tools.
3. **Given** I'm in Ops → Catalog, **When** I click Promos in the top tool strip, **Then** the center workspace switches to Promotions/Events view.
4. **Given** Analytics section is selected, **When** analytics is not yet implemented, **Then** a clear "deferred" placeholder is shown with no broken navigation.

---

### Edge Cases

- **Floor Plan ↔ RestaurantTable model mismatch**: FloorPlan uses `FloorTable` (canvas coordinates, chair nodes, visual props). star-app uses `RestaurantTable` (table_number, seats, location enum, qr_code_url). An adapter must translate between the two. The floor plan canvas position (x, y, width, height) supplements but does not replace the RestaurantTable record.
- **Menu item model mismatch**: FloorPlan's `MenuItem` (itemId, name, category, description, imageUrl, active) vs star-app's `MenuItem` (id, name, description, price, category, image, isWeightBased, weightPricePerKg, options, strain, stock, trackInventory). The merged model must include ALL fields from both. FloorPlan's CRUD UI must be extended to support star-app-specific fields (price, weight-based pricing, options, stock tracking).
- **Promotions model mismatch**: FloorPlan's `PromotionEvent` (entryId, type, title, offerType, targetDate, targetWeekday) vs star-app's `Promotion` (code, description, conditions with orderBeforeHour/orderAfterHour/minOrderAmount/daysOfWeek, action with type/itemCode/value). The merged model must support both paradigms.
- **Concurrent manager sessions**: Two managers editing the same floor plan simultaneously — last-write-wins with InsForge realtime subscription for conflict awareness.
- **Large floor plans**: 50+ tables with chairs must render at 60fps on canvas.
- **Image uploads in Menu CRUD**: Must use InsForge storage, not localStorage.
- **Offline resilience**: Manager Hub is a secondary workflow — PWA caching for manager assets is nice-to-have but not critical. Customer flow PWA caching takes priority.

---

## Requirements

### Functional Requirements

**Integration & Architecture**:
- **FR-001**: All 5 FloorPlan modules MUST be integrated into star-app under `src/features/` preserving the existing modular architecture pattern.
- **FR-002**: FloorPlan code MUST be adapted from React 18 → React 19, inline CSS → TailwindCSS 3, localStorage → InsForge SDK.
- **FR-003**: All data operations MUST include `restaurant_id` filtering for multi-tenant isolation.
- **FR-004**: The existing `src/features/admin/adminApi.ts` menu/promos CRUD methods MUST be deprecated and replaced by the FloorPlan module implementations.
- **FR-005**: The existing customer-facing features (customer ordering, kitchen view, analytics dashboard, dine-in flow, lock screens) MUST remain functional and unchanged.
- **FR-006**: The Manager Hub MUST be accessible via `?mode=dashboard` URL parameter (consistent with star-app's existing mode routing).

**Floor Plan Editor**:
- **FR-007**: System MUST provide a drag-and-drop canvas for table/prop placement with overlap prevention.
- **FR-008**: Tables MUST support resize (with min/max constraints), rotation, and auto seat count calculation.
- **FR-009**: Chair management MUST support add/remove/move with auto-distribution around table perimeter.
- **FR-010**: Props MUST support: stage, bathroom, staircase, window, main_door, door, kitchen_area.
- **FR-011**: Doors and windows MUST maintain fixed width (10 units) while scaling height.
- **FR-012**: Floor plan data MUST persist to InsForge (not localStorage).
- **FR-013**: Switching from Floor to other modules MUST auto-save pending floor plan changes.

**Menu CRUD**:
- **FR-014**: System MUST provide full menu item CRUD (create/read/update/delete) with name, category, description, image, price, and active status.
- **FR-14a**: Menu CRUD MUST support star-app-specific fields: weight-based pricing (isWeightBased, weightPricePerKg, weightInGrams), item options, strain type, stock tracking (stock, trackInventory).
- **FR-015**: Items MUST be displayed in category cards in the main panel (no separate category index sidebar).
- **FR-016**: Image uploads MUST use InsForge storage.
- **FR-017**: Changes MUST be reflected in the customer-facing menu in real-time.

**Pricing**:
- **FR-018**: System MUST provide inline price editing in the menu item inspector with numeric validation (non-negative, finite).
- **FR-019**: Price changes MUST persist to InsForge and reflect in customer-facing menu.

**Promotions/Events**:
- **FR-020**: System MUST support creating promotions (with item association, offer type, target date/day) and events (with kind, title, target date) as independent flows.
- **FR-021**: System MUST enforce threshold rules: warning when promotions > 2/day or events > 2/day.
- **FR-022**: Promotions MUST support star-app's existing promotion conditions (orderBeforeHour, orderAfterHour, minOrderAmount, daysOfWeek) and actions (free_item, discount_percent, discount_fixed).
- **FR-023**: Active promotions MUST be displayed in the customer-facing menu.

**File Imports**:
- **FR-024**: System MUST support drag-and-drop file upload for CSV, images, and documents.
- **FR-025**: System MUST validate file type/size and show import preview before applying.
- **FR-026**: System MUST display import results with success/failure counts and actionable errors.
- **FR-027**: CSV import MUST support flexible column-name mapping.

**Manager Shell**:
- **FR-028**: System MUST provide a unified Manager Hub with left navigation rail (Floor, Ops, Analytics).
- **FR-029**: Ops section MUST have a top tool strip (Catalog, Promos, Imports) rendered between sidebars.
- **FR-030**: Analytics section MUST show a deferred placeholder (existing star-app analytics remains the primary analytics view).
- **FR-031**: Left rail MUST be collapsed with compact icon affordances.

### Key Entities

- **FloorTable**: Canvas table with tableId, tableType (square/rectangle/circular/booth/l_shaped), label, x, y, width, height, rotation, seatCount, seatOverride, chairs (ChairNode[]), updatedAt. Maps to/from star-app's RestaurantTable.
- **FloorProp**: Canvas prop with propId, propType (stage/bathroom/staircase/window/main_door/door/kitchen_area), x, y, width, height, rotation, updatedAt.
- **ChairNode**: chairId, tableId, offsetX, offsetY, active.
- **MenuItem** (merged): id, restaurant_id, name, description, price, category, image, isWeightBased, weightPricePerKg, weightInGrams, options (ItemOption[]), strain, soldOut, stock, trackInventory, active, updatedAt.
- **PromotionEvent** (merged): entryId, restaurant_id, type (promotion/event), title, itemId (optional), offerType, offerValue, targetDate, targetWeekday, conditions (orderBeforeHour, orderAfterHour, minOrderAmount, daysOfWeek), action (type, itemCode, value), active, updatedAt.
- **ImportJob**: jobId, kind (csv/image/doc), status (uploaded/parsed/previewed/applied/failed), summary (success/failed counts), errors, fileName, updatedAt.
- **PriceEntry**: itemId, label, price, currency, effectiveFrom, updatedAt.
- **ManagerModuleRoute**: Navigation state (floor-plan | operations | analytics).
- **OpsViewMode**: Top tool state within Ops (catalog | promos | imports).

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 5 FloorPlan modules are accessible from a single Manager Hub page within star-app.
- **SC-002**: Floor plan with 50+ tables renders at 60fps; drag/resize/rotate operations complete within 16ms frame budget.
- **SC-003**: 100% of menu CRUD operations persist to InsForge and reflect in customer-facing menu within 2 seconds.
- **SC-004**: 100% of price updates validate and persist correctly; negative/malformed values are rejected.
- **SC-005**: Promotions/events can be scheduled and retrieved correctly; threshold warnings appear only above 2/day.
- **SC-006**: 100% of import runs return explicit success/error summary output.
- **SC-007**: Module switches from Floor Plan auto-save pending edits within 400ms p95.
- **SC-008**: Existing customer ordering, kitchen view, analytics, dine-in flow, and lock screens remain fully functional (zero regression).
- **SC-009**: All data queries include `restaurant_id` filtering (zero cross-tenant data leakage).
- **SC-010**: Manager Hub is accessible via `?mode=dashboard` and renders correctly on mobile and desktop.

## Assumptions

- InsForge backend has (or will have) collections for: floor_tables, floor_props, menu_items, promotions_events, import_jobs, pricing.
- The existing star-app analytics (`DataView`) remains the primary analytics dashboard. The Manager Hub's Analytics section is a placeholder for future expansion.
- Floor plan canvas coordinates are relative (not GPS). They represent a visual layout for customer table selection, not real-world coordinates.
- Image storage uses InsForge's built-in storage (not PocketBase storage).
- The FloorPlan project's test suite (vitest) should be ported and expanded in star-app.

## Out of Scope (for 004 initial delivery)

- Real-time collaborative floor plan editing (multiple managers simultaneously).
- AI-assisted floor plan generation.
- Advanced analytics in Manager Hub (existing star-app analytics covers this).
- Mobile-optimized floor plan editor (desktop-first for managers).
- Import of complex nested data (e.g., bundle items via CSV).

## Migration Notes

### Data Model Reconciliation

The FloorPlan's localStorage-backed repos must be replaced with InsForge SDK calls:

```
FloorPlan localStorage repo  →  InsForge SDK repo
─────────────────────────────────────────────────
createMenuRepo()             →  menuRepo (InsForge)
createPricingRepo()          →  pricingRepo (InsForge)
createPromotionsRepo()       →  promotionsRepo (InsForge)
createImportsRepo()          →  importsRepo (InsForge)
saveFloorPlanStore()         →  floorPlanRepo (InsForge)
```

Each repo must:
1. Use `insforge.database.from('collection_name')` for CRUD
2. Append `.eq('restaurant_id', currentRestaurantId)` to all queries
3. Include `restaurant_id` in all insert payloads
4. Handle InsForge auth (reuse star-app's existing auth flow)

### Component Adaptation Checklist

- [ ] Convert all inline styles to TailwindCSS utility classes
- [ ] Replace React 18 patterns with React 19 compatible code
- [ ] Replace localStorage reads/writes with InsForge SDK calls
- [ ] Add `restaurant_id` to all data operations
- [ ] Adapt FloorTable model to include star-app's RestaurantTable fields
- [ ] Adapt MenuItem model to include star-app's full MenuItem fields (price, weight, options, stock)
- [ ] Adapt PromotionEvent model to include star-app's Promotion conditions/actions
- [ ] Port vitest tests and expand coverage
- [ ] Ensure PWA service worker caches manager hub assets
- [ ] Wire Manager Hub into App.tsx via `?mode=dashboard` route
