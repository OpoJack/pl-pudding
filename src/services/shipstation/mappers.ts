import { OrderStatus } from "../../db/models/types";

export function mapShipstationStatus(status: string): OrderStatus {
  switch (status) {
    case "awaiting_payment":
      return "pending";
    case "awaiting_shipment":
      return "pending";
    case "pending_fulfillment":
      return "processing";
    case "shipped":
      return "shipped";
    case "on_hold":
      return "processing";
    case "cancelled":
      return "cancelled";
    case "rejected_fulfillment":
      return "cancelled";
    default:
      return "pending";
  }
}
