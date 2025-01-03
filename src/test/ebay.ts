import { config } from "../config";
import { EbayClient } from "../services";

async function testEbayConnection() {
  const client = new EbayClient(
    config.ebay.baseUrl,
    config.ebay.appId,
    config.ebay.certId,
    config.ebay.refreshToken
  );

  try {
    const orders = await client.getOrders({
      limit: 10,
    });
    console.log("Successfully fetched orders:", orders);
  } catch (error) {
    console.error("Error fetching eBay orders:", error);
  }
}

testEbayConnection();
