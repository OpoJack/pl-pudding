import { z } from "zod";

export const ShopifyOrderItemSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  variant_id: z.number(),
  title: z.string(),
  quantity: z.number(),
  price: z.string(),
  sku: z.string().nullable().optional(),
});

export const ShopifyOrderSchema = z.object({
  id: z.number(),
  order_number: z.number(),
  total_price: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  line_items: z.array(ShopifyOrderItemSchema),
  financial_status: z.enum([
    "pending",
    "paid",
    "partially_paid",
    "refunded",
    "voided",
    "partially_refunded",
  ]),
  fulfillment_status: z
    .enum(["pending", "processing", "fulfilled", "delivered", "cancelled", "refunded"])
    .nullable(),
});

export const ShopifyOrdersResponse = z.object({
  orders: z.array(ShopifyOrderSchema),
});

export type ShopifyOrder = z.infer<typeof ShopifyOrderSchema>;
export type ShopifyOrderItem = z.infer<typeof ShopifyOrderItemSchema>;
