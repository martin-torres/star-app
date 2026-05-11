-- ============================================================
-- RLS Policies for Azúcar y Nuez bakery app
-- ============================================================

-- 1. RESTAURANTS: public read, authenticated write
CREATE POLICY "restaurants_public_read"
  ON restaurants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "restaurants_admin_write"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "restaurants_admin_update"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (true);

-- 2. MENU_ITEMS: public read, authenticated write
CREATE POLICY "menu_items_public_read"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "menu_items_admin_write"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "menu_items_admin_update"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "menu_items_admin_delete"
  ON menu_items FOR DELETE
  TO authenticated
  USING (true);

-- 3. RESTAURANT_SETTINGS: public read, authenticated write
CREATE POLICY "settings_public_read"
  ON restaurant_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "settings_admin_write"
  ON restaurant_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "settings_admin_update"
  ON restaurant_settings FOR UPDATE
  TO authenticated
  USING (true);

-- 4. ORDERS: anon can create (insert), admin can read/update all
CREATE POLICY "orders_public_insert"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "orders_public_read"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "orders_admin_delete"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- 5. PROMOS: public read, authenticated write
CREATE POLICY "promos_public_read"
  ON promos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "promos_admin_write"
  ON promos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "promos_admin_update"
  ON promos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "promos_admin_delete"
  ON promos FOR DELETE
  TO authenticated
  USING (true);

-- 6. VISITORS: anon can insert, authenticated can read
CREATE POLICY "visitors_public_insert"
  ON visitors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "visitors_authenticated_read"
  ON visitors FOR SELECT
  TO authenticated
  USING (true);

-- 7. IMAGES: public read, authenticated write
CREATE POLICY "images_public_read"
  ON images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "images_admin_write"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (true);
