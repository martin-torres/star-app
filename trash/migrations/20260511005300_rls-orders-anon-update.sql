-- Allow anon role to update and delete orders (kitchen panel uses anon)
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_public_update"
  ON orders FOR UPDATE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "orders_admin_delete" ON orders;
CREATE POLICY "orders_public_delete"
  ON orders FOR DELETE
  TO anon, authenticated
  USING (true);
