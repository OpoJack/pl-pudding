import { EbayOrder, EbayOrderItem } from "./types";
import { Order, OrderItem } from "../../db/models/types";

export function mapEbayOrderToDb(
  ebayOrder: EbayOrder
): Omit<Order, "id" | "created_at" | "updated_at"> {
  return {
    platform: "ebay",
    platform_order_id: ebayOrder.orderId,
    order_date: ebayOrder.creationDate,
    order_number: ebayOrder.orderId,
    customer_email: null, // eBay API doesn't provide email
    order_status: ebayOrder.orderFulfillmentStatus,
    total_amount: parseFloat(ebayOrder.pricingSummary.total.amount),
    shipping_amount: parseFloat(ebayOrder.pricingSummary.deliveryCost.amount),
    tax_amount: null, // Would need to sum from line items if needed
    platform_fees: null, // Calculated later in PNL
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
