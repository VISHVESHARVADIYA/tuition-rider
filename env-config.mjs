import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    // SMTP configuration has been completely removed

    // Make these optional for development
    STRIPE_API_KEY: process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional().default("sk_test_dummy"),
    STRIPE_WEBHOOK_SECRET: process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional().default("whsec_dummy"),
    UPLOADTHING_SECRET: process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional().default("sk_dummy"),
    UPLOADTHING_APP_ID: process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional().default("dummy"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    // Make these optional for development
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional().default("pk_test_dummy"),
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional().default("price_dummy"),
    NEXT_PUBLIC_GA_TRACKING_ID: process.env.NODE_ENV === 'production'
      ? z.string().min(1)
      : z.string().min(1).optional().default("G-dummy"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // SMTP configuration has been completely removed

    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },
});