import { db } from "../index";
import { Order, OrderItem, ShippingRecord } from "./types";

export class OrderModel {
  static async create(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<string> {
    const id = crypto.randomUUID();
    const query = db.prepare(`
      INSERT INTO orders (
        id, platform, platform_order_id, order_date, order_number,
        customer_email, order_status, total_amount, shipping_amount,
        tax_amount, platform_fees, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    query.run(
      id,
      order.platform,
      order.platform_order_id,
      order.order_date,
      order.order_number,
      order.customer_email,
      order.order_status,
      order.total_amount,
      order.shipping_amount,
      order.tax_amount,
      order.platform_fees,
      JSON.stringify(order.raw_data)
    );

    return id;
  }

  static async findById(id: string): Promise<Order | null> {
    const query = db.prepare("SELECT * FROM orders WHERE id = ?");
    const result = query.get(id) as Order | null;

    if (result && result.raw_data) {
      result.raw_data = JSON.parse(result.raw_data as string);
    }

    return result;
  }

  static async findByPlatformOrderId(
    platform: string,
    platformOrderId: string
  ): Promise<Order | null> {
    const query = db.prepare("SELECT * FROM orders WHERE platform = ? AND platform_order_id = ?");
    const result = query.get(platform, platformOrderId) as Order | null;

    if (result && result.raw_data) {
      result.raw_data = JSON.parse(result.raw_data as string);
    }

    return result;
  }

  static async update(id: string, updates: Partial<Order>): Promise<void> {
    const setValues: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && key !== "updated_at") {
        setValues.push(`${key} = ?`);
        values.push(key === "raw_data" ? JSON.stringify(value) : value);
      }
    });

    if (setValues.length === 0) return;

    const query = db.prepare(`
      UPDATE orders 
      SET ${setValues.join(", ")}
      WHERE id = ?
    `);

    query.run(...values, id);
  }

  static async getOrdersForDateRange(
    startDate: string,
    endDate: string,
    platform?: string
  ): Promise<Order[]> {
    let query;
    let params: any[];

    if (platform) {
      query = db.prepare(`
        SELECT * FROM orders 
        WHERE order_date >= ? 
        AND order_date <= ? 
        AND platform = ?
        ORDER BY order_date DESC
      `);
      params = [startDate, endDate, platform];
    } else {
      query = db.prepare(`
        SELECT * FROM orders 
        WHERE order_date >= ? 
        AND order_date <= ?
        ORDER BY order_date DESC
      `);
      params = [startDate, endDate];
    }

    const results = query.all(...params) as Order[];
    return results.map((result) => ({
      ...result,
      raw_data: JSON.parse(result.raw_data as string),
    }));
  }

  static async createOrderItem(
    item: Omit<OrderItem, "id" | "created_at" | "updated_at">
  ): Promise<string> {
    const id = crypto.randomUUID();
    const query = db.prepare(`
      INSERT INTO order_items (
        id, order_id, sku, title, quantity, unit_price, unit_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    query.run(
      id,
      item.order_id,
      item.sku,
      item.title,
      item.quantity,
      item.unit_price,
      item.unit_cost
    );

    return id;
  }
}
