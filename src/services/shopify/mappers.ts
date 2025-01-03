import { ShopifyOrder, ShopifyOrderItem } from "./types";
import { Order, OrderItem, OrderStatus, PaymentStatus } from "../../db/models/types";

export function mapShopifyOrderToDb(
  shopifyOrder: ShopifyOrder
): Omit<Order, "id" | "created_at" | "updated_at"> {
  const statusMap: Record<string, OrderStatus> = {
    pending: "pending",
    processing: "processing",
    fulfilled: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
    refunded: "refunded",
  };

  const fulfillmentStatus = shopifyOrder.fulfillment_status || "pending";
  const mappedStatus = statusMap[fulfillmentStatus] || "pending";

  const paymentStatusMap: Record<string, PaymentStatus> = {
    pending: "pending",
    paid: "paid",
    partially_paid: "pending",
    refunded: "refunded",
    voided: "failed",
    partially_refunded: "paid",
  };

  return {
    platform: "shopify",
    platform_order_id: shopifyOrder.id.toString(),
    order_date: shopifyOrder.created_at,
    order_number: shopifyOrder.order_number.toString(),
    customer_email: null,
    order_status: mappedStatus,
    payment_status: paymentStatusMap[shopifyOrder.financial_status] || "pending",
    payment_date: null,
    total_amount: parseFloat(shopifyOrder.total_price),
    shipping_amount: null,
    tax_amount: null,
    platform_fees: null,
    raw_data: shopifyOrder,
  };
}

export function mapShopifyOrderItemToDb(
  orderId: string,
  item: ShopifyOrderItem
): Omit<OrderItem, "id" | "created_at" | "updated_at"> {
  return {
    order_id: orderId,
    sku: item.sku || item.product_id.toString(),
    title: item.title,
    quantity: item.quantity,
    unit_price: parseFloat(item.price),
    unit_cost: null,
  };
}

export function mapShopifyStatus(status: string | null): OrderStatus {
  switch (status) {
    case "fulfilled":
      return "shipped";
    case "processing":
      return "processing";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "refunded":
      return "refunded";
    default:
      return "pending";
  }
}
