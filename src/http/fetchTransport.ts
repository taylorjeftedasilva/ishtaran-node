import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';
import { NetworkError, TimeoutError } from '../error/errors.js';
import { IshtaranClientConfig } from '../config/clientConfig.js';

/**
 * The only real {@link HttpTransport} implementation -- over Node's native `fetch` (zero
 * third-party dependency for transport, the same philosophy as the Java SDK's
 * `java.net.http.HttpClient`). TLS verified by default (Node `fetch`'s native behavior); never
 * disabled by this SDK. `redirect: 'manual'` -- never follows a redirect automatically (parity
 * with Java, which uses `Redirect.NEVER` by default; without this, native `fetch` would silently
 * follow 3xx, a real finding fixed in SECURITY_REVIEW.md).
 *
 * Documented known limitation: `connectTimeoutMs` is accepted in the configuration (parity with
 * the other SDKs) but is not yet enforced separately from `requestTimeoutMs` in this version --
 * only the total timeout (`AbortSignal.timeout(requestTimeoutMs)`) is applied. See CONFIGURATION.md.
 */
export class FetchHttpTransport implements HttpTransport {
  private readonly baseUrl: string;
  private readonly requestTimeoutMs: number;
  private readonly userAgent: string;

  constructor(config: IshtaranClientConfig) {
    this.baseUrl = config.baseUrl;
    this.requestTimeoutMs = config.requestTimeoutMs;
    this.userAgent = config.userAgent;
  }

  async send(request: IshtaranHttpRequest): Promise<IshtaranHttpResponse> {
    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      Accept: 'application/json',
      ...request.headers,
    };
    if (request.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${this.baseUrl}${request.path}`, {
        method: request.method,
        headers,
        body: request.body,
        redirect: 'manual',
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });

      if (response.status >= 300 && response.status < 400) {
        throw new NetworkError(
          `Redirect (${response.status}) received calling ${request.method} ${request.path} -- ` +
            'this SDK never follows redirects automatically (same policy as the Java SDK).',
        );
      }

      const body = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return { status: response.status, headers: responseHeaders, body };
    } catch (error) {
      if (error instanceof NetworkError || error instanceof TimeoutError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new TimeoutError(`Timeout calling ${request.method} ${request.path}`, error);
      }
      throw new NetworkError(`Network failure calling ${request.method} ${request.path}`, error);
    }
  }
}
