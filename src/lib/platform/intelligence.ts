/**
 * Rate Limiter for AI operations
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const DEFAULT_RATE_LIMITS = {
  ai_operation: { maxRequests: 20, windowMs: 60_000 }, // 20 per minute
  document_processing: { maxRequests: 10, windowMs: 60_000 },
};

export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(private config: RateLimitConfig) {}

  check(key: string): { allowed: boolean; resetMs: number } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const hits = (this.hits.get(key) || []).filter((t) => t > windowStart);

    if (hits.length >= this.config.maxRequests) {
      const oldest = hits[0];
      const resetMs = oldest + this.config.windowMs - now;
      return { allowed: false, resetMs: Math.max(resetMs, 0) };
    }

    hits.push(now);
    this.hits.set(key, hits);
    return { allowed: true, resetMs: 0 };
  }
}
