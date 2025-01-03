import { WalmartOrder, WalmartOrderItem } from "./types";
import { Order, OrderItem, OrderStatus } from "../../db/models/types";

export function mapWalmartOrderToDb(
  walmartOrder: WalmartOrder
): Omit<Order, "id" | "created_at" | "updated_at"> {
  const statusMap: Record<string, OrderStatus> = {
    Created: "pending",
    Acknowledged: "processing",
    Shipped: "shipped",
    Delivered: "delivered",
    Cancelled: "cancelled",
    Refund: "refunded",
  };

  const mappedStatus = statusMap[walmartOrder.orderStatus.status] || "pending";

  return {
    platform: "walmart",
    platform_order_id: walmartOrder.purchaseOrderId,
    order_date: walmartOrder.orderDate,
    order_number: walmartOrder.customerOrderId,
    customer_email: walmartOrder.customerEmailId,
    order_status: mappedStatus,
    payment_status: "paid", // Walmart orders are pre-paid
    payment_date: walmartOrder.orderDate,
    total_amount: walmartOrder.orderLines.orderLine.reduce((sum, line) => {
      const total =
        line.charges.find((charge) => charge.chargeType === "PRODUCT")?.chargeAmount.amount || "0";
      return sum + parseFloat(total);
    }, 0),
    shipping_amount: walmartOrder.orderLines.orderLine.reduce((sum, line) => {
      const shipping =
        line.charges.find((charge) => charge.chargeType === "SHIPPING")?.chargeAmount.amount || "0";
      return sum + parseFloat(shipping);
    }, 0),
    tax_amount: walmartOrder.orderLines.orderLine.reduce((sum, line) => {
      const tax =
        line.charges.find((charge) => charge.chargeType === "TAX")?.chargeAmount.amount || "0";
      return sum + parseFloat(tax);
    }, 0),
    platform_fees: null,
    raw_data: walmartOrder,
  };
}

export function mapWalmartOrderItemToDb(
  orderId: string,
  item: WalmartOrderItem
): Omit<OrderItem, "id" | "created_at" | "updated_at"> {
  const productCharge =
    item.charges.find((charge) => charge.chargeType === "PRODUCT")?.chargeAmount.amount || "0";

  return {
    order_id: orderId,
    sku: item.item.sku,
    title: item.item.productName,
    quantity: parseInt(item.orderLineQuantity.amount),
    unit_price: parseFloat(productCharge) / parseInt(item.orderLineQuantity.amount),
    unit_cost: null,
  };
}
