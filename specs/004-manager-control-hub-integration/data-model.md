# Data Model: Star-App + FloorPlan Integrated Database

**Project**: star-multi-tenant-app
**Database Target**: New InsForge project (fresh schema)
**Version**: 1.0.0

---

## Design Principles

- **Code-first**: Columns match what star-app's existing code expects (snake_case, flat text for simple fields)
- **FloorPlan-native**: Tables for floor plans use the coordinate/shape system from FloorPlan project
- **No i18n JSONB**: Keep names/descriptions as plain text strings (star-app uses `languageResolver.ts`, not JSONB)
- **restaurant_id on every table** for multi-tenancy
- **UUID primary keys** (InsForge default)

---

## Tables

### restaurants

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| name | text NOT NULL | Restaurant name (e.g. "El Arrocito") |
| slug | text UNIQUE NOT NULL | URL slug (e.g. "el-arrocito") |
| address | text | |
| phone | text | |
| primary_color | text | #hex color |
| secondary_color | text | #hex color |
| accent_color | text | #hex color |
| background_color | text | #hex color |
| logo_url | text | |
| hero_text | text | |
| hero_image_url | text | |
| tagline | text | |
| currency | text NOT NULL DEFAULT 'MXN' | |
| mode | text NOT NULL DEFAULT 'both' | 'to-go' \| 'dine-in' \| 'both' |
| google_font_url | text | |
| google_font_name | text | |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### menu_categories

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants | |
| name | text NOT NULL | Display name |
| sort_order | integer DEFAULT 0 | |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### menu_items

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| category_id | uuid FK → menu_categories | Replaces string `category` field |
| name | text NOT NULL | |
| description | text | |
| price | numeric(10,2) NOT NULL DEFAULT 0 | |
| image_url | text | |
| available | boolean DEFAULT true | |
| is_weight_based | boolean DEFAULT false | |
| weight_price_per_kg | numeric(10,2) | |
| weight_in_grams | integer | Default serving weight |
| options | jsonb | Array of ItemOption objects |
| strain | text | 'sativa' \| 'indica' \| 'hybrid' |
| stock | integer DEFAULT -1 | -1 = unlimited |
| track_inventory | boolean DEFAULT false | |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### orders

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| table_id | uuid FK → restaurant_tables | For dine-in |
| customer_name | text | |
| customer_address | text | |
| items | jsonb NOT NULL | Array of OrderItem objects |
| total | numeric(10,2) NOT NULL | |
| subtotal | numeric(10,2) | |
| tax | numeric(10,2) | |
| delivery_fee | numeric(10,2) DEFAULT 0 | |
| status | text NOT NULL DEFAULT 'recibido' | OrderStatus pipeline |
| payment_method | text | 'efectivo' \| 'tarjeta' \| 'transferencia' \| 'conekta' \| 'mercadopago' \| 'codi' |
| pay_with_amount | numeric(10,2) | Cash payment amount |
| transfer_screenshot | text | URL to uploaded proof |
| delivery_distance_km | numeric(5,2) | |
| order_type | text | 'pickup' \| 'delivery' \| 'dine-in' |
| notes | text | |
| session_id | text | For dine-in session tracking |
| timestamp | bigint NOT NULL | Unix ms |
| status_timestamps | jsonb | Partial<Record<OrderStatus, number>> |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### order_items

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| order_id | uuid FK → orders NOT NULL | |
| menu_item_id | uuid FK → menu_items | |
| item_name | text NOT NULL | Snapshot at order time |
| item_price | numeric(10,2) NOT NULL | Snapshot at order time |
| quantity | integer NOT NULL | |
| subtotal | numeric(10,2) NOT NULL | |
| weight_in_grams | integer | For weight-based items |
| selected_option | jsonb | ItemOption snapshot |
| is_bundle | boolean DEFAULT false | |
| bundle_items | jsonb | Array of BundleItem |
| instructions | text | Special requests |
| created_at | timestamptz | auto |

### restaurant_tables

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| table_number | integer NOT NULL | |
| display_name | text | Optional friendly name |
| seats | integer NOT NULL DEFAULT 2 | |
| location | text | 'patio' \| 'window' \| 'balcony' \| 'middle' \| 'bar' \| 'private' \| 'outdoor' |
| is_available | boolean DEFAULT true | |
| qr_code_url | text | QR code image URL |
| x | integer | Floor plan X coordinate |
| y | integer | Floor plan Y coordinate |
| width | integer | Canvas width |
| height | integer | Canvas height |
| rotation | integer DEFAULT 0 | Degrees |
| shape | text DEFAULT 'rectangle' | 'square' \| 'rectangle' \| 'circular' \| 'booth' \| 'l_shaped' |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### floor_plans

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| width | integer NOT NULL DEFAULT 800 | Canvas width |
| height | integer NOT NULL DEFAULT 600 | Canvas height |
| background_color | text DEFAULT '#f5f5f5' | |
| tables_data | jsonb | FloorTable[] from FloorPlan editor |
| props_data | jsonb | FloorProp[] from FloorPlan editor |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### floor_props

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| floor_plan_id | uuid FK → floor_plans | |
| prop_type | text NOT NULL | 'stage' \| 'bathroom' \| 'staircase' \| 'window' \| 'main_door' \| 'door' \| 'kitchen_area' |
| x | integer | |
| y | integer | |
| width | integer | |
| height | integer | |
| rotation | integer DEFAULT 0 | |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### promos

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| code | text | Promo code |
| name | text | Display name |
| description | text | |
| image_url | text | |
| price | numeric(10,2) | |
| active | boolean DEFAULT true | |
| type | text | 'promotion' \| 'event' |
| offer_type | text | 'discount' \| '2x1' \| 'free' \| 'custom' |
| offer_value | text | |
| discount_percent | integer | |
| discount_type | text | 'fixed' \| 'percent' |
| discount_value | numeric(10,2) | |
| original_price | numeric(10,2) | For promo items |
| bundle_items | jsonb | Array of BundleItem |
| item_id | uuid FK → menu_items | Associated menu item |
| target_date | date | For date-specific promotions |
| target_weekday | integer | 0-6, for recurring weekly |
| conditions | jsonb | { orderBeforeHour, orderAfterHour, minOrderAmount, daysOfWeek } |
| action | jsonb | { type, itemCode, value } |
| active_from | timestamptz | |
| active_until | timestamptz | |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### promo_menu_items (join table)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| promo_id | uuid FK → promos NOT NULL | |
| menu_item_id | uuid FK → menu_items NOT NULL | |

### payments

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| order_id | uuid FK → orders NOT NULL | |
| amount | numeric(10,2) NOT NULL | |
| method | text | 'efectivo' \| 'tarjeta' \| 'transferencia' \| 'conekta' \| 'mercadopago' \| 'codi' |
| status | text NOT NULL DEFAULT 'pending' | |
| user_id | text | Split bill user |
| user_name | text | Split bill user name |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### dining_sessions

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| table_id | uuid FK → restaurant_tables NOT NULL | |
| customer_name | text | |
| customer_phone | text | |
| status | text NOT NULL DEFAULT 'active' | 'active' \| 'ordering' \| 'bill_requested' \| 'paid' \| 'closed' |
| order_ids | jsonb | Array of order UUIDs |
| session_start | bigint NOT NULL | Unix ms |
| session_end | bigint | Unix ms |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### bill_requests

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| table_id | uuid FK → restaurant_tables NOT NULL | |
| order_ids | jsonb | Array of order UUIDs |
| subtotal | numeric(10,2) | |
| tax | numeric(10,2) | |
| tip | numeric(10,2) | |
| total | numeric(10,2) NOT NULL | |
| status | text NOT NULL DEFAULT 'requested' | 'requested' \| 'processing' \| 'paid' \| 'cancelled' |
| payments | jsonb | Array of BillPayment objects |
| requested_at | bigint | Unix ms |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### visitors

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| ip | text | |
| user_agent | text | |
| device_type | text | 'mobile' \| 'desktop' \| 'tablet' |
| is_pwa_installed | boolean DEFAULT false | |
| session_id | text | |
| first_visit | timestamptz | |
| last_visit | timestamptz | |
| visit_count | integer DEFAULT 1 | |
| associated_orders | jsonb | Array of order UUIDs |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### app_modules

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| restaurant_id | uuid FK → restaurants NOT NULL | |
| slug | text NOT NULL | 'menu' \| 'floor_plan' \| 'ordering' \| 'promos' \| 'payments' \| 'staff' |
| enabled | boolean DEFAULT true | |
| settings | jsonb | Module-specific settings |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

---

## Key Design Decisions

1. **restaurant_settings flattened into restaurants table**. star-app's `AppSkinSettings` has fields like `primaryColor`, `name`, `tagline`, etc. These are columns on `restaurants` directly, not a separate settings JSON blob. Simpler queries, typed columns.

2. **menu_items.category → menu_categories FK**. The existing code has a `category: string` on MenuItem, but a normalized categories table is more flexible and matches the FloorPlan/manager-hub UI paradigm. The mapper will resolve category_id to a display name.

3. **restaurant_tables has both floor-plan coordinates AND operational fields**. `x, y, width, height, rotation, shape` come from the FloorPlan editor. `table_number, seats, location, qr_code_url, is_available` are the operational fields from star-app. One table serves both purposes.

4. **floor_plans stores canvas metadata separately**. The floor plan entity holds canvas dimensions and background. Individual table/prop positions are stored on `restaurant_tables` and `floor_props`. This avoids a monolithic JSON blob while keeping the canvas model clean.

5. **Promos table merges both paradigms**. star-app's `Promotion` type (with conditions/actions fields) and FloorPlan's `PromotionEvent` (with type/offerType/event paradigm) are merged into one table. The `type` field ('promotion' | 'event') determines which fields apply.

6. **No i18n JSONB for name/description**. star-app uses `useTranslations` + `languageResolver.ts` for translations, not DB-level JSONB. Keeping names as plain text avoids a data layer rewrite for the customer-facing features.

## Seed Data

New database will be seeded with:
- "El Arrocito" restaurant (retaining the original brand)
- OR "Di Pasquale" restaurant (from the existing qr-restaurant-app data)
- Menu items matching the restaurant category
- 4-6 tables with floor plan coordinates
- 1 floor plan canvas (800x600)
- Admin credentials for manager hub access
