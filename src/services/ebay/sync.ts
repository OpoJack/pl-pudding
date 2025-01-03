import { EbayService } from "./service";
import { OrderModel } from "../../db/models/order";

export class EbaySync {
  private service: EbayService;

  constructor() {
    this.service = new EbayService();
  }

  async syncOrders(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    try {
      const orders = await this.service.fetchOrdersByDateRange(startDate, endDate);

      for (const order of orders) {
        const existingOrder = await OrderModel.findByPlatformOrderId("ebay", order.orderId);

        if (existingOrder) {
          await this.service.updateOrder(order.orderId);
        } else {
          await this.service.createOrder(order.orderId);
        }
      }
    } catch (error) {
      console.error("Error syncing eBay orders:", error);
      throw error;
    }
  }
}
