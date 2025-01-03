ALTER TABLE orders ADD COLUMN payment_status TEXT;
ALTER TABLE orders ADD COLUMN payment_date DATETIME;

CREATE INDEX idx_orders_payment_status ON orders(payment_status);