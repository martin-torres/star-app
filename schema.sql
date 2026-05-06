-- ============================================================================
-- PocketBase Multi-Tenant Restaurant App Schema
-- ============================================================================
-- This SQL script creates all collections/tables for a multi-tenant
-- restaurant ordering app. It is designed to work with PocketBase's
-- SQLite-based pb_data or as a reference for raw PocketBase API calls.
--
-- Each collection includes a restaurant_id foreign key for multi-tenant
-- data isolation.
-- ============================================================================

-- ============================================================================
-- 1. restaurants — Primary tenant collection
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id              TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(7))) || lower(hex(randomblob(8)))),
    created         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
    updated         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),

    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    address         TEXT,
    phone           TEXT,
    primary_color   TEXT DEFAULT '#000000',
    secondary_color TEXT DEFAULT '#ffffff',
    accent_color    TEXT DEFAULT '#e53935',
    logo_url        TEXT,
    hero_text       TEXT,
    tagline         TEXT,
    currency        TEXT NOT NULL DEFAULT 'MXN',
    tax_rate        REAL DEFAULT 0.0,
    timezone        TEXT DEFAULT 'America/Mexico_City',
    hours           TEXT DEFAULT '{}',           -- JSON: day → {open, close}
    mode            TEXT NOT NULL DEFAULT 'both' CHECK (mode IN ('to-go', 'dine-in', 'both')),
    admin_email     TEXT,
    admin_pin       TEXT,
    delivery_enabled    INTEGER DEFAULT 0,
    delivery_fee        REAL DEFAULT 0.0,
    delivery_radius_km  REAL DEFAULT 5.0,
    telegram_bot_token  TEXT,
    telegram_chat_id    TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants (slug);

-- ============================================================================
-- 2. menu_items — Menu items scoped to a restaurant
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id              TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(7))) || lower(hex(randomblob(8)))),
    created         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
    updated         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),

    restaurant_id   TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT DEFAULT '',
    price           REAL NOT NULL CHECK (price >= 0),
    category        TEXT NOT NULL,
    subcategory     TEXT DEFAULT '',
    image           TEXT DEFAULT '',
    is_available    INTEGER DEFAULT 1,
    is_weight_based INTEGER DEFAULT 0,
    weight_price_per_kg REAL,
    options         TEXT DEFAULT '[]',           -- JSON array of ItemOption
    sort_order      INTEGER DEFAULT 0,
    track_inventory INTEGER DEFAULT 0,
    stock           INTEGER DEFAULT -1           -- -1 = unlimited
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category  ON menu_items (category);

-- ============================================================================
-- 3. tables — Dine-in tables (from Working-QR dining UX)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tables (
    id              TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(7))) || lower(hex(randomblob(8)))),
    created         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
    updated         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),

    restaurant_id   TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number    INTEGER NOT NULL CHECK (table_number > 0),
    display_name    TEXT,
    seats           INTEGER NOT NULL CHECK (seats > 0),
    location        TEXT DEFAULT 'middle' CHECK (location IN ('patio', 'window', 'balcony', 'middle', 'bar', 'private', 'outdoor')),
    qr_code_url     TEXT,
    x               REAL,
    y               REAL,
    is_available    INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant           ON tables (restaurant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tables_restaurant_num ON tables (restaurant_id, table_number);

-- ============================================================================
-- 4. orders — Customer orders (to-go, delivery, or dine-in)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id              TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(7))) || lower(hex(randomblob(8)))),
    created         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
    updated         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),

    restaurant_id   TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id        TEXT REFERENCES tables(id) ON DELETE SET NULL,
    customer_name   TEXT,
    customer_phone  TEXT,
    items           TEXT NOT NULL DEFAULT '[]',   -- JSON array of OrderItem
    total           REAL NOT NULL CHECK (total >= 0),
    subtotal        REAL,
    tax             REAL,
    delivery_fee    REAL DEFAULT 0.0,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending', 'recibido', 'preparando', 'empaquetando',
                        'listo', 'en_camino', 'entregado', 'pendiente_pago',
                        'paid', 'cancelled'
                    )),
    payment_method  TEXT CHECK (payment_method IN (
                        'efectivo', 'tarjeta', 'transferencia',
                        'conekta', 'mercadopago', 'codi'
                    )),
    order_type      TEXT NOT NULL DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery', 'dine-in')),
    notes           TEXT DEFAULT '',
    session_id      TEXT,
    status_timestamps   TEXT DEFAULT '{}'         -- JSON: status → ISO timestamp
);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_session    ON orders (session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders (created);

-- ============================================================================
-- 5. promos — Promotions / discounts per restaurant
-- ============================================================================
CREATE TABLE IF NOT EXISTS promos (
    id              TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(7))) || lower(hex(randomblob(8)))),
    created         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
    updated         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),

    restaurant_id   TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT DEFAULT '',
    discount_type   TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percent', 'free_item')),
    discount_value  REAL,
    active          INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_promos_restaurant ON promos (restaurant_id);

-- ============================================================================
-- 6. visitors — Anonymous visitor tracking per restaurant
-- ============================================================================
CREATE TABLE IF NOT EXISTS visitors (
    id              TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(7))) || lower(hex(randomblob(8)))),
    created         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
    updated         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),

    restaurant_id   TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id      TEXT NOT NULL,
    ip              TEXT,
    device_type     TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
    is_pwa_installed    INTEGER DEFAULT 0,
    visit_count     INTEGER DEFAULT 1,
    first_visit     TEXT,
    last_visit      TEXT
);

CREATE INDEX IF NOT EXISTS idx_visitors_restaurant ON visitors (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_session    ON visitors (session_id);

-- ============================================================================
-- 7. settings — JSON-based key/value settings per restaurant
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    id              TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(7))) || lower(hex(randomblob(8)))),
    created         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
    updated         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),

    restaurant_id   TEXT NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
    data            TEXT NOT NULL DEFAULT '{}'    -- JSON blob for flexible settings
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_restaurant ON settings (restaurant_id);

-- ============================================================================
-- AUDIT TRIGGERS: Auto-update `updated` timestamps
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS trg_restaurants_updated
    AFTER UPDATE ON restaurants
    FOR EACH ROW
BEGIN
    UPDATE restaurants SET updated = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_menu_items_updated
    AFTER UPDATE ON menu_items
    FOR EACH ROW
BEGIN
    UPDATE menu_items SET updated = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tables_updated
    AFTER UPDATE ON tables
    FOR EACH ROW
BEGIN
    UPDATE tables SET updated = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_orders_updated
    AFTER UPDATE ON orders
    FOR EACH ROW
BEGIN
    UPDATE orders SET updated = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_promos_updated
    AFTER UPDATE ON promos
    FOR EACH ROW
BEGIN
    UPDATE promos SET updated = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_visitors_updated
    AFTER UPDATE ON visitors
    FOR EACH ROW
BEGIN
    UPDATE visitors SET updated = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_settings_updated
    AFTER UPDATE ON settings
    FOR EACH ROW
BEGIN
    UPDATE settings SET updated = strftime('%Y-%m-%d %H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

-- ============================================================================
-- NOTES
-- ============================================================================
-- PocketBase automatically manages `created` and `updated` autodate fields.
-- This SQL uses explicit triggers for parity when running raw SQLite.
--
-- All JSON columns (hours, items, options, data, status_timestamps) store
-- serialized JSON text and should be parsed in the application layer.
--
-- The `id` format uses PocketBase's standard 15-char lowercase hex pattern.
-- Alternatively, replace with INTEGER PRIMARY KEY AUTOINCREMENT if preferred.
--
-- For multi-tenant isolation, always filter by restaurant_id in queries.
-- ============================================================================
