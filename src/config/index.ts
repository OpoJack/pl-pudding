import { env } from "./env";

export const config = {
  server: {
    port: env.PORT,
    environment: env.NODE_ENV,
  },

  database: {
    url: env.DATABASE_URL,
  },

  shopify: {
    shopName: env.SHOPIFY_SHOP_NAME,
    baseUrl: `https://${env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-01`,
    accessToken: env.SHOPIFY_ACCESS_TOKEN,
  },

  walmart: {
    baseUrl: env.WALMART_BASE_URL,
    clientId: env.WALMART_CLIENT_ID,
    clientSecret: env.WALMART_CLIENT_SECRET,
  },

  ebay: {
    baseUrl: env.EBAY_BASE_URL,
    appId: env.EBAY_APP_ID,
    certId: env.EBAY_CERT_ID,
    refreshToken: env.EBAY_REFRESH_TOKEN,
  },

  shipstation: {
    baseUrl: env.SHIPSTATION_BASE_URL,
    apiKey: env.SHIPSTATION_API_KEY,
    apiSecret: env.SHIPSTATION_API_SECRET,
  },

  googleSheets: {
    privateKey: env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: env.GOOGLE_SHEETS_CLIENT_EMAIL,
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
  },
} as const;

// Export type for the config object
export type Config = typeof config;
