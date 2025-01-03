import { db } from "../index";

export class ArchiveModel {
  static async archiveOldData(daysToKeep: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const dateStr = cutoffDate.toISOString();

    const deleteOrders = db.prepare("DELETE FROM orders WHERE order_date < ?");
    const deleteItems = db.prepare(`
      DELETE FROM order_items 
      WHERE order_id IN (SELECT id FROM orders WHERE order_date < ?)
    `);
    const deleteShipping = db.prepare(`
      DELETE FROM shipping_records 
      WHERE order_id IN (SELECT id FROM orders WHERE order_date < ?)
    `);

    // Start transaction
    db.transaction(() => {
      deleteShipping.run(dateStr);
      deleteItems.run(dateStr);
      deleteOrders.run(dateStr);
    })();
  }
}
