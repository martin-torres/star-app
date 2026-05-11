-- Remove pan_dulce, galletas, pan_salado, bebidas categories and their items

DELETE FROM menu_items WHERE category IN ('pan_dulce', 'galletas', 'pan_salado', 'bebidas')
  AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE restaurant_settings
SET data = jsonb_set(data, '{categories}',
  '[
    {"code": "pasteles", "displayName": "Pasteles"},
    {"code": "postres", "displayName": "Postres"},
    {"code": "especial", "displayName": "Especialidades"}
  ]'::jsonb)
WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
