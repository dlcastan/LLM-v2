import { z } from "zod";

// Variables que pueden viajar al cliente
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// Secretos: solo servidor
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MP_ACCESS_TOKEN: z.string().min(1),
  MP_WEBHOOK_SECRET: z.string().min(1),
  BUNNY_LIBRARY_ID: z.string().min(1),
  BUNNY_TOKEN_KEY: z.string().min(1),
  BUNNY_API_KEY: z.string().min(1),
  BUNNY_CDN_HOSTNAME: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
});

export function publicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() no puede usarse en el cliente");
  }
  return serverSchema.parse(process.env);
}
