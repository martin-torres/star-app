# Feature Specification: Station-Based Order Routing with Real-Time Floor Plan Color Coding

**Feature Branch**: `005-station-based-order`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "The floor plan editor where the manager adds tables and items, analytics. This should also show for the front end but now instead of the adding it should work with the color coding system for the orders/items split for kitchen and bar and foh the flow of the ticket"

---

## Overview

The app already has two disconnected pieces:

1. **Manager Hub → Floor Plan Editor** (Phase C) — a drag-and-drop canvas where tables show **status colors** via a demo cycling system. The color map, urgency priority, and visual state resolver are built.
2. **Order pipeline** (Phase B) — `orders` table with `kitchen_status`, `bar_status`, `foh_request_status`, `items` (JSONB), and `status_timestamps`. The `menu_items.station` column assigns each item to a station.

These are currently **not wired together**. The floor plan cycles demo colors instead of reflecting real order data. The admin kitchen view (`?mode=admin`) shows a flat list with no station separation.

This feature **completes the feedback loop**:

```
Order placed → Items split by station (Kitchen/Bar/FOH)
  → Station views show item-level progress
  → Table status auto-calculates from per-station completion
  → Floor plan table colors update in real-time
  → FOH/Manager sees at a glance which tables need attention
```

The **floor plan IS the FOH/Manager visualization** — by looking at table colors, they instantly know the predominant status at each table. This is not about item-level color codes on a separate board; it's about **table-level urgency colors on the floor plan** driven by real-time order data.

---

## Color Coding Matrix — TABLE LEVEL (Floor Plan)

These colors render on two surfaces:

1. **Table shapes in the floor plan canvas** — FOH and managers see the overall state of each table at a glance
2. **Item cards in station views** — kitchen/bar staff see their item's progress through the same color language, so they instantly know where each item stands without reading text

| Urgency | Table Status | Color | Hex | Meaning |
|---------|-------------|-------|-----|---------|
| 🔟 Highest | `customer_request` | Red | `#ef4444` | Customer needs staff (bill, help, modification) — **immediate attention** |
| 9️⃣ | `ready_pickup` | Light Red | `#fca5a5` | Food/drinks ready to be served to table |
| 8️⃣ | `order_accepted` | Light Blue | `#93c5fd` | Order taken, kitchen/bar working on it |
| 7️⃣ | `new_order` | Light Yellow | `#fde68a` | Fresh order just placed, not yet acknowledged |
| 6️⃣ | `delivering` | Light Purple | `#c4b5fd` | Items being delivered to table |
| 5️⃣ | `cleaning` | Cyan | `#67e8f9` | Table being cleaned/set up |
| 4️⃣ | `reserved_only` | Amber | `#f59e0b` | Reserved for future booking |
| 3️⃣ | `occupied_idle` | Gray | `#e5e7eb` | Occupied but no active orders |
| 2️⃣ | `available_empty` | Transparent | — | Empty, ready for seating |
| 1️⃣ | `delivered` | Transparent | — | Everything delivered, awaiting payment/close |

> **How to read it**: Red = needs immediate attention. Yellow = fresh. Blue = working on it. Gray = idle. Transparent = done/free. A kitchen item card that's yellow just arrived; blue means cooking started; light red means ready to plate.

---

## Station Views — ITEM LEVEL (Kitchen/Bar Production Screens)

Separate from the floor plan, **production staff** get item-level lists filtered by station.

### Kitchen View (`cocina`)

Flat scrollable list showing ONLY items where `menu_items.station = 'kitchen'`. Each **card's background color** matches the item's status using the same color matrix as the floor plan — staff instantly knows the state of their work:

| Item Card Background | Meaning |
|---------------------|---------|
| **Yellow** (`#fde68a`) | Item just arrived (`recibido`) — fresh, not yet worked |
| **Blue** (`#93c5fd`) | Item being worked (`preparando`) — in progress |
| **Light Red** (`#fca5a5`) | Item is ready (`listo`) — done, waiting pickup |

```
┌──────────────────────────────┐
│ 🌮 Taco al Pastor   ⏱ 4:32  │  ← card background = yellow if recibido,
│ Mesa 5 · Ticket #A7          │     blue if preparando, light red if listo
│ [recibido] [preparando] ✓    │
└──────────────────────────────┘
```

- **Item-level status** (not table-level): `recibido → preparando → listo`
- Card background transitions automatically as staff advances status
- Buttons to advance: "Preparando" (blue) then "Listo" (green)
- Items sorted by oldest-first, with real-time insertion of new items
- Separate from customer_request flow (those go to FOH)

### Bar View (`barra`)

Same as Kitchen, but ONLY items where `menu_items.station = 'bar'`.
Same three-state progression with matching color transitions. Independent from Kitchen.

### FOH Board

FOH gets a **customer request** panel (not production items). Shows:
- Tables where `customer_request` flag is active — with the customer's note
- Buttons: "Resuelto" (dismisses the request, table returns to previous status)

### Ticket Flow Timeline

Clicking any item in a station view reveals a **compact timeline**:
```
📥 Recibido   2:30 PM   ⏱ 0:30
👨‍🍳 Cocina    2:31 PM   → preparando   ⏱ 4:32
🍽 Listo      —         ⏳ en progreso
```
Read from `status_timestamps` JSONB on the order.

---

## How Station Progress Feeds the Floor Plan

This is the core wiring that **does not exist yet**:

```
Order item moves to "listo" in Kitchen
  → orders.kitchen_status = 'completed'
    → TableStatusSyncService receives update
      → resolveTableStatuses() re-evaluates
        → new primary/primaryColor computed
          → Floor canvas re-renders table fill color
```

**Aggregation rules** (how table status derives from stations):

| If | Then Table Status |
|----|-------------------|
| Any item at table is still `recibido` in any station | `order_accepted` (blue) — still working |
| All items at table are `listo` in all stations | `ready_pickup` (light red) — ready to serve |
| Customer flags staff | `customer_request` (red) — overrides everything |
| Order fully completed + paid | `delivered` (transparent) → eventually `cleaning` (cyan) |
| No orders but table is seated | `occupied_idle` (gray) |

The urgency ranking already defined in `statusPriority.ts` handles the rest — `customer_request` always wins as the highest priority, followed by `ready_pickup`, `order_accepted`, `new_order`, etc.

---

## User Scenarios & Testing

### User Story 1 — FOH Reads Table Status from Floor Plan (Priority: P1 🎯)

A host/server looks at the floor plan and instantly knows which tables need attention by the color.

**Why this priority**: This is the foundational value — FOH can manage the floor from a single glance. Without this, station views are just lists.

**Independent Test**: Place a new order at table 3. The floor plan table 3 changes from transparent (available) to yellow (new_order). Server sees the yellow table, walks over.

**Acceptance Scenarios**:

1. **Given** an empty restaurant floor, **When** no orders exist, **Then** all tables render as `available_empty` (transparent) or `occupied_idle` (gray if occupied)
2. **Given** a new order is placed at table 3, **When** the order contains items for Kitchen, **Then** table 3 turns yellow (`new_order`) on the floor plan within 3 seconds
3. **Given** a table is yellow (new_order), **When** a kitchen staff taps "Preparando" on the first item, **Then** table 3 changes to blue (`order_accepted`)
4. **Given** all items at a table reach "listo" status, **When** the final station completes, **Then** the table turns light red (`ready_pickup`)
5. **Given** a customer needs help and triggers a request, **When** the request is submitted, **Then** the table turns red (`customer_request`) overriding any other status

---

### User Story 2 — Kitchen Staff Works Their Station (Priority: P1 🎯)

Kitchen opens the Cocina view and sees only kitchen items. They advance items through prep.

**Why this priority**: Without station separation, the kitchen sees bar and FOH items too. This enables the per-station progress that feeds the floor plan colors.

**Independent Test**: Place an order with 1 kitchen item + 1 bar item. The Cocina view shows only the kitchen item. The Bar view shows only the bar item.

**Acceptance Scenarios**:

1. **Given** an order with items assigned to different stations, **When** a staff member opens Cocina, **Then** only items with `station = 'kitchen'` appear
2. **Given** an item in Cocina is marked "preparando" by staff, **When** the Bar view is checked, **Then** bar items are unaffected
3. **Given** a kitchen item is marked "listo", **When** the floor plan is viewed, **Then** the table's status may change based on aggregation rules (see US1)

---

### User Story 3 — FOH Request Board (Priority: P2)

FOH staff see a dedicated panel listing customer requests/resolved status.

**Why this priority**: Red-coded tables on the floor plan need staff to know WHY. The FOH board provides the detail behind the red color.

**Independent Test**: Mark a table with a customer request. Floor plan table turns red. Open FOH board → see the request details.

**Acceptance Scenarios**:

1. **Given** a table has `customer_request = true`, **When** the floor plan renders, **Then** the table is red
2. **Given** a red table on the floor plan, **When** FOH opens the request board, **Then** they see the specific request/note
3. **Given** an FOH request is resolved, **When** staff taps "Resuelto", **Then** the table returns to its previous status-based color

---

### User Story 4 — Ticket Flow Timeline (Priority: P2)

Any staff member can inspect an order item's journey through stations.

**Why this priority**: Essential for finding bottlenecks. If a table has been blue for 20 minutes, staff needs to see which station is slow.

**Independent Test**: Place an order, wait 2 minutes, check timeline → see recibido → preparando with elapsed times.

**Acceptance Scenarios**:

1. **Given** an order being prepared, **When** staff clicks any item, **Then** a timeline shows: Recibido → [Station name: status] with timestamps
2. **Given** an item has been in "preparando" > 15 minutes, **When** viewing the timeline, **Then** a visual bottleneck warning appears
3. **Given** the timeline shows station handoffs, **When** the order completes, **Then** total prep time is shown

---

### User Story 5 — Manager Dashboard Station Analytics (Priority: P3)

The Manager Analytics module shows station throughput data instead of a placeholder.

**Why this priority**: Valuable but not blocking day-to-day operations.

**Independent Test**: Run 10 orders through the system, check analytics → see per-station average times.

**Acceptance Scenarios**:

1. **Given** orders have been processed, **When** manager opens Analytics, **Then** they see per-station throughput (items/hour) and average prep times
2. **Given** a station is behind, **When** viewing analytics, **Then** a bottleneck alert highlights the station

---

### Edge Cases

- **Item with no station assigned** → defaults to `'kitchen'` with a subtle "uncategorized" indicator
- **All stations "listo" but order not yet paid** → table shows `ready_pickup` (light red) until payment, then becomes `delivered` (transparent)
- **Customer request while items are still cooking** → red overrides blue — request priority is absolute. Floor plan shows red with a small badge showing "request" overlay
- **New station value created** (e.g., "grill", "sushi") → no code change needed; it reads from `menu_items.station`. The station view tab auto-generates from distinct station values found in active orders
- **Table with no active order but occupied** → renders `occupied_idle` (gray)
- **Multiple requests at same table** → status is still `customer_request` (red) — detail view shows a list of requests

---

## Requirements

### Functional Requirements

- **FR-001**: The floor plan table color MUST reflect the **real-time aggregated table status** derived from order data, not demo cycling
- **FR-002**: Table status MUST be computed from the per-station completion state of all items at that table using the urgency/priority ranking in `statusPriority.ts`
- **FR-003**: `customer_request` MUST be the highest-priority status and override all other table colors
- **FR-004**: Station views (Kitchen, Bar) MUST filter items by `menu_items.station` value and show only relevant items
- **FR-005**: Each station MUST track independent item status: `recibido → preparando → listo`
- **FR-006**: Station status updates MUST publish to the `TableStatusSyncService` which triggers floor plan re-render

- **FR-008**: The FOH board MUST display customer requests with the ability to mark them resolved
- **FR-009**: The Manager Analytics placeholder MUST be replaced with per-station throughput metrics
- **FR-010**: The Manager Operations → Catalog tab MUST allow editing `station` on menu items
- **FR-011**: The `orders.kitchen_status`, `bar_status`, `foh_request_status` columns MUST be written to when staff advances item status
- **FR-012**: Items with no `station` value MUST default to `'kitchen'` and display a subtle indicator
- **FR-013**: The existing `KitchenView` (`?mode=admin`) MUST remain as-is — station views are separate screens accessed via navigation, not a replacement

### Key Entities

- **Table** (floor plan object): Has a visual `fill color` computed from real-time order data via `TableVisualState.render.background`
- **TableStatus** (status system): 12 enum values with urgency ranking, resolved via `resolveTableStatuses()` which picks primary + secondary based on priority
- **MenuItem.station**: Text column — 'kitchen', 'bar', or any custom value. Dictates which station view processes the item
- **OrderItem.station**: Snapshot of the menu item's station at order time (to preserve routing even if menu changes)
- **Order**: Tracks per-station completion via `kitchen_status`, `bar_status`, `foh_request_status` and timestamps via `status_timestamps` JSONB
- **TableStatusSyncService**: Singleton that bridges order events → floor plan color updates (already structured as a pub/sub in Phase C)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: After any order event (new order, item status change, request), the affected floor plan table updates color within 3 seconds
- **SC-002**: `customer_request` (red) is always the dominant color regardless of other statuses at the same table
- **SC-003**: Station views (Cocina, Barra) have zero cross-contamination — kitchen items never appear in bar view and vice versa
- **SC-004**: After placing an order with items across 3 stations, all 3 station views update independently within 5 seconds
- **SC-005**: A manager can see per-station throughput (items/hour) for the last shift in the Analytics tab

## Assumptions

- The floor plan's demo status cycling (currently in `ManagerHubPage.tsx`) is replaced with a real `TableStatusSyncService` subscription that reads from the orders table
- The existing `resolveTableVisualState()` and `resolveTableStatuses()` functions remain as-is — they already handle the correct logic. Only the **input data** changes from demo to real
- Real-time updates use the existing InsForge realtime channel (already wired in `orders-repo.ts`)
- Station views use the existing `subscribeToOrders` pattern, just filtered by item.station
- The `OrderItem` type needs a `station` field added (snapshot from MenuItem at order time)
- FOH requests are tracked via the existing `customer_request` status on the table/dining_session, not a new entity
