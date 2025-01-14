import { z } from "zod";

const ShipStationAddressSchema = z.object({
  name: z.string(),
  company: z.string().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

const ShipStationItemSchema = z.object({
  lineItemKey: z.string().nullable(),
  sku: z.string().nullable(),
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  warehouseLocation: z.string().optional().nullable(),
  options: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .nullable(),
});

const ShipStationOrderSchema = z.object({
  orderId: z.number(),
  orderNumber: z.string(),
  orderKey: z.string(),
  orderDate: z.string(),
  createDate: z.string(),
  modifyDate: z.string(),
  paymentDate: z.string().optional().nullable(),
  orderStatus: z.string(),
  customerUsername: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  billTo: ShipStationAddressSchema,
  shipTo: ShipStationAddressSchema,
  items: z.array(ShipStationItemSchema),
  orderTotal: z.number(),
  amountPaid: z.number(),
  taxAmount: z.number(),
  shippingAmount: z.number(),
  customerNotes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  gift: z.boolean(),
  giftMessage: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  requestedShippingService: z.string().optional().nullable(),
  carrierCode: z.string().optional().nullable(),
  serviceCode: z.string().optional().nullable(),
  packageCode: z.string().optional().nullable(),
  confirmation: z.string().optional().nullable(),
  shipDate: z.string().optional().nullable(),
  holdUntilDate: z.string().optional().nullable(),
  weight: z
    .object({
      value: z.number(),
      units: z.string(),
    })
    .optional()
    .nullable(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
      units: z.string(),
    })
    .optional()
    .nullable(),
  shipments: z
    .array(
      z.object({
        shipmentId: z.number(),
        orderId: z.string(),
        orderNumber: z.string(),
        createDate: z.string(),
        shipDate: z.string(),
        shipmentCost: z.number(),
        trackingNumber: z.string(),
        isReturnLabel: z.boolean(),
        carrierCode: z.string(),
        serviceCode: z.string(),
        packageCode: z.string(),
        voided: z.boolean(),
        voidDate: z.string().nullable(),
        deliveryDate: z.string().nullable(),
      })
    )
    .optional()
    .nullable(),
});

const ShipStationOrdersResponse = z.object({
  orders: z.array(ShipStationOrderSchema),
  total: z.number(),
  page: z.number(),
  pages: z.number(),
});

export type ShipStationOrder = z.infer<typeof ShipStationOrderSchema>;
export type ShipStationItem = z.infer<typeof ShipStationItemSchema>;

export { ShipStationOrdersResponse, ShipStationOrderSchema, ShipStationItemSchema };
