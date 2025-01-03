import { EbayClient } from "./client";
import { OrderModel } from "../../db/models/order";
import { mapEbayOrderToDb, mapEbayOrderItemToDb } from "./mappers";
import { config } from "../../config";
import { db } from "../../db";

export class EbayService {
  private client: EbayClient;

  constructor() {
    this.client = new EbayClient(
      config.ebay.baseUrl,
      config.ebay.appId,
      config.ebay.certId,
      config.ebay.refreshToken
    );
  }

  async getOrder(orderId: string) {
    const [order] = await this.client.getOrders({
      creationdate_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      limit: 1,
    });

    if (!order || order.orderId !== orderId) {
      throw new Error("Order not found");
    }

    return order;
  }

  async createOrder(orderId: string) {
    const ebayOrder = await this.getOrder(orderId);
    const orderData = mapEbayOrderToDb(ebayOrder);

    const query = db.prepare(`
      INSERT INTO order_items (id, order_id, sku, title, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      const dbOrderId = await OrderModel.create(orderData);

      // Insert order items
      for (const item of ebayOrder.lineItems) {
        const itemData = mapEbayOrderItemToDb(dbOrderId, item);
        query.run(
          crypto.randomUUID(),
          dbOrderId,
          itemData.sku,
          itemData.title,
          itemData.quantity,
          itemData.unit_price
        );
      }

      return dbOrderId;
    } catch (error) {
      console.error("Error creating eBay order:", error);
      throw error;
    }
  }

  async updateOrder(orderId: string) {
    const ebayOrder = await this.getOrder(orderId);
    const orderData = mapEbayOrderToDb(ebayOrder);

    const existingOrder = await OrderModel.findByPlatformOrderId("ebay", orderId);
    if (!existingOrder) {
      throw new Error("Order not found in database");
    }

    const query = db.prepare(`
      UPDATE order_items 
      SET quantity = ?, unit_price = ?
      WHERE order_id = ? AND sku = ?
    `);

    try {
      await OrderModel.update(existingOrder.id, orderData);

      // Update order items
      for (const item of ebayOrder.lineItems) {
        const itemData = mapEbayOrderItemToDb(existingOrder.id, item);
        query.run(itemData.quantity, itemData.unit_price, existingOrder.id, itemData.sku);
      }
    } catch (error) {
      console.error("Error updating eBay order:", error);
      throw error;
    }
  }

  async fetchOrdersByDateRange(startDate: Date, endDate: Date) {
    try {
      let offset = 0;
      const limit = 100;
      let hasMore = true;
      const orders = [];

      while (hasMore) {
        const ebayOrders = await this.client.getOrders({
          creationdate_from: startDate.toISOString(),
          creationdate_to: endDate.toISOString(),
          limit,
          offset,
        });

        orders.push(...ebayOrders);
        hasMore = ebayOrders.length === limit;
        offset += limit;
      }

      return orders;
    } catch (error) {
      console.error("Error fetching eBay orders:", error);
      throw error;
    }
  }
}
