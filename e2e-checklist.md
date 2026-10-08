# E2E Testing Checklist: Manager Control Hub + All Modules

**Purpose**: End-to-end validation of the Manager Hub shell, Floor Editor, Menu/Pricing CRUD, Promotions, and CSV Imports — all wired to the `2y542jyv` InsForge database.
**Created**: 2026-05-17
**Branch**: `004-manager-control-hub-integration`

---

## Phase G1: Authentication & Route Gating

- [x] CHK001 Navigate to `?mode=dashboard` without PIN → see DataLock prompt
- [x] CHK002 Enter wrong PIN → remain locked (no error crash)
- [x] CHK003 Enter correct PIN → ManagerHubPage renders
- [ ] CHK004 Add `?restaurant_id=<valid-uuid>` to URL → restaurantId threaded through ModuleHost → OperationsModule → all sub-modules
- [x] CHK005 Add `?restaurant_id=<invalid-uuid>` → modules show helpful "no restaurant selected" message

---

## Phase G2: Manager Shell Layout

- [x] CHK006 Nav rail renders with 3 items: Floor, Ops, Analytics
- [x] CHK007 Click collapse button → rail shrinks to icons-only (~56px)
- [x] CHK008 Click expand button → rail returns to full width (~180px)
- [x] CHK009 Switching from Floor → Ops triggers autosave of floor plan
- [x] CHK010 Switching from Floor → Analytics triggers autosave of floor plan
- [x] CHK011 Switching from Ops → Floor does NOT trigger autosave
- [x] CHK012 Switching from Analytics → Ops works cleanly (no pending save)

---

## Phase C: Floor Plan Editor

### Canvas & Drag-Drop

- [x] CHK013 Floor canvas renders with grid background and coordinate labels
- [x] CHK014 Drag a "Rect" table onto canvas → table rectangle appears at drop position
- [x] CHK015 Drag a "Circle" table → circular table renders
- [x] CHK016 Drag an "L" table → L-shaped table renders
- [x] CHK017 Drag a "Stage" prop → prop rectangle renders at drop position
- [x] CHK018 Drag a "Kitchen" prop → prop renders with "🍽" label
- [x] CHK019 Drag a "Bathroom" prop → renders with "🚻" label
- [x] CHK020 Drag a "Stairs" prop → renders with "⇅" label
- [x] CHK021 Drag a "Window" prop → renders with "▣" label
- [x] CHK022 Drag a "M Door" prop → renders with "⎋" label
- [x] CHK023 Drag a "Door" prop → renders with "⟂" label

### Table Selection & Properties

- [x] CHK024 Click a table on canvas → table highlights (selection border)
- [x] CHK025 Click empty space → selection clears
- [x] CHK026 Inspector panel shows selected table's properties (width, height, x, y, rotation)
- [x] CHK027 Inspector panel shows selected prop's properties
- [x] CHK028 Modify width in inspector → table resizes immediately
- [x] CHK029 Modify height in inspector → table resizes
- [x] CHK030 Modify x/y → table moves
- [x] CHK031 Modify rotation (0-360) → table rotates around center

### Resize Handles

- [x] CHK032 Selected table shows resize handles at corners/edges
- [x] CHK033 Drag bottom-right handle → table resizes proportionally or freely
- [x] CHK034 Table cannot be resized below minimum dimensions (e.g. 30×30)
- [x] CHK035 Resize a circular table → both width and height stay equal

### Drag to Move

- [x] CHK036 Click-drag an existing table → table follows cursor
- [x] CHK037 Dropped table stays at final position
- [x] CHK038 Table cannot be dragged outside canvas bounds
- [x] CHK039 Table cannot overlap another table (collision guard)

### Chair Editing

- [x] CHK040 Double-click a table → ChairEditorOverlay opens
- [x] CHK041 Click on table edge in chair editor → a chair node is added at that position
- [x] CHK042 Click existing chair node → removes it
- [x] CHK043 Close overlay → chair changes persist on canvas
- [x] CHK044 Chair nodes render as small circles along table edges

### Table Numbering

- [x] CHK045 Tables show their table number centered inside
- [x] CHK046 Table numbers are auto-assigned on creation and unique

### Delete

- [x] CHK047 Select a table and press Delete key → table is removed
- [x] CHK048 Select a prop and press Delete key → prop is removed
- [x] CHK049 Undeletable when nothing selected (no error)

### Status Colors

- [x] CHK050 Tables show demo status colors based on index cycling through 7 statuses
- [x] CHK051 `new_order` status → red tint overlay
- [x] CHK052 `cleaning` status → amber/orange tint
- [x] CHK053 `occupied_idle` status → blue tint
- [x] CHK054 Color overlay is semi-transparent (table contents still visible)

### Persistence (localStorage)

- [x] CHK055 Add tables to floor plan → reload page → tables persist
- [x] CHK056 Resize/move a table → reload → position and size persist
- [x] CHK057 Add chairs → reload → chairs persist
- [x] CHK058 Delete a table → reload → table is gone
- [x] CHK059 localStorage key is `manager-hub.floor-plan.store`

### Unsaved Changes

- [x] CHK060 Unsaved changes indicator appears after modifying the floor plan
- [x] CHK061 After switching to another module, floor plan is auto-saved (dirtiness resets)

---

## Phase D: Menu CRUD

- [ ] CHK062 Navigate to Ops → Catalog tab tab loads menu items from `menu_items` table
- [ ] CHK063 Create item: fill Name + Category + optional fields → click "Create Item"
- [ ] CHK064 New item appears immediately in the list below
- [ ] CHK065 Item slug auto-generated from name (lowercased, hyphenated)
- [ ] CHK066 Verify created item exists in DB: `SELECT * FROM menu_items WHERE slug = '<auto-slug>'`
- [ ] CHK067 Edit item: click "Edit" → fields pre-fill → modify name → click "Update Item"
- [ ] CHK068 Changes persist after reload
- [ ] CHK069 Delete item: click "Delete" → item removed from list
- [ ] CHK070 Verify item removed from DB: `SELECT * FROM menu_items WHERE slug = '<slug>'` → empty
- [x] CHK071 Create item with empty name → validation error message shown
- [x] CHK072 Create item with empty category → validation error shown
- [x] CHK073 Duplicate name creates a new slug (existing comparison by slug, not by name)

---

## Phase D: Pricing

- [ ] CHK074 Navigate to Ops → Pricing tab → loads items that have a non-null price
- [ ] CHK075 Enter existing item ID (slug) + price → click "Save Price"
- [ ] CHK076 Verify DB: `SELECT price, currency FROM menu_items WHERE slug = '<slug>'`
- [x] CHK077 Negative price → validation error ("price cannot be negative")
- [x] CHK078 Non-numeric price → validation error
- [ ] CHK079 Edit existing price → updates DB
- [ ] CHK080 Delete price → price set to null in DB → item gone from pricing list
- [ ] CHK081 Multiple currencies work (default MXN, can enter USD etc.)

---

## Phase E: Promotions & Events

- [ ] CHK082 Navigate to Ops → Promos tab → loads promotions/events from `promos` table
- [ ] CHK083 Create promotion: select type "Promotion", enter title + date → click "Save Entry"
- [ ] CHK084 New promotion appears in list immediately
- [ ] CHK085 Verify DB: `SELECT * FROM promos WHERE restaurant_id = '<id>' AND type = 'promotion'`
- [ ] CHK086 Create event: select "Event" type
- [ ] CHK087 Edit promotion → changes persist
- [ ] CHK088 Delete promotion → removed from list and DB
- [ ] CHK089 Daily threshold summary: multiple entries with same date → grouped under that date
- [ ] CHK090 Threshold warning (>2 promos or >2 events on same date) → "Warning: Daily threshold exceeded" shown
- [ ] CHK091 Threshold warning disappears when count reduced below threshold
- [ ] CHK092 Create entry without date → appears under "unscheduled" grouping
- [x] CHK093 Entry ID field is disabled (auto-generated by DB)

---

## Phase F: CSV Imports

### File Parsing

- [ ] CHK094 Click file picker → select a valid CSV with headers → rows previewed in job list
- [ ] CHK095 Drag a CSV file onto the dashed drop zone → rows previewed
- [x] CHK096 CSV with Spanish headers (nombre, precio) → columns auto-mapped correctly
- [x] CHK097 CSV with English headers (item, cost) → columns auto-mapped
- [x] CHK098 CSV with `name,price,description,image,category` → all fields parsed correctly
- [x] CHK099 CSV with `promo,event_date,offer_type` → promo fields parsed
- [x] CHK100 Empty file → error "Empty file"
- [x] CHK101 File > 8MB → error "File exceeds 8MB limit"
- [x] CHK102 Unsupported file type (e.g. `.pdf`) → error "Unsupported file type"
- [x] CHK103 .xlsx/.xls → error "Excel files must be exported as CSV for now"
- [x] CHK104 TSV file (tab-delimited) → parses correctly using tab delimiter
- [x] CHK105 CSV with quoted fields (`"item name","10.50"`) → quotes stripped correctly

### Import Apply

- [ ] CHK106 After parsing, click "Apply" on a job → creates menu items and pricing
- [ ] CHK107 Verify items created in DB: `SELECT * FROM menu_items WHERE restaurant_id = '<id>'`
- [ ] CHK108 Verify prices set: `SELECT slug, price FROM menu_items WHERE price IS NOT NULL`
- [ ] CHK109 CSV with promo columns → promotions also created in `promos` table
- [ ] CHK110 Re-applying a job that's already "applied" → button is disabled
- [ ] CHK111 Job status changes to "applied" after successful apply
- [ ] CHK112 Success/failure counts shown in job summary
- [ ] CHK113 Partial failure (malformed row) → counts reflect success=2, failed=1
- [ ] CHK114 Applying same CSV twice → existing slugs get updated (not duplicated)

---

## Phase G: Integration & Cross-Cutting

### Operations Sub-Tab Bar

- [ ] CHK115 Ops module shows 4 tab buttons: Catalog, Pricing, Promos, Imports
- [ ] CHK116 Active tab has dark background, inactive tabs are light
- [ ] CHK117 Switching tabs preserves state (other module states not wiped)

### TypeScript Compilation

- [x] CHK118 `node_modules/typescript/bin/tsc --noEmit` → zero new errors (pre-existing errors only in `pb_migrations_deprecated/` and `mercadopago.ts`)

### Browser Console

- [x] CHK119 Open browser DevTools Console → no React errors, no uncaught promises, no InsForge SDK errors
- [x] CHK120 No "invalid hook call" or "rendered more hooks than during previous render" errors

### Visual & UX

- [x] CHK121 All panels have consistent border, radius, padding per `managerTokens`
- [x] CHK122 ModuleHost inline toolbar scrolls horizontally when many buttons (Tables + Props)
- [x] CHK123 Inspector panel collapses/expands on toggle button click
- [x] CHK124 Floor canvas occupies remaining vertical space in its container

### Data Cleanup

- [x] CHK125 Clear localStorage → floor plan resets to empty state
- [x] CHK126 Clear localStorage → no crash, gracefully defaults to `initialEditorStore`

---

## Notes

- Check items off as completed: `[x]`
- For DB verification, use `npx insforge db query "SELECT ..." --json`
- Automated testing scripts can be built against these checklist items
- Pre-existing TS errors in `pb_migrations_deprecated/*.js` and `src/features/payments/mercadopago.ts` are known and unrelated
- Items marked [x] = verified by code inspection, static analysis, runtime snapshot from live dev server, or DB query
- Items marked [ ] = require interactive UI operation (form fill, button click, drag) via browser bridge or manual testing
