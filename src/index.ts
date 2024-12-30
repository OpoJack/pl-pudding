import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .get("/", () => "PNL Tracker API")
  .group("/webhooks", (app) =>
    app
      .post("/shopify", async ({ body, jwt }) => {
        // Handle Shopify webhooks
      })
      .post("/walmart", async ({ body, jwt }) => {
        // Handle Walmart webhooks
      })
      .post("/ebay", async ({ body, jwt }) => {
        // Handle eBay webhooks
      })
      .post("/shipstation", async ({ body, jwt }) => {
        // Handle ShipStation webhooks
      })
  )
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
