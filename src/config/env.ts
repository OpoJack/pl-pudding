import { z } from "zod";

const envSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().default("sqlite.db"),

  // Shopify
  SHOPIFY_SHOP_NAME: z.string(),
  SHOPIFY_ACCESS_TOKEN: z.string(),

  // Walmart
  WALMART_CLIENT_ID: z.string(),
  WALMART_CLIENT_SECRET: z.string(),
  WALMART_BASE_URL: z.string().default("https://marketplace.walmartapis.com"),

  // eBay
  EBAY_APP_ID: z.string(),
  EBAY_CERT_ID: z.string(),
  EBAY_REFRESH_TOKEN: z.string(),
  EBAY_BASE_URL: z.string().default("https://api.ebay.com"),

  // ShipStation
  SHIPSTATION_API_KEY: z.string(),
  SHIPSTATION_API_SECRET: z.string(),
  SHIPSTATION_BASE_URL: z.string().default("https://ssapi.shipstation.com"),

  // Google Sheets
  GOOGLE_SHEETS_PRIVATE_KEY: z.string(),
  GOOGLE_SHEETS_CLIENT_EMAIL: z.string(),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export { env };
