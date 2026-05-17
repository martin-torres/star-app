# Feature Specification: Station-Based Order Routing with Ticket Flow & Color Coding

**Feature Branch**: `005-station-based-order`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "The floor plan editor where the manager adds tables and items, analytics. This should also show for the front end but now instead of the adding it should work with the color coding system for the orders/items split for kitchen and bar and foh the flow of the ticket"

---

## Overview

The existing app has a working **Manager Hub** with:
- A floor plan editor for restaurant layout
- Menu CRUD with station assignment (`menu_items.station`)
- Order intake (to-go, delivery, dine-in)

The schema already has per-station status tracking (`orders.kitchen_status`, `bar_status`, `foh_request_status`) but **no front-end display** for it. This feature adds:

1. **Front-end color-coded status boards** for each station (Kitchen, Bar, FOH) showing only their relevant items
2. **Ticket flow visualization** — the journey of each order item through station handoffs
3. **Real-time station-level status updates** in the existing kitchen/admin view and the manager dashboard

This turns the current "single-pipeline" order tracking into a **multi-station orchestration system**.

---

## User Scenarios & Testing

### User Story 1 — Kitchen Staff Sees Their Items Only (Priority: P1)

The cook opens the "Cocina" view and sees only items assigned to the Kitchen station, with their own independent statuses (recibido → preparando → listo).

**Why this priority**: Without station filtering, all items show in one list, creating confusion. This is the foundation for all other station views.

**Independent Test**: Create an order with one Kitchen item and one Bar item. The Kitchen view shows only the Kitchen item. Bar view shows only the Bar item.

**Acceptance Scenarios**:

1. **Given** an order with items assigned to different stations (Kitchen, Bar, FOH), **When** a staff member opens the Cocina view, **Then** only Kitchen-station items are visible
2. **Given** the Cocina view is open, **When** a new order arrives with a Kitchen item, **Then** it appears automatically (real-time subscription)
3. **Given** the Cocina view is open, **When** all kitchen items for an order are marked "listo", **Then** the order row shows a "Done" state and moves to a completed section

---

### User Story 2 — Bar Staff Sees Drink Items (Priority: P1)

Bartenders see a dedicated Bar view showing only Bar-station items, with status: recibido → preparando → listo.

**Why this priority**: Bar and Kitchen operate independently. Same criticality as US1.

**Independent Test**: Same order as US1. Bar staff sees only the drink items. Can mark them "listo" without affecting Kitchen items.

**Acceptance Scenarios**:

1. **Given** an order with Bar items, **When** the bar view is opened, **Then** only items where `menu_items.station = 'bar'` are shown
2. **Given** a Bar item is marked "listo" by staff, **When** the Kitchen view is checked, **Then** Kitchen items remain unaffected
3. **Given** a Bar item is mid-preparation, **When** the bartender taps "preparando", **Then** the status updates in real-time

---

### User Story 3 — FOH Exceptions Board (Priority: P2)

Front-of-house staff see a view for customer requests, modifications, and special instructions, with a visual alert system.

**Why this priority**: FOH requests are lower-volume but visibility-critical for service quality.

**Independent Test**: Submit an order with a note/customer request. It appears on the FOH board with a highlighted alert.

**Acceptance Scenarios**:

1. **Given** an order has `notes` or special instructions, **When** the FOH view loads, **Then** these are highlighted with a distinctive alert indicator
2. **Given** an FOH request is resolved, **When** staff marks it as "resuelto", **Then** it moves to a resolved section

---

### User Story 4 — Ticket Flow Timeline (Priority: P2)

Each order item shows its journey as a visual timeline: which stations processed it, current station status, and total elapsed time.

**Why this priority**: Critical for operational visibility — knowing exactly where each item is in the process.

**Independent Test**: Place an order with 3 items across 2 stations. The ticket timeline shows per-station progress bars and timestamps.

**Acceptance Scenarios**:

1. **Given** an order is being prepared, **When** staff inspects any item's detail, **Then** they see a timeline: Recibido → [Station A: Preparando] → [Station B: Listo] → Complete
2. **Given** an item has been in "preparando" for more than a configurable threshold, **When** viewing the ticket, **Then** the timeline shows a visual warning

---

### User Story 5 — Manager Dashboard Station Analytics (Priority: P3)

The existing Manager Analytics placeholder is replaced with real-time station throughput data: items per station per hour, average prep time, and bottleneck detection.

**Why this priority**: Valuable but not blocking day-to-day operations.

**Independent Test**: View analytics after 3 orders across shifts — see per-station preparation time averages.

**Acceptance Scenarios**:

1. **Given** orders have been processed across stations, **When** manager opens Analytics, **Then** they see per-station throughput and average item prep time
2. **Given** a station has items in "recibido" for >10 minutes, **When** viewing analytics, **Then** a bottleneck alert is shown

---

### Edge Cases

- What happens when an order item has **no station** assigned? Defaults to "Kitchen" and shows a config tag missing indicator
- What happens when all stations mark "listo" but the overall order still needs packing? The order stays in "empaquetando" with all stations green
- What happens if a station is renamed/added (e.g., "Grill", "Sushi", "Dessert")? The system uses the `menu_items.station` text value — adding a new station is just entering a new name in menu management
- How does the system handle rush hour where items pile up? The station view shows items sorted by oldest-first, with a configurable max visible count per station

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST filter order items by `menu_items.station` for each station view (Kitchen, Bar, FOH)
- **FR-002**: Each station MUST have its own independent status progression (recibido → preparando → listo) tracked via `orders.kitchen_status`, `orders.bar_status`, `orders.foh_request_status`
- **FR-003**: Station status updates MUST propagate via real-time subscriptions to all open views
- **FR-004**: The kitchen/bar ticket view MUST color-code items by their current station status:
  - `recibido` → red/amber (needs attention)
  - `preparando` → blue/cyan (in progress)
  - `listo` → green (completed)
- **FR-005**: The FOH board MUST highlight customer requests/notes with a distinct visual treatment (badge, accent color)
- **FR-006**: Each order item MUST show an elapsed time counter from when it entered `recibido`
- **FR-007**: The ticket flow timeline MUST display: received timestamp → per-station entry → per-station completion → overall completion
- **FR-008**: Items with no `station` value MUST default to "Kitchen" and display a subtle indicator
- **FR-009**: The existing KitchenView in App.tsx (accessed via `?mode=admin`) MUST be replaced with the station-aware view
- **FR-010**: The manager Operations module "catalog" tab MUST allow editing the `station` field on menu items

### Key Entities

- **MenuItem**: Already has `station: text` column — determines which station processes this item
- **OrderItem**: Inherits `MenuItem` properties and includes `quantity`, `weightInGrams`, `selectedOption` — at display time, its station is derived from the underlying MenuItem
- **Order**: Already has `kitchen_status`, `bar_status`, `foh_request_status` (USER-DEFINED types) and `status_timestamps` (JSONB) — these track per-station lifecycle
- **Station**: A logical grouping — not a separate table. Defined by the text value of `menu_items.station`. Common values: 'kitchen', 'bar', 'foh'. Extensible by entering new values in menu management
- **TicketFlowItem**: A display composite — pairs an `OrderItem` with its station status, elapsed time, and timeline stages. Computed at render time from order + menu data

---

## Color Coding System

| Station | Status | Color Token | Hex | Visual |
|---------|--------|-------------|-----|--------|
| Kitchen | recibido | `kitchen-recibido` | `#ef4444` | Red bg, white text, pulsing border |
| Kitchen | preparando | `kitchen-preparando` | `#3b82f6` | Blue bg, white text, spinning icon |
| Kitchen | listo | `kitchen-listo` | `#22c55e` | Green bg, white text, checkmark |
| Bar | recibido | `bar-recibido` | `#f97316` | Orange bg, white text |
| Bar | preparando | `bar-preparando` | `#8b5cf6` | Purple bg, white text |
| Bar | listo | `bar-listo` | `#22c55e` | Green bg, white text |
| FOH | pending | `foh-pending` | `#eab308` | Yellow bg, bell icon |
| FOH | resolved | `foh-resolved` | `#22c55e` | Green bg, checkmark |

### Status Progression Rules

- Each station progresses independently via: `recibido → preparando → listo`
- A station cannot skip states (no recibido → listo directly)
- An order's overall `status` is computed as the aggregate of all stations:
  - All stations "listo" + payment complete → "entregado"
  - Any station "recibido" → overall stays "recibido"
- FOH uses `pending → resolved` instead of the 3-state progression

### Ticket Flow Visualization

Each item card in a station view shows:
```
┌─────────────────────────────────────┐
│ 🌮 Taco al Pastor          ⏱ 4:32   │
│ Ticket #A7 · Mesa 5                 │
│ ──────────────────────────           │
│ 📥 Recibido    2:30 PM              │
│ 🔵 Preparando  now     ⏳ 4:32      │
│ ⬜ Listo       —                     │
│ ──────────────────────────           │
│ [Preparando] [Listo]                │
└─────────────────────────────────────┘
```

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: After a new order is placed, Kitchen-station items appear on the Cocina view within 3 seconds (real-time sync)
- **SC-002**: Bar-station items never appear on the Kitchen view and vice versa (zero cross-contamination)
- **SC-003**: Each station status update takes 1 tap and reflects within 1.5 seconds on all open views
- **SC-004**: The FOH board shows customer requests with zero manual data entry (derived automatically from order notes/items)
- **SC-005**: Ticket timeline renders for any order within 2 seconds of opening detail view

## Assumptions

- Station values are managed through the menu catalog CRUD (manager can set `station` per item)
- Real-time subscriptions use the existing InsForge SDK's `realtime` channel mechanism (already wired in `orders-repo.ts`)
- The floor plan editor's table color coding (already built in Phase C) is **separate** from this order-item station color coding — they serve different purposes (table occupancy vs item production status)
- Station status updates are performed by staff via taps in the station view, not automatically
- The existing `orders.status_timestamps` JSONB stores all timestamps and will be extended with station-specific entries like `{ kitchen_recibido: 1, kitchen_preparando: 2, ... }`
