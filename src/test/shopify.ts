// src/test-shopify.ts
import { config } from "../config";
import { ShopifyClient } from "../services";

async function testShopifyConnection() {
  const client = new ShopifyClient(config.shopify.baseUrl, config.shopify.accessToken);

  try {
    const orders = await client.getOrders({
      limit: 10,
    });
    console.log("Successfully fetched orders:", orders);
  } catch (error) {
    console.error("Error fetching Shopify orders:", error);
  }
}

testShopifyConnection();
