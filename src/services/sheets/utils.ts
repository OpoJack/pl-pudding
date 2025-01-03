import { OrderItem, Order, ShippingRecord } from "../../db/models/types";
import { PNLRow } from "./types";

export function calculatePNLRow(
  order: Order,
  orderItem: OrderItem,
  shippingRecord?: ShippingRecord,
  rowNumber?: number
): PNLRow {
  // Calculate the portion of fees and shipping for this item
  const itemRatio = (orderItem.quantity * orderItem.unit_price) / order.total_amount;

  const shipping = shippingRecord?.shipping_cost ? shippingRecord.shipping_cost * itemRatio : 0;

  // Platform-specific fee calculations
  let adFees = 0;
  let otherFees = 0;

  switch (order.platform) {
    case "walmart":
      // Walmart typically has a referral fee
      otherFees = orderItem.quantity * orderItem.unit_price * 0.15; // 15% referral fee
      break;
    case "ebay":
      // eBay's standard final value fee is 12.9% + $0.30 per order
      const fvfRate = 0.129;
      const perOrderFee = 0.3;
      otherFees = orderItem.quantity * orderItem.unit_price * fvfRate + perOrderFee * itemRatio;

      // Add category-specific fees if needed based on SKU/category
      // const categoryFee = getCategoryFee(orderItem.sku);
      // otherFees += categoryFee;
      break;
    case "shopify":
      // Shopify has payment processing fees
      otherFees = orderItem.quantity * orderItem.unit_price * 0.029 + 0.3; // 2.9% + $0.30
      break;
  }

  const grossSale = orderItem.quantity * orderItem.unit_price;
  const cost = orderItem.unit_cost ? orderItem.quantity * orderItem.unit_cost : 0;

  const profit = rowNumber
    ? `=F${rowNumber}-G${rowNumber}-H${rowNumber}-I${rowNumber}-J${rowNumber}`
    : String(grossSale - adFees - otherFees - shipping - cost);

  return {
    orderDate: order.order_date,
    lastUpdated: order.updated_at,
    orderSource: order.platform,
    orderId: order.platform_order_id,
    sku: orderItem.sku,
    grossSale,
    adFees,
    otherFees,
    shipping,
    cost,
    profit,
    shippingStatus: shippingRecord?.status || "Unknown",
  };
}
