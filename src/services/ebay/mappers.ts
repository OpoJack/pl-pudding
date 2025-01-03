import { EbayOrder, EbayOrderItem } from "./types";
import { Order, OrderItem, OrderStatus } from "../../db/models/types";

export function mapEbayOrderToDb(
  ebayOrder: EbayOrder
): Omit<Order, "id" | "created_at" | "updated_at"> {
  // Map eBay status to our OrderStatus type
  const statusMap: Record<string, OrderStatus> = {
    ACTIVE: "pending",
    IN_PROGRESS: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
  };

  const mappedStatus = statusMap[ebayOrder.orderFulfillmentStatus] || "pending";

  return {
    platform: "ebay",
    platform_order_id: ebayOrder.orderId,
    order_date: ebayOrder.creationDate,
    order_number: ebayOrder.orderId,
    customer_email: null,
    order_status: mappedStatus,
    payment_status: ebayOrder.orderPaymentStatus === "PAID" ? "paid" : "pending",
    payment_date: null,
    total_amount: parseFloat(ebayOrder.pricingSummary.total.amount),
    shipping_amount: parseFloat(ebayOrder.pricingSummary.deliveryCost.amount),
    tax_amount: null,
    platform_fees: null,
    raw_data: ebayOrder,
  };
}

export function mapEbayOrderItemToDb(
  orderId: string,
  item: EbayOrderItem
): Omit<OrderItem, "id" | "created_at" | "updated_at"> {
  return {
    order_id: orderId,
    sku: item.sku || item.legacyItemId,
    title: item.title,
    quantity: item.quantity,
    unit_price: parseFloat(item.price.amount),
    unit_cost: null, // Cost needs to be managed separately
  };
}
