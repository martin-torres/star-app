-- ============================================================
-- Migration: Real data for Azúcar y Nuez (from WhatsApp catalog)
-- ============================================================

-- 1. UPDATE restaurant with real info
UPDATE restaurants
SET
  address = 'C. Guadalupe 114 A, Poniente, 67100 Guadalupe, N.L.',
  phone = '+52 81 1747 6940',
  description = 'Postres Artesanales. Con los ingredientes de la mejor calidad, elaborados en casa y sin conservadores.',
  primary_color = '#B45309',
  secondary_color = '#92400E',
  accent_color = '#FDE68A',
  background_color = '#FFFBEB'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- 2. UPDATE restaurant_settings with real data
UPDATE restaurant_settings
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(data,
          '{name}', '"Azúcar y Nuez"'),
        '{tagline}', '"Postres Artesanales"'),
      '{description}', '"Postres Artesanales. Con los ingredientes de la mejor calidad, elaborados en casa y sin conservadores."'),
    '{locationText}', '"Guadalupe, NL"'),
  '{pickupLocationText}', '"Recoger en Sucursal"')
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE restaurant_settings
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(data,
        '{primaryColor}', '"#B45309"'),
      '{secondaryColor}', '"#92400E"'),
    '{accentColor}', '"#FDE68A"'),
  '{backgroundColor}', '"#FFFBEB"')
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE restaurant_settings
SET data = jsonb_set(data,
  '{deliveryRules}',
  '{
    "thresholds": [
      {"km": 3, "fee": 20},
      {"km": 5, "fee": 35},
      {"km": 10, "fee": 50}
    ],
    "storeLat": 25.6764,
    "storeLng": -100.2589
  }'::jsonb)
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE restaurant_settings
SET data = jsonb_set(data,
  '{heroImageUrl}', '"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800&h=1200"')
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- 3. Delete old menu items and insert real products
DELETE FROM menu_items WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- PASTELES (Cakes)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image, active, options)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cheesecake Manzana y Nuez (Individual)', 'Cheesecake artesanal de manzana con nuez – tamaño individual', 100, 'pasteles', '', true, '[{"id":"size","label":"Individual","price":100}]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cheesecake Manzana y Nuez (Mediano)', 'Cheesecake artesanal de manzana con nuez – tamaño mediano, aprox. 4 porciones', 350, 'pasteles', '', true, '[{"id":"size","label":"Mediano ~4 porc","price":350}]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cheesecake Manzana y Nuez (Grande)', 'Cheesecake artesanal de manzana con nuez – tamaño grande, aprox. 12 porciones', 650, 'pasteles', '', true, '[{"id":"size","label":"Grande ~12 porc","price":650}]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Red Velvet (Individual)', 'Pastel Red Velvet con glaseado de queso crema – tamaño individual', 100, 'pasteles', '', true, '[]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Red Velvet (Mediano)', 'Pastel Red Velvet con glaseado de queso crema – tamaño mediano', 350, 'pasteles', '', true, '[]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pastel de Zanahoria (Individual)', 'Pastel de zanahoria con nuez y glaseado de queso crema – tamaño individual', 100, 'pasteles', '', true, '[]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mostachón (Individual)', 'Mostachón artesanal – tamaño personal', 100, 'pasteles', '', true, '[]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mostachón (Mediano)', 'Mostachón artesanal – 16 cm diámetro, aprox. 5 porciones', 350, 'pasteles', '', true, '[]'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pastel Diplomático', 'Pastel diplomático artesanal – varios tamaños disponibles, consultar', 100, 'pasteles', '', true, '[]');

-- POSTRES (Desserts)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image, active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pay Tortuga', 'Pay de Queso con base de galleta, caramelo y nuez pecanera', 100, 'postres', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pay de Queso Clásico', 'Pay de queso cremoso con base de galleta', 90, 'postres', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cheesecake Tortuga', 'Cheesecake con caramelo, nuez pecanera y chocolate', 100, 'postres', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cheesecake de Plátano', 'Cheesecake cremoso de plátano con base de galleta', 100, 'postres', '', true);

-- GALLETAS (Cookies)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image, active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Galleta de Chispas de Chocolate', 'Galleta artesanal con chispas de chocolate', 15, 'galletas', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Galleta de Nuez', 'Galleta artesanal con trozos de nuez', 18, 'galletas', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Galleta de Mantequilla', 'Galleta tradicional de mantequilla', 12, 'galletas', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alfajor de Cajeta', 'Dos galletas suaves con relleno de cajeta y coco', 22, 'galletas', '', true);

-- PAN DULCE (Sweet Bread)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image, active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Concha de Vainilla', 'Pan dulce clásico con cubierta de vainilla', 18, 'pan_dulce', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Concha de Chocolate', 'Concha tradicional con cubierta de chocolate', 20, 'pan_dulce', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cuerno de Mantequilla', 'Cuerno hojaldrado bañado en mantequilla y azúcar', 22, 'pan_dulce', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Donas Glaseadas', 'Donas esponjosas con glaseado de vainilla', 20, 'pan_dulce', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pan de Elote', 'Pan de elote húmedo y lleno de sabor', 25, 'pan_dulce', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Empanada de Cajeta', 'Empanada rellena de cajeta artesanal', 25, 'pan_dulce', '', true);

-- PAN SALADO (Savory Bread)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image, active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bolillo', 'Pan salado clásico, crujiente por fuera y suave por dentro', 8, 'pan_salado', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Birote', 'Pan salado estilo tradicional, ideal para tortas', 10, 'pan_salado', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pan de Masa Madre', 'Pan artesanal de masa madre con fermentación natural', 35, 'pan_salado', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Baguette Artesanal', 'Baguette crujiente horneado a la piedra', 28, 'pan_salado', '', true);

-- BEBIDAS (Drinks)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image, active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Café Americano', 'Café de grano recién molido, preparación americana', 30, 'bebidas', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Café de Olla', 'Café tradicional endulzado con piloncillo y canela', 35, 'bebidas', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chocolate Caliente', 'Chocolate artesanal con leche y especias', 35, 'bebidas', '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Agua de Jamaica', 'Agua fresca de jamaica natural', 18, 'bebidas', '', true);

-- PROMOS
INSERT INTO promos (restaurant_id, name, description, price, image, active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cheesecake + Café', 'Rebanada de cheesecake + café americano', 120, '', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pack Familiar', '6 piezas de pan dulce (surtido) + 1 chocolate caliente', 130, '', true);
