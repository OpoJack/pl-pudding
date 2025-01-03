export interface PNLRow {
  orderDate: string;
  lastUpdated: string;
  orderSource: string;
  orderId: string;
  sku: string;
  grossSale: number;
  adFees: number;
  otherFees: number;
  shipping: number;
  cost: number;
  profit: string | number;
  shippingStatus: string;
}
