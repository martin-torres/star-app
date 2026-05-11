-- ============================================================
-- Migration: Create all tables for Azúcar y Nuez bakery app
-- ============================================================

-- 1. RESTAURANTS (multi-tenant support)
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  hours JSONB DEFAULT '{}',
  primary_color TEXT DEFAULT '#f59e0b',
  secondary_color TEXT DEFAULT '#ea580c',
  accent_color TEXT DEFAULT '#111827',
  background_color TEXT DEFAULT '#f8fafc',
  logo_url TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  currency TEXT DEFAULT 'MXN',
  tax_rate NUMERIC DEFAULT 0,
  timezone TEXT DEFAULT 'America/Monterrey',
  mode TEXT DEFAULT 'to-go',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MENU_ITEMS (bakery products)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  image TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  is_weight_based BOOLEAN DEFAULT false,
  weight_price_per_kg NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT -1,
  track_inventory BOOLEAN DEFAULT false,
  sold_out BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- 3. RESTAURANT_SETTINGS (app skin/theme stored as JSON)
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_restaurant_settings_restaurant ON restaurant_settings(restaurant_id);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT DEFAULT 'Invitado',
  customer_address TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  delivery_distance_km NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'recibido',
  payment_method TEXT DEFAULT 'efectivo',
  pay_with_amount NUMERIC DEFAULT 0,
  order_type TEXT DEFAULT 'pickup',
  notes TEXT DEFAULT '',
  session_id TEXT DEFAULT '',
  transfer_screenshot TEXT DEFAULT '',
  status_timestamps JSONB DEFAULT '{}',
  timestamp BIGINT DEFAULT extract(epoch from now()) * 1000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 5. PROMOS (promotions & bundle deals)
CREATE TABLE IF NOT EXISTS promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  bundle_items JSONB DEFAULT '[]',
  discount_type TEXT DEFAULT '',
  discount_value NUMERIC DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_promos_restaurant ON promos(restaurant_id);

-- 6. VISITORS (analytics tracking)
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  ip TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  device_type TEXT DEFAULT '',
  is_pwa_installed BOOLEAN DEFAULT false,
  session_id TEXT DEFAULT '',
  first_visit TIMESTAMPTZ DEFAULT now(),
  last_visit TIMESTAMPTZ DEFAULT now(),
  visit_count INTEGER DEFAULT 1,
  associated_orders JSONB DEFAULT '[]'
);

CREATE INDEX idx_visitors_restaurant ON visitors(restaurant_id);

-- 7. IMAGES (uploaded image references)
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  url TEXT DEFAULT '',
  key TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_images_restaurant ON images(restaurant_id);

-- Enable Row Level Security on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
