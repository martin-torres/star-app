-- Create realtime channel for order updates
INSERT INTO realtime.channels (pattern, description, enabled)
VALUES ('orders', 'Order status updates for kitchen and customer tracking', true)
ON CONFLICT (pattern) DO NOTHING;

-- Create trigger function to publish order changes
CREATE OR REPLACE FUNCTION notify_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'orders',
    TG_OP || '_order',
    row_to_json(NEW)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS order_realtime ON orders;
CREATE TRIGGER order_realtime
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_changes();
