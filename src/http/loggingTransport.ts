import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';
import { isSensitiveHeader, mask } from '../util/redactor.js';

/**
 * Opt-in logging (only active when `enableLogging: true` is set in the config) -- never logs
 * `Authorization`/`X-Api-Key` in plain text (central redaction), never logs the raw body (it
 * could contain a webhook secret/API Key in a creation response -- only method/path/status/duration).
 */
export class LoggingTransport implements HttpTransport {
  constructor(private readonly delegate: HttpTransport) {}

  async send(request: IshtaranHttpRequest): Promise<IshtaranHttpResponse> {
    const start = performance.now();
    // eslint-disable-next-line no-console
    console.debug(`--> ${request.method} ${request.path} headers=${this.redactedHeaders(request)}`);
    try {
      const response = await this.delegate.send(request);
      const elapsedMs = Math.round(performance.now() - start);
      // eslint-disable-next-line no-console
      console.debug(`<-- ${request.method} ${request.path} status=${response.status} (${elapsedMs} ms)`);
      return response;
    } catch (error) {
      const elapsedMs = Math.round(performance.now() - start);
      const name = error instanceof Error ? error.constructor.name : 'UnknownError';
      // eslint-disable-next-line no-console
      console.debug(`<-- ${request.method} ${request.path} FAILED: ${name} (${elapsedMs} ms)`);
      throw error;
    }
  }

  redactedHeaders(request: IshtaranHttpRequest): string {
    const parts = Object.entries(request.headers).map(
      ([name, value]) => `${name}=${isSensitiveHeader(name) ? mask(value) : value}`,
    );
    return `{${parts.join(', ')}}`;
  }
}
