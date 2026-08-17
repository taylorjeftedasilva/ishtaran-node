import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse, header } from './types.js';
import { RetryPolicy } from '../config/retryPolicy.js';
import { NetworkError, TimeoutError } from '../error/errors.js';

/**
 * Decorator de retry — ver SDK_CAPABILITY_SPEC.md §8. Só reintenta: falha de conexão/timeout
 * (sempre), HTTP 429 (sempre, respeitando `Retry-After` quando presente), HTTP 5xx (só se
 * `request.idempotent`). Nunca reintenta 400/401/403/404/409/422 — são determinísticos.
 */
export class RetryingTransport implements HttpTransport {
  constructor(
    private readonly delegate: HttpTransport,
    private readonly policy: RetryPolicy,
  ) {}

  async send(request: IshtaranHttpRequest): Promise<IshtaranHttpResponse> {
    let attempt = 0;
    for (;;) {
      try {
        const response = await this.delegate.send(request);
        if (this.shouldRetryStatus(response.status, request.idempotent) && attempt < this.policy.maxRetries) {
          await this.sleepBeforeRetry(attempt, header(response, 'Retry-After'));
          attempt++;
          continue;
        }
        return response;
      } catch (error) {
        if ((error instanceof NetworkError || error instanceof TimeoutError) && attempt < this.policy.maxRetries) {
          await this.sleepBeforeRetry(attempt, undefined);
          attempt++;
          continue;
        }
        throw error;
      }
    }
  }

  private shouldRetryStatus(status: number, idempotent: boolean): boolean {
    if (status === 429) {
      return true;
    }
    return status >= 500 && status < 600 && idempotent;
  }

  private async sleepBeforeRetry(attempt: number, retryAfterHeader: string | undefined): Promise<void> {
    const delayMs = retryAfterHeader ? this.parseRetryAfterMs(retryAfterHeader) : this.backoffMs(attempt);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  private backoffMs(attempt: number): number {
    const raw = this.policy.baseBackoffMs * Math.pow(this.policy.backoffMultiplier, attempt);
    const capped = Math.min(raw, this.policy.maxBackoffMs);
    const jitter = Math.random() * Math.max(1, capped / 4);
    return capped + jitter;
  }

  private parseRetryAfterMs(headerValue: string): number {
    const seconds = Number.parseInt(headerValue.trim(), 10);
    return Number.isNaN(seconds) ? this.backoffMs(0) : seconds * 1000;
  }
}
