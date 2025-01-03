import { EbayOrdersResponse, type EbayOrder } from "./types";

export class EbayClient {
  private baseUrl: string;
  private appId: string;
  private certId: string;
  private refreshToken: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(baseUrl: string, appId: string, certId: string, refreshToken: string) {
    this.baseUrl = baseUrl;
    this.appId = appId;
    this.certId = certId;
    this.refreshToken = refreshToken;
  }

  private async ensureToken() {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const response = await fetch("https://api.sandbox.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.appId}:${this.certId}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        scope:
          "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.fulfillment",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to obtain eBay access token: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    return this.accessToken;
  }

  async getOrders(params: {
    creationdate_from?: string;
    creationdate_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<EbayOrder[]> {
    const token = await this.ensureToken();
    const queryParams = new URLSearchParams(params as Record<string, string>);

    const response = await fetch(`${this.baseUrl}/sell/fulfillment/v1/order?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.statusText}`);
    }

    const data = await response.json();
    const validated = EbayOrdersResponse.parse(data);
    return validated.orders;
  }
}
