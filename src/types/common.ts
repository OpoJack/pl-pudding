import { z } from "zod";

export const MoneySchema = z.object({
  amount: z.string(), // Using string for precise decimal handling
  currency: z.string().default("USD"),
});

export const AddressSchema = z.object({
  name: z.string(),
  company: z.string().optional(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  phone: z.string().optional(),
});
