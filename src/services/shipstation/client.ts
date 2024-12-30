import { ShipStationOrdersResponse, type ShipStationOrder } from "./types";

export class ShipStationClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(baseUrl: string, apiKey: string, apiSecret: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private get authHeader() {
    return `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`;
  }

  async getOrders(params: {
    createDateStart?: string;
    createDateEnd?: string;
    orderStatus?: string;
    pageSize?: number;
    page?: number;
  }): Promise<ShipStationOrder[]> {
    const queryParams = new URLSearchParams(params as Record<string, string>);

    const response = await fetch(`${this.baseUrl}/orders?${queryParams}`, {
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ShipStation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const validated = ShipStationOrdersResponse.parse(data);
    return validated.orders;
  }

  async getShipments(params: {
    createDateStart?: string;
    createDateEnd?: string;
    pageSize?: number;
    page?: number;
  }) {
    const queryParams = new URLSearchParams(params as Record<string, string>);

    const response = await fetch(`${this.baseUrl}/shipments?${queryParams}`, {
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ShipStation API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // TODO: Add specific shipment response schema
  }
}
