/**
 * Retry policy -- see SDK_CAPABILITY_SPEC.md §8. Retries only on connection failure, 429
 * (respecting `Retry-After`), and 5xx when the call has an Idempotency-Key. Never on a
 * deterministic 4xx.
 */
export interface RetryPolicy {
  /** Additional attempts beyond the first (default 2 -> up to 3 total attempts). */
  maxRetries: number;
  /** Base delay of the exponential backoff in ms (default 200). */
  baseBackoffMs: number;
  /** Multiplicative factor per attempt (default 2.0). */
  backoffMultiplier: number;
  /** Backoff cap in ms, before jitter (default 5000). */
  maxBackoffMs: number;
}

export function defaultRetryPolicy(): RetryPolicy {
  return { maxRetries: 2, baseBackoffMs: 200, backoffMultiplier: 2.0, maxBackoffMs: 5000 };
}

export function disabledRetryPolicy(): RetryPolicy {
  return { maxRetries: 0, baseBackoffMs: 0, backoffMultiplier: 1.0, maxBackoffMs: 0 };
}
