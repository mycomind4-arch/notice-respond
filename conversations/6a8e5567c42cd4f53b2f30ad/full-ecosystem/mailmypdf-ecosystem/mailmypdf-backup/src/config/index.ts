/**
 * Centralized configuration for MailMyPDF.
 *
 * All `process.env` access should go through this module.
 * Configuration is validated at startup — missing required values
 * cause a fail-fast error with a clear message.
 *
 * Usage:
 *   import { config } from "@/config";
 *   const key = config.stripe.secretKey;
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StripeConfig {
  env: "sandbox" | "live";
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  apiVersion: string;
}

export interface LobConfig {
  apiKey: string;
  webhookSecret: string;
  autoSubmit: boolean;
}

export interface SupabaseConfig {
  projectId: string;
  url: string;
  publishableKey: string;
}

export interface EmailConfig {
  resendApiKey: string | null;
  fromAddress: string;
  supportEmail: string;
}

export interface StorageConfig {
  bucketName: string;
  signedUrlTtlSeconds: number;
}

export interface FeatureFlags {
  autoSubmitToLob: boolean;
  emailEnabled: boolean;
}

export interface UrlsConfig {
  appBaseUrl: string;
}

export interface ScheduledJobsConfig {
  cleanupSecret: string;
  draftRetentionHours: number;
  cleanupBatchSize: number;
}

export interface AppConfig {
  stripe: StripeConfig;
  lob: LobConfig;
  supabase: SupabaseConfig;
  email: EmailConfig;
  storage: StorageConfig;
  flags: FeatureFlags;
  urls: UrlsConfig;
  jobs: ScheduledJobsConfig;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function required(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[config] Missing required environment variable: ${key}\n` +
      `Set it in your .env file or deployment environment.`,
    );
  }
  return value.trim();
}

function optional(key: string): string | null {
  const value = process.env[key];
  return value && value.trim() !== "" ? value.trim() : null;
}

function requiredInt(key: string, fallback: number, min: number, max: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`[config] ${key} must be an integer between ${min} and ${max}, got: ${raw}`);
  }
  return value;
}

// ── Validation ───────────────────────────────────────────────────────────────

let cachedConfig: AppConfig | null = null;

/**
 * Validates and returns the application configuration.
 * Throws on first missing required value — fail-fast at startup.
 *
 * Call `getConfig()` once at startup (or let it lazy-init on first access).
 */
export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  // Supabase
  const supabaseProjectId = required("SUPABASE_PROJECT_ID");
  const supabasePublishableKey = required("SUPABASE_PUBLISHABLE_KEY");
  const supabaseUrl = required("SUPABASE_URL");

  // Stripe
  const paymentsEnv = required("PAYMENTS_ENV");
  if (paymentsEnv !== "sandbox" && paymentsEnv !== "live") {
    throw new Error(`[config] PAYMENTS_ENV must be "sandbox" or "live", got: ${paymentsEnv}`);
  }
  const stripeSecretKey = paymentsEnv === "sandbox"
    ? required("STRIPE_SANDBOX_API_KEY")
    : required("STRIPE_LIVE_API_KEY");
  const stripeWebhookSecret = paymentsEnv === "sandbox"
    ? required("PAYMENTS_SANDBOX_WEBHOOK_SECRET")
    : required("PAYMENTS_LIVE_WEBHOOK_SECRET");
  const stripePublishableKey = optional("VITE_PAYMENTS_CLIENT_TOKEN")
    ?? optional("STRIPE_PUBLISHABLE_KEY")
    ?? "";

  // Lob
  const lobApiKey = optional("LOB_API_KEY");
  const lobWebhookSecret = optional("LOB_WEBHOOK_SECRET");

  // Email
  const resendApiKey = optional("RESEND_API_KEY");

  // URLs
  const appBaseUrl = optional("MAILMYPDF_BASE_URL")
    ?? optional("PUBLIC_APP_URL")
    ?? optional("APP_URL")
    ?? "https://mailmypdf.com";
  // Validate URL format
  try { new URL(appBaseUrl); } catch {
    throw new Error(`[config] Invalid MAILMYPDF_BASE_URL: ${appBaseUrl}`);
  }

  // Scheduled jobs
  const cleanupSecret = optional("MAILMYPDF_CLEANUP_SECRET") ?? "";
  const draftRetentionHours = requiredInt("MAILMYPDF_DRAFT_RETENTION_HOURS", 24, 1, 168);
  const cleanupBatchSize = requiredInt("MAILMYPDF_CLEANUP_BATCH_SIZE", 100, 1, 500);

  cachedConfig = {
    stripe: {
      env: paymentsEnv as "sandbox" | "live",
      secretKey: stripeSecretKey,
      publishableKey: stripePublishableKey,
      webhookSecret: stripeWebhookSecret,
      apiVersion: "2026-03-25.dahlia",
    },
    lob: {
      apiKey: lobApiKey ?? "",
      webhookSecret: lobWebhookSecret ?? "",
      autoSubmit: String(process.env.AUTO_SUBMIT_TO_LOB || "").toLowerCase() === "true",
    },
    supabase: {
      projectId: supabaseProjectId,
      url: supabaseUrl,
      publishableKey: supabasePublishableKey,
    },
    email: {
      resendApiKey,
      fromAddress: "MailMyPDF <onboarding@resend.dev>",
      supportEmail: "support@mailmypdf.com",
    },
    storage: {
      bucketName: "order-pdfs",
      signedUrlTtlSeconds: 3600,
    },
    flags: {
      autoSubmitToLob: String(process.env.AUTO_SUBMIT_TO_LOB || "").toLowerCase() === "true",
      emailEnabled: resendApiKey !== null,
    },
    urls: {
      appBaseUrl,
    },
    jobs: {
      cleanupSecret,
      draftRetentionHours,
      cleanupBatchSize,
    },
  };

  return cachedConfig;
}

/**
 * Returns true if Lob is configured (API key present).
 */
export function isLobConfigured(): boolean {
  return !!getConfig().lob.apiKey;
}

/**
 * Returns true if auto-submit to Lob is enabled.
 */
export function autoSubmitEnabled(): boolean {
  return getConfig().flags.autoSubmitToLob;
}

/**
 * Returns true if email (Resend) is configured.
 */
export function isEmailConfigured(): boolean {
  return getConfig().flags.emailEnabled;
}

/**
 * Resets cached config — useful for tests.
 */
export function resetConfig(): void {
  cachedConfig = null;
}
