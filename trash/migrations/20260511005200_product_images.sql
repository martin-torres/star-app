-- Migration: Set product images from WhatsApp catalog
-- Extracted from catalog screenshots and uploaded to storage

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/cheesecake-manzana-individual.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Cheesecake Manzana y Nuez (Individual)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/cheesecake-manzana-mediano.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Cheesecake Manzana y Nuez (Mediano)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/cheesecake-manzana-grande.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Cheesecake Manzana y Nuez (Grande)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/red-velvet-individual.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Red Velvet (Individual)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/red-velvet-mediano.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Red Velvet (Mediano)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/pastel-zanahoria.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Pastel de Zanahoria (Individual)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/mostachon-individual.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Mostachón (Individual)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/mostachon-mediano.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Mostachón (Mediano)';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/pastel-diplomatico.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Pastel Diplomático';

UPDATE menu_items SET image = 'https://4d2djas5.us-east.insforge.app/api/storage/buckets/images/objects/products/pay-tortuga.png'
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Pay Tortuga';

