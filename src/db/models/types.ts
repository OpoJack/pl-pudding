export interface Order {
  id: string;
  platform: "shopify" | "walmart" | "ebay";
  platform_order_id: string;
  order_date: string;
  order_number: string;
  customer_email: string | null;
  order_status: string;
  total_amount: number;
  shipping_amount: number | null;
  tax_amount: number | null;
  platform_fees: number | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku: string;
  title: string;
  quantity: number;
  unit_price: number;
  unit_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingRecord {
  id: string;
  order_id: string;
  shipstation_id: string | null;
  carrier: string | null;
  service: string | null;
  tracking_number: string | null;
  status: string;
  shipping_cost: number | null;
  shipping_date: string | null;
  delivery_date: string | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
}
