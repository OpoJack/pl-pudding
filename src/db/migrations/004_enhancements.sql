-- Add status constraints
ALTER TABLE orders ADD CONSTRAINT valid_order_status 
CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

ALTER TABLE orders ADD CONSTRAINT valid_payment_status 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

ALTER TABLE shipping_records ADD CONSTRAINT valid_shipping_status 
CHECK (status IN ('pending', 'in_transit', 'delivered', 'exception', 'cancelled'));

-- Add better indexing
CREATE INDEX idx_orders_platform_date ON orders(platform, order_date);
CREATE INDEX idx_orders_status_date ON orders(order_status, order_date);
CREATE INDEX idx_shipping_order_status ON shipping_records(order_id, status);
CREATE INDEX idx_order_items_order_sku ON order_items(order_id, sku);

-- Create audit log table
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
    old_data JSON,
    new_data JSON,
    user_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);

-- Create error log table
CREATE TABLE error_log (
    id TEXT PRIMARY KEY,
    service TEXT NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT,
    error_data JSON,
    resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_error_service ON error_log(service, created_at);
CREATE INDEX idx_error_resolved ON error_log(resolved, created_at);

-- Create archive tables
CREATE TABLE archived_orders (
    id TEXT PRIMARY KEY,
    archive_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    data JSON NOT NULL
);

CREATE TABLE archived_order_items (
    id TEXT PRIMARY KEY,
    archive_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    data JSON NOT NULL
);

CREATE TABLE archived_shipping_records (
    id TEXT PRIMARY KEY,
    archive_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    data JSON NOT NULL
);

-- Create archive triggers
CREATE TRIGGER archive_old_orders
AFTER DELETE ON orders
BEGIN
    INSERT INTO archived_orders (id, data)
    VALUES (OLD.id, json_object(
        'platform', OLD.platform,
        'platform_order_id', OLD.platform_order_id,
        'order_date', OLD.order_date,
        'order_number', OLD.order_number,
        'customer_email', OLD.customer_email,
        'order_status', OLD.order_status,
        'payment_status', OLD.payment_status,
        'total_amount', OLD.total_amount,
        'shipping_amount', OLD.shipping_amount,
        'tax_amount', OLD.tax_amount,
        'platform_fees', OLD.platform_fees,
        'raw_data', OLD.raw_data,
        'created_at', OLD.created_at,
        'updated_at', OLD.updated_at
    ));
END;

CREATE TRIGGER archive_old_order_items
AFTER DELETE ON order_items
BEGIN
    INSERT INTO archived_order_items (id, data)
    VALUES (OLD.id, json_object(
        'order_id', OLD.order_id,
        'sku', OLD.sku,
        'title', OLD.title,
        'quantity', OLD.quantity,
        'unit_price', OLD.unit_price,
        'unit_cost', OLD.unit_cost,
        'created_at', OLD.created_at,
        'updated_at', OLD.updated_at
    ));
END;

CREATE TRIGGER archive_old_shipping_records
AFTER DELETE ON shipping_records
BEGIN
    INSERT INTO archived_shipping_records (id, data)
    VALUES (OLD.id, json_object(
        'order_id', OLD.order_id,
        'shipstation_id', OLD.shipstation_id,
        'carrier', OLD.carrier,
        'service', OLD.service,
        'tracking_number', OLD.tracking_number,
        'status', OLD.status,
        'shipping_cost', OLD.shipping_cost,
        'shipping_date', OLD.shipping_date,
        'delivery_date', OLD.delivery_date,
        'raw_data', OLD.raw_data,
        'created_at', OLD.created_at,
        'updated_at', OLD.updated_at
    ));
END;