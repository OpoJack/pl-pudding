CREATE TRIGGER update_orders_timestamp 
AFTER UPDATE ON orders
BEGIN
  UPDATE orders 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER update_order_items_timestamp
AFTER UPDATE ON order_items
BEGIN
  UPDATE order_items
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER update_shipping_records_timestamp
AFTER UPDATE ON shipping_records
BEGIN
  UPDATE shipping_records
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;