import { GoogleSheetsClient } from "../services/sheets/client";
import { calculatePNLRow } from "../services/sheets/utils";
import type { Order, OrderItem, ShippingRecord } from "../db/models/types";

async function testSheetsIntegration() {
  const client = new GoogleSheetsClient();

  const mockOrder: Order = {
    id: "test-order-id",
    platform: "shopify",
    platform_order_id: "TEST-001",
    order_date: new Date().toISOString(),
    order_number: "TEST-001",
    customer_email: "test@example.com",
    order_status: "completed",
    total_amount: 99.99,
    shipping_amount: 7.5,
    tax_amount: 5.0,
    platform_fees: 2.9,
    raw_data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockOrderItem: OrderItem = {
    id: "test-item-id",
    order_id: mockOrder.id,
    sku: "TEST-SKU-1",
    title: "Test Product",
    quantity: 1,
    unit_price: 99.99,
    unit_cost: 40.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockShippingRecord: ShippingRecord = {
    id: "test-shipping-id",
    order_id: mockOrder.id,
    shipstation_id: null,
    carrier: "USPS",
    service: "Priority",
    tracking_number: "test123",
    status: "shipped",
    shipping_cost: 7.5,
    shipping_date: new Date().toISOString(),
    delivery_date: null,
    raw_data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    // Create first test row using calculatePNLRow
    const testRow1 = calculatePNLRow(mockOrder, mockOrderItem, mockShippingRecord, 2);

    // Create second test row with different platform and values
    const mockOrder2 = {
      ...mockOrder,
      platform: "walmart" as const,
      platform_order_id: "TEST-002",
      total_amount: 149.99,
    };
    const mockOrderItem2 = {
      ...mockOrderItem,
      sku: "TEST-SKU-2",
      unit_price: 149.99,
      unit_cost: 60.0,
    };

    const testRow2 = calculatePNLRow(mockOrder2, mockOrderItem2, mockShippingRecord, 3);

    // Add both rows
    await client.addOrUpdateRows([testRow1, testRow2]);
    console.log("Initial rows added successfully");

    // Update first row with new cost
    const updatedOrderItem = {
      ...mockOrderItem,
      unit_cost: 35.0,
    };
    const updatedRow = calculatePNLRow(mockOrder, updatedOrderItem, mockShippingRecord, 2);

    await client.addOrUpdateRows([updatedRow]);
    console.log("Row update successful");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testSheetsIntegration();
