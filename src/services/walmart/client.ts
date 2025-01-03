import { WalmartOrdersResponse, type WalmartOrder } from "./types";

export class WalmartClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(baseUrl: string, clientId: string, clientSecret: string) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async ensureToken() {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const response = await fetch("https://marketplace.walmartapis.com/v3/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "WM_SVC.NAME": "Walmart Marketplace",
        "WM_QOS.CORRELATION_ID": crypto.randomUUID(),
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to obtain Walmart access token");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    return this.accessToken;
  }

  async getOrders(params: {
    createdStartDate?: string;
    createdEndDate?: string;
    limit?: number;
    status?: string;
  }): Promise<WalmartOrder[]> {
    const token = await this.ensureToken();
    const queryParams = new URLSearchParams({
      ...(params as Record<string, string>),
      limit: params.limit?.toString() || "100",
    });

    const response = await fetch(`${this.baseUrl}/orders?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "WM_SVC.NAME": "Walmart Marketplace",
        "WM_QOS.CORRELATION_ID": crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      throw new Error(`Walmart API error: ${response.statusText}`);
    }

    const data = await response.json();
    const validated = WalmartOrdersResponse.parse(data);
    return validated.list.elements.order;
  }
}
