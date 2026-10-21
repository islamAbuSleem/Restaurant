export type EnvConfig = {
  NODE_ENV: string;
  PORT: number;
  WEB_ORIGIN: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TTL: number;
  JWT_REFRESH_TTL: number;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_CURRENCY: string;
  STORAGE_ENDPOINT: string;
  STORAGE_REGION: string;
  STORAGE_BUCKET: string;
  STORAGE_ACCESS_KEY_ID: string;
  STORAGE_SECRET_ACCESS_KEY: string;
  STORAGE_PUBLIC_BASE_URL: string;
};

const REQUIRED_IN_PRODUCTION = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

export function validateEnv(raw: Record<string, unknown>): Record<string, unknown> {
  const env = { ...raw };

  if (env.NODE_ENV === "production") {
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!env[key]) {
        throw new Error(`[config] Missing required environment variable: ${key}`);
      }
    }
  }

  env.JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me";
  env.JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";
  env.JWT_ACCESS_TTL = Number(env.JWT_ACCESS_TTL ?? 900);
  env.JWT_REFRESH_TTL = Number(env.JWT_REFRESH_TTL ?? 604800);
  env.WEB_ORIGIN = env.WEB_ORIGIN ?? "http://localhost:3000";
  env.PORT = Number(env.PORT ?? 4000);
  env.STRIPE_CURRENCY = env.STRIPE_CURRENCY ?? "usd";
  env.STORAGE_REGION = env.STORAGE_REGION ?? "us-east-1";
  env.STORAGE_BUCKET = env.STORAGE_BUCKET ?? "menu-images";

  return env;
}
