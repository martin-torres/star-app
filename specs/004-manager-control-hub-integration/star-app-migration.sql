-- ============================================================
-- Migration: Extend restaurant-platform schema for star-app
-- Targets: Project 2y542jyv ("Dond my first project")
-- ============================================================

-- 1. ADD MISSING COLUMNS TO menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_weight_based boolean DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS weight_price_per_kg numeric(10,2);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS weight_in_grams integer;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS strain text;

-- 2. ADD MISSING COLUMNS TO orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pay_with_amount numeric(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS timestamp bigint;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance_km numeric(5,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_id text;

-- 3. ADD MISSING COLUMNS TO order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS weight_in_grams integer;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_bundle boolean DEFAULT false;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_items jsonb;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS instructions text;

-- 4. ADD MISSING COLUMNS TO restaurant_tables
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS qr_code_url text;

-- 5. ADD MISSING COLUMNS TO restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS hero_text text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS google_font_url text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS google_font_name text;

-- 6. ADD MISSING COLUMNS TO promos
ALTER TABLE promos ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS type text DEFAULT 'promotion';
ALTER TABLE promos ADD COLUMN IF NOT EXISTS offer_type text;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS offer_value text;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS bundle_items jsonb;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS target_date date;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS target_weekday integer;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS conditions jsonb;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS action jsonb;

-- ============================================================
-- CREATE MISSING TABLES
-- ============================================================

-- 7. menu_categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. dining_sessions
CREATE TABLE IF NOT EXISTS dining_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id uuid REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  status text NOT NULL DEFAULT 'active',
  order_ids jsonb DEFAULT '[]'::jsonb,
  session_start bigint NOT NULL,
  session_end bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. bill_requests
CREATE TABLE IF NOT EXISTS bill_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id uuid REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  order_ids jsonb DEFAULT '[]'::jsonb,
  subtotal numeric(10,2),
  tax numeric(10,2),
  tip numeric(10,2),
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  payments jsonb DEFAULT '[]'::jsonb,
  requested_at bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. app_modules
CREATE TABLE IF NOT EXISTS app_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  enabled boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, slug)
);

-- ============================================================
-- UPDATE SEED DATA FOR "Di Pasquale" OR "Azucar y Nuez"
-- ============================================================

-- Update Di Pasquale with hero/tagline/font info (custom page for manager hub testing)
UPDATE restaurants
SET
  hero_text = 'Auténtica cocina italiana en el corazón de Monterrey',
  hero_image_url = '',
  tagline = 'Tradición Italiana',
  google_font_url = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap',
  google_font_name = 'Playfair Display'
WHERE slug = 'di-pasquale';

-- Insert app_modules for Di Pasquale
INSERT INTO app_modules (restaurant_id, slug, enabled, settings)
SELECT id, 'menu', true, '{}'::jsonb FROM restaurants WHERE slug = 'di-pasquale'
WHERE NOT EXISTS (SELECT 1 FROM app_modules am JOIN restaurants r ON r.id = am.restaurant_id WHERE r.slug = 'di-pasquale' AND am.slug = 'menu');

INSERT INTO app_modules (restaurant_id, slug, enabled, settings)
SELECT id, 'floor_plan', true, '{}'::jsonb FROM restaurants WHERE slug = 'di-pasquale'
WHERE NOT EXISTS (SELECT 1 FROM app_modules am JOIN restaurants r ON r.id = am.restaurant_id WHERE r.slug = 'di-pasquale' AND am.slug = 'floor_plan');

INSERT INTO app_modules (restaurant_id, slug, enabled, settings)
SELECT id, 'ordering', true, '{}'::jsonb FROM restaurants WHERE slug = 'di-pasquale'
WHERE NOT EXISTS (SELECT 1 FROM app_modules am JOIN restaurants r ON r.id = am.restaurant_id WHERE r.slug = 'di-pasquale' AND am.slug = 'ordering');

INSERT INTO app_modules (restaurant_id, slug, enabled, settings)
SELECT id, 'promos', true, '{}'::jsonb FROM restaurants WHERE slug = 'di-pasquale'
WHERE NOT EXISTS (SELECT 1 FROM app_modules am JOIN restaurants r ON r.id = am.restaurant_id WHERE r.slug = 'di-pasquale' AND am.slug = 'promos');

INSERT INTO app_modules (restaurant_id, slug, enabled, settings)
SELECT id, 'payments', true, '{}'::jsonb FROM restaurants WHERE slug = 'di-pasquale'
WHERE NOT EXISTS (SELECT 1 FROM app_modules am JOIN restaurants r ON r.id = am.restaurant_id WHERE r.slug = 'di-pasquale' AND am.slug = 'payments');

INSERT INTO app_modules (restaurant_id, slug, enabled, settings)
SELECT id, 'staff', true, '{}'::jsonb FROM restaurants WHERE slug = 'di-pasquale'
WHERE NOT EXISTS (SELECT 1 FROM app_modules am JOIN restaurants r ON r.id = am.restaurant_id WHERE r.slug = 'di-pasquale' AND am.slug = 'staff');
