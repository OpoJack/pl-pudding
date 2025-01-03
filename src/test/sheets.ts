import { GoogleSheetsClient } from "../services/sheets/client";
import { calculatePNLRow } from "../services/sheets/utils";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingRecord,
} from "../db/models/types";
import { config } from "../config";
import { ShipStationClient, ShopifyClient } from "../services";
import { PNLRow } from "../services/sheets/types";
import { mapShipstationStatus } from "../services/shipstation/mappers";
import { mapShopifyStatus } from "../services/shopify/mappers";

async function testShopifyToSheets() {
  const shopifyClient = new ShopifyClient(
    `https://clippervault.myshopify.com/admin/api/2024-01`,
    config.shopify.accessToken
  );

  const sheetsClient = new GoogleSheetsClient();
  const shipstationClient = new ShipStationClient(
    config.shipstation.baseUrl,
    config.shipstation.apiKey,
    config.shipstation.apiSecret
  );

  try {
    // Get Shopify orders
    const orders = await shopifyClient.getOrders({
      limit: 20,
    });

    // Get ShipStation orders for the same period
    const startDate = new Date(orders[orders.length - 1].created_at);
    const endDate = new Date(orders[0].created_at);
    const shipstationOrders = await shipstationClient.getOrders({
      createDateStart: startDate.toISOString(),
      createDateEnd: endDate.toISOString(),
    });

    function mapPaymentStatus(status: string): PaymentStatus {
      switch (status) {
        case "paid":
        case "partially_paid":
          return "paid";
        case "refunded":
        case "partially_refunded":
          return "refunded";
        case "voided":
          return "failed";
        default:
          return "pending";
      }
    }

    function mapOrderStatus(status: string | null): OrderStatus {
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

    const pnlRows: PNLRow[] = orders.flatMap((shopifyOrder) => {
      // Find corresponding ShipStation order
      const shipstationOrder = shipstationOrders.find(
        (ss) => ss.orderNumber === shopifyOrder.order_number.toString()
      );

      const order: Order = {
        id: shopifyOrder.id.toString(),
        platform: "shopify",
        platform_order_id: shopifyOrder.order_number.toString(),
        order_date: shopifyOrder.created_at,
        order_number: shopifyOrder.order_number.toString(),
        customer_email: null,
        order_status: shipstationOrder
          ? mapShipstationStatus(shipstationOrder.orderStatus)
          : mapShopifyStatus(shopifyOrder.fulfillment_status),
        total_amount: parseFloat(shopifyOrder.total_price),
        shipping_amount: shipstationOrder?.shippingAmount || 0,
        tax_amount: 0,
        platform_fees: 0,
        raw_data: shopifyOrder,
        created_at: shopifyOrder.created_at,
        updated_at: shopifyOrder.updated_at,
        payment_status: mapPaymentStatus(shopifyOrder.financial_status),
        payment_date: null,
      };

      return shopifyOrder.line_items.map((item) => {
        const orderItem: OrderItem = {
          id: item.id.toString(),
          order_id: order.id,
          sku: item.sku || "",
          title: item.title,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          unit_cost: 0,
          created_at: shopifyOrder.created_at,
          updated_at: shopifyOrder.updated_at,
        };

        const shippingRecord: ShippingRecord | undefined = shipstationOrder
          ? {
              id: shipstationOrder.orderId.toString(),
              order_id: order.id,
              shipstation_id: shipstationOrder.orderId.toString(),
              carrier: shipstationOrder.carrierCode || null,
              service: shipstationOrder.serviceCode || null,
              tracking_number: "12345" || null,
              status: shipstationOrder.orderStatus,
              shipping_cost: shipstationOrder.shippingAmount,
              shipping_date: shipstationOrder.shipDate || null,
              delivery_date: null,
              raw_data: shipstationOrder,
              created_at: shipstationOrder.createDate,
              updated_at: shipstationOrder.modifyDate,
            }
          : undefined;

        return calculatePNLRow(order, orderItem, shippingRecord);
      });
    });

    console.log("Sending to sheets:", pnlRows);
    await sheetsClient.addOrUpdateRows(pnlRows);
    console.log("Successfully wrote to Google Sheets");
  } catch (error) {
    console.error("Error:", error);
  }
}

testShopifyToSheets();

// async function testShopifyToSheets() {
//   const shopifyClient = new ShopifyClient(
//     `https://clippervault.myshopify.com/admin/api/2024-01`,
//     config.shopify.accessToken
//   );

//   const sheetsClient = new GoogleSheetsClient();
//   try {
//     const orders = await shopifyClient.getOrders({
//       limit: 30,
//     });

//     const pnlRows: PNLRow[] = orders.flatMap((shopifyOrder) => {
//       // Map Shopify order to our Order type
//       function mapPaymentStatus(status: string): PaymentStatus {
//         switch (status) {
//           case "paid":
//           case "partially_paid":
//             return "paid";
//           case "refunded":
//           case "partially_refunded":
//             return "refunded";
//           case "voided":
//             return "failed";
//           default:
//             return "pending";
//         }
//       }

//       function mapOrderStatus(status: string | null): OrderStatus {
//         switch (status) {
//           case "fulfilled":
//             return "shipped";
//           case "processing":
//             return "processing";
//           case "delivered":
//             return "delivered";
//           case "cancelled":
//             return "cancelled";
//           case "refunded":
//             return "refunded";
//           default:
//             return "pending";
//         }
//       }

//       const order: Order = {
//         id: shopifyOrder.id.toString(),
//         platform: "shopify",
//         platform_order_id: shopifyOrder.order_number.toString(),
//         order_date: shopifyOrder.created_at,
//         order_number: shopifyOrder.order_number.toString(),
//         customer_email: null,
//         order_status: mapOrderStatus(shopifyOrder.fulfillment_status),
//         payment_status: mapPaymentStatus(shopifyOrder.financial_status),
//         payment_date: null,
//         total_amount: parseFloat(shopifyOrder.total_price),
//         shipping_amount: 0,
//         tax_amount: 0,
//         platform_fees: 0,
//         raw_data: shopifyOrder,
//         created_at: shopifyOrder.created_at,
//         updated_at: shopifyOrder.updated_at,
//       };

//       return shopifyOrder.line_items.map((item) => {
//         const orderItem: OrderItem = {
//           id: item.id.toString(),
//           order_id: order.id,
//           sku: item.sku || "",
//           title: item.title,
//           quantity: item.quantity,
//           unit_price: parseFloat(item.price),
//           unit_cost: 0,
//           created_at: shopifyOrder.created_at,
//           updated_at: shopifyOrder.updated_at,
//         };

//         return calculatePNLRow(order, orderItem);
//       });
//     });

//     console.log("Sending to sheets:", pnlRows);
//     await sheetsClient.addOrUpdateRows(pnlRows);
//     console.log("Successfully wrote to Google Sheets");
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// testShopifyToSheets();
