import { z } from "zod";
import { MoneySchema, AddressSchema } from "../../types/common";

export const ShipStationItemSchema = z.object({
  lineItemKey: z.string(),
  sku: z.string(),
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  warehouseLocation: z.string().optional(),
  options: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export const ShipStationShipmentSchema = z.object({
  shipmentId: z.number(),
  orderId: z.string(),
  orderNumber: z.string(),
  createDate: z.string(),
  shipDate: z.string(),
  shipmentCost: z.number(),
  insuranceCost: z.number(),
  trackingNumber: z.string(),
  isReturnLabel: z.boolean(),
  carrierCode: z.string(),
  serviceCode: z.string(),
  packageCode: z.string(),
  voided: z.boolean(),
  voidDate: z.string().nullable(),
  deliveryDate: z.string().nullable(),
  weight: z.object({
    value: z.number(),
    units: z.string(),
  }),
});

export const ShipStationOrderSchema = z.object({
  orderId: z.number(),
  orderNumber: z.string(),
  orderKey: z.string(),
  orderDate: z.string(),
  createDate: z.string(),
  modifyDate: z.string(),
  paymentDate: z.string(),
  orderStatus: z.string(),
  customerUsername: z.string(),
  customerEmail: z.string(),
  billTo: AddressSchema,
  shipTo: AddressSchema,
  items: z.array(ShipStationItemSchema),
  orderTotal: z.number(),
  amountPaid: z.number(),
  taxAmount: z.number(),
  shippingAmount: z.number(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  gift: z.boolean(),
  giftMessage: z.string().optional(),
  paymentMethod: z.string(),
  requestedShippingService: z.string().optional(),
  carrierCode: z.string().optional(),
  serviceCode: z.string().optional(),
  packageCode: z.string().optional(),
  confirmation: z.string().optional(),
  shipDate: z.string().optional(),
  holdUntilDate: z.string().optional(),
  weight: z
    .object({
      value: z.number(),
      units: z.string(),
    })
    .optional(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
      units: z.string(),
    })
    .optional(),
  shipments: z.array(ShipStationShipmentSchema).optional(),
});

export const ShipStationOrdersResponse = z.object({
  orders: z.array(ShipStationOrderSchema),
  total: z.number(),
  page: z.number(),
  pages: z.number(),
});

export type ShipStationOrder = z.infer<typeof ShipStationOrderSchema>;
export type ShipStationShipment = z.infer<typeof ShipStationShipmentSchema>;
export type ShipStationItem = z.infer<typeof ShipStationItemSchema>;
