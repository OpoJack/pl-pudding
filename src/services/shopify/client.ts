import { ShopifyOrder, ShopifyOrdersResponse } from "./types";

export class ShopifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  async getOrders(params: {
    created_at_min?: string;
    created_at_max?: string;
    limit?: number;
  }): Promise<ShopifyOrder[]> {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await fetch(`${this.baseUrl}/orders.json?${queryParams}`, {
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const validated = ShopifyOrdersResponse.parse(data);
    return validated.orders;
  }
}
