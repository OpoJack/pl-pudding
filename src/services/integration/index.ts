import { config } from "../../config";
import { WalmartClient } from "../walmart/client";
import { EbayClient } from "../ebay/client";
import { ShopifyClient } from "../shopify/client";
import { ShipStationClient } from "../shipstation/client";
import { ErrorLogModel } from "../../db/models/error";
import { OrderModel } from "../../db/models/order";
import { mapEbayOrderToDb, mapEbayOrderItemToDb } from "../ebay/mappers";
import { Order, OrderItem, ShippingRecord, ShippingStatus } from "../../db/models/types";
import { db } from "../../db";
import { EbayOrder } from "../ebay/types";
import { WalmartOrder } from "../walmart/types";
import { ShopifyOrder } from "../shopify/types";
import { mapWalmartOrderItemToDb, mapWalmartOrderToDb } from "../walmart/mappers";
import { mapShopifyOrderItemToDb, mapShopifyOrderToDb } from "../shopify/mappers";
import { ShipStationShipment } from "../shipstation/types";

export class ServiceIntegration {
  private walmart: WalmartClient;
  private ebay: EbayClient;
  private shopify: ShopifyClient;
  private shipstation: ShipStationClient;

  constructor() {
    this.walmart = new WalmartClient(
      config.walmart.baseUrl,
      config.walmart.clientId,
      config.walmart.clientSecret
    );

    this.ebay = new EbayClient(
      config.ebay.baseUrl,
      config.ebay.appId,
      config.ebay.certId,
      config.ebay.refreshToken
    );

    this.shopify = new ShopifyClient(config.shopify.baseUrl, config.shopify.accessToken);

    this.shipstation = new ShipStationClient(
      config.shipstation.baseUrl,
      config.shipstation.apiKey,
      config.shipstation.apiSecret
    );
  }

  private async logError(service: string, error: any) {
    await ErrorLogModel.create({
      service,
      error_type: error.name || "UnknownError",
      error_message: error.message,
      error_data: error,
    });
  }

  async syncOrders(startDate: string, endDate: string) {
    const promises = [];

    // Walmart sync
    promises.push(
      (async () => {
        try {
          const orders = await this.walmart.getOrders({
            createdStartDate: startDate,
            createdEndDate: endDate,
          });
          await this.processWalmartOrders(orders);
        } catch (error) {
          await this.logError("walmart", error);
        }
      })()
    );

    // eBay sync
    promises.push(
      (async () => {
        try {
          const orders = await this.ebay.getOrders({
            creationdate_from: startDate,
            creationdate_to: endDate,
          });
          await this.processEbayOrders(orders);
        } catch (error) {
          await this.logError("ebay", error);
        }
      })()
    );

    // Shopify sync
    promises.push(
      (async () => {
        try {
          const orders = await this.shopify.getOrders({
            created_at_min: startDate,
            created_at_max: endDate,
          });
          await this.processShopifyOrders(orders);
        } catch (error) {
          await this.logError("shopify", error);
        }
      })()
    );

    await Promise.allSettled(promises);
  }

  async syncShipping(startDate: string, endDate: string) {
    try {
      const shipments = await this.shipstation.getShipments({
        createDateStart: startDate,
        createDateEnd: endDate,
      });
      await this.processShipments(shipments);
    } catch (error) {
      await this.logError("shipstation", error);
    }
  }

  private async processEbayOrders(orders: EbayOrder[]) {
    for (const ebayOrder of orders) {
      await db.transaction(async () => {
        try {
          const orderData = mapEbayOrderToDb(ebayOrder);
          const orderId = await OrderModel.create(orderData);

          for (const item of ebayOrder.lineItems) {
            const orderItemData = mapEbayOrderItemToDb(orderId, item);
            // Create order item
            await OrderModel.createOrderItem(orderItemData);
          }
        } catch (error) {
          await this.logError("ebay_processing", {
            message: "Failed to process eBay order",
            orderId: ebayOrder.orderId,
            error,
          });
        }
      })();
    }
  }

  private async processWalmartOrders(orders: WalmartOrder[]) {
    for (const walmartOrder of orders) {
      await db.transaction(async () => {
        try {
          const orderData = mapWalmartOrderToDb(walmartOrder);
          const orderId = await OrderModel.create(orderData);

          for (const orderLine of walmartOrder.orderLines.orderLine) {
            const orderItemData = mapWalmartOrderItemToDb(orderId, orderLine);
            await OrderModel.createOrderItem(orderItemData);
          }
        } catch (error) {
          await this.logError("walmart_processing", {
            message: "Failed to process Walmart order",
            orderId: walmartOrder.purchaseOrderId,
            error,
          });
        }
      })();
    }
  }

  private async processShopifyOrders(orders: ShopifyOrder[]) {
    for (const shopifyOrder of orders) {
      await db.transaction(async () => {
        try {
          const orderData = mapShopifyOrderToDb(shopifyOrder);
          const orderId = await OrderModel.create(orderData);

          for (const item of shopifyOrder.line_items) {
            const orderItemData = mapShopifyOrderItemToDb(orderId, item);
            await OrderModel.createOrderItem(orderItemData);
          }
        } catch (error) {
          await this.logError("shopify_processing", {
            message: "Failed to process Shopify order",
            orderId: shopifyOrder.id.toString(),
            error,
          });
        }
      })();
    }
  }

  private async processShipments(shipments: ShipStationShipment[]) {
    for (const shipment of shipments) {
      await db.transaction(async () => {
        try {
          // Find associated order
          const order = await OrderModel.findByPlatformOrderId(
            shipment.orderNumber.split("-")[0], // Platform prefix
            shipment.orderNumber.split("-")[1] // Platform order ID
          );

          if (!order) {
            throw new Error(`No matching order found for shipment ${shipment.shipmentId}`);
          }

          const shippingData = {
            order_id: order.id,
            shipstation_id: shipment.shipmentId.toString(),
            carrier: shipment.carrierCode,
            service: shipment.serviceCode,
            tracking_number: shipment.trackingNumber,
            status: this.mapShipmentStatus(shipment),
            shipping_cost: shipment.shipmentCost,
            shipping_date: shipment.shipDate,
            delivery_date: shipment.deliveryDate,
            raw_data: shipment,
          };

          // Update or create shipping record
          const existingRecord = (await db
            .prepare("SELECT id FROM shipping_records WHERE shipstation_id = ?")
            .get(shipment.shipmentId.toString())) as ShippingRecord | undefined;

          if (existingRecord) {
            await db
              .prepare(
                `
            UPDATE shipping_records 
            SET carrier = ?, service = ?, tracking_number = ?, 
                status = ?, shipping_cost = ?, shipping_date = ?,
                delivery_date = ?, raw_data = ?
            WHERE id = ?
          `
              )
              .run(
                shippingData.carrier,
                shippingData.service,
                shippingData.tracking_number,
                shippingData.status,
                shippingData.shipping_cost,
                shippingData.shipping_date,
                shippingData.delivery_date,
                JSON.stringify(shippingData.raw_data),
                existingRecord.id
              );
          } else {
            await db
              .prepare(
                `
            INSERT INTO shipping_records (
              id, order_id, shipstation_id, carrier, service,
              tracking_number, status, shipping_cost, shipping_date,
              delivery_date, raw_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
              )
              .run(
                crypto.randomUUID(),
                shippingData.order_id,
                shippingData.shipstation_id,
                shippingData.carrier,
                shippingData.service,
                shippingData.tracking_number,
                shippingData.status,
                shippingData.shipping_cost,
                shippingData.shipping_date,
                shippingData.delivery_date,
                JSON.stringify(shippingData.raw_data)
              );
          }

          // Update order status if needed
          if (shipment.deliveryDate) {
            await OrderModel.update(order.id, { order_status: "delivered" });
          } else if (!shipment.voided) {
            await OrderModel.update(order.id, { order_status: "shipped" });
          }
        } catch (error) {
          await this.logError("shipstation_processing", {
            message: "Failed to process shipment",
            shipmentId: shipment.shipmentId,
            error,
          });
        }
      })();
    }
  }

  private mapShipmentStatus(shipment: ShipStationShipment): ShippingStatus {
    if (shipment.voided) return "cancelled";
    if (shipment.deliveryDate) return "delivered";
    if (shipment.shipDate) return "in_transit";
    return "pending";
  }
}
