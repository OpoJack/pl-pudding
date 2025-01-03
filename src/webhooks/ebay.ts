import { OrderModel } from "../db/models/order";
import { EbayService } from "../services/ebay/service";

const ebayService = new EbayService();

export async function handleEbayWebhook(notification: any) {
  const orderId = notification.orderId;

  try {
    const existingOrder = await OrderModel.findByPlatformOrderId("ebay", orderId);

    if (existingOrder) {
      await ebayService.updateOrder(orderId);
    } else {
      await ebayService.createOrder(orderId);
    }
  } catch (error) {
    console.error("Error processing eBay webhook:", error);
    throw error;
  }
}
