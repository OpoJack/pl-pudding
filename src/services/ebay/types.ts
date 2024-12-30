import { z } from "zod";
import { MoneySchema, AddressSchema } from "../../types/common";

export const EbayOrderItemSchema = z.object({
  lineItemId: z.string(),
  legacyItemId: z.string(),
  title: z.string(),
  sku: z.string().optional(),
  quantity: z.number(),
  price: MoneySchema,
  deliveryCost: MoneySchema.optional(),
  tax: MoneySchema.optional(),
});

export const EbayOrderSchema = z.object({
  orderId: z.string(),
  creationDate: z.string(),
  lastModifiedDate: z.string(),
  orderFulfillmentStatus: z.string(),
  orderPaymentStatus: z.string(),
  seller: z.object({
    username: z.string(),
    feedbackScore: z.number(),
  }),
  buyer: z.object({
    username: z.string(),
  }),
  pricingSummary: z.object({
    priceSubtotal: MoneySchema,
    deliveryCost: MoneySchema,
    total: MoneySchema,
  }),
  fulfillmentStartInstructions: z.array(
    z.object({
      shippingStep: z.object({
        shipTo: AddressSchema,
        shippingServiceCode: z.string(),
      }),
    })
  ),
  lineItems: z.array(EbayOrderItemSchema),
});

export const EbayOrdersResponse = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  orders: z.array(EbayOrderSchema),
});

export type EbayOrder = z.infer<typeof EbayOrderSchema>;
export type EbayOrderItem = z.infer<typeof EbayOrderItemSchema>;
