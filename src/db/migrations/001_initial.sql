CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('shopify', 'walmart', 'ebay')),
  platform_order_id TEXT NOT NULL,
  order_date DATETIME NOT NULL,
  order_number TEXT NOT NULL,
  customer_email TEXT,
  order_status TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_amount DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  platform_fees DECIMAL(10,2),
  raw_data JSON,  -- Store complete platform response
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(platform, platform_order_id)
);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2),  -- For PNL calculation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE shipping_records (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  shipstation_id TEXT,
  carrier TEXT,
  service TEXT,
  tracking_number TEXT,
  status TEXT NOT NULL,
  shipping_cost DECIMAL(10,2),
  shipping_date DATETIME,
  delivery_date DATETIME,
  raw_data JSON,  -- Store complete ShipStation response
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_orders_platform ON orders(platform);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_sku ON order_items(sku);
CREATE INDEX idx_shipping_tracking ON shipping_records(tracking_number);

// src/db/migrations/002_triggers.sql
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