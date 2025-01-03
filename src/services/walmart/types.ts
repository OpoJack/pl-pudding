import { z } from "zod";
import { MoneySchema, AddressSchema } from "../../types/common";

export const WalmartOrderItemSchema = z.object({
  lineNumber: z.string(),
  item: z.object({
    productName: z.string(),
    sku: z.string(),
  }),
  orderLineQuantity: z.object({
    amount: z.string(),
    unitOfMeasurement: z.string(),
  }),
  charges: z.array(
    z.object({
      chargeType: z.string(),
      chargeName: z.string(),
      chargeAmount: MoneySchema,
    })
  ),
  statusDate: z.string(),
  orderLineStatus: z.string(),
});

export const WalmartOrderSchema = z.object({
  purchaseOrderId: z.string(),
  customerOrderId: z.string(),
  customerEmailId: z.string(),
  orderDate: z.string(),
  orderStatus: z.object({
    status: z.enum(["Created", "Acknowledged", "Shipped", "Delivered", "Cancelled", "Refund"]),
    statusQuantity: z.object({
      unitOfMeasurement: z.string(),
      amount: z.string(),
    }),
  }),
  orderLines: z.object({
    orderLine: z.array(WalmartOrderItemSchema),
  }),
});

export const WalmartOrdersResponse = z.object({
  list: z.object({
    elements: z.object({
      order: z.array(WalmartOrderSchema),
    }),
  }),
});

export type WalmartOrder = z.infer<typeof WalmartOrderSchema>;
export type WalmartOrderItem = z.infer<typeof WalmartOrderItemSchema>;
