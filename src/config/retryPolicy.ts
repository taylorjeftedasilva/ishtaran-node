/**
 * Política de retry — ver SDK_CAPABILITY_SPEC.md §8. Retry só em falha de conexão, 429 (respeitando
 * `Retry-After`), e 5xx quando a chamada tem Idempotency-Key. Nunca em 4xx determinístico.
 */
export interface RetryPolicy {
  /** Tentativas adicionais além da primeira (default 2 → até 3 tentativas totais). */
  maxRetries: number;
  /** Atraso base do backoff exponencial em ms (default 200). */
  baseBackoffMs: number;
  /** Fator multiplicativo por tentativa (default 2.0). */
  backoffMultiplier: number;
  /** Teto do backoff em ms, antes do jitter (default 5000). */
  maxBackoffMs: number;
}

export function defaultRetryPolicy(): RetryPolicy {
  return { maxRetries: 2, baseBackoffMs: 200, backoffMultiplier: 2.0, maxBackoffMs: 5000 };
}

export function disabledRetryPolicy(): RetryPolicy {
  return { maxRetries: 0, baseBackoffMs: 0, backoffMultiplier: 1.0, maxBackoffMs: 0 };
}
