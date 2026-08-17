import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';
import { isSensitiveHeader, mask } from '../util/redactor.js';

/**
 * Logging opt-in (só ativo quando `enableLogging: true` na config) — nunca loga
 * `Authorization`/`X-Api-Key` em texto puro (redação central), nunca loga o corpo bruto (pode
 * conter secret de webhook/API Key na resposta de criação — só método/path/status/duração).
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
