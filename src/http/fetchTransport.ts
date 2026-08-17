import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';
import { NetworkError, TimeoutError } from '../error/errors.js';
import { IshtaranClientConfig } from '../config/clientConfig.js';

/**
 * Única implementação real de {@link HttpTransport} — sobre `fetch` nativo do Node (zero
 * dependência de terceiros para transporte, mesma filosofia do `java.net.http.HttpClient` do SDK
 * Java). TLS verificado por padrão (comportamento nativo do Node `fetch`); nunca desabilitado por
 * este SDK. `redirect: 'manual'` — nunca segue redirect automaticamente (paridade com o Java, que
 * usa `Redirect.NEVER` por padrão; sem isso, o `fetch` nativo seguiria 3xx silenciosamente, um
 * achado real corrigido em SECURITY_REVIEW.md).
 *
 * Limitação conhecida documentada: `connectTimeoutMs` é aceito na configuração (paridade com os
 * outros SDKs) mas ainda não é imposto separadamente de `requestTimeoutMs` nesta versão — só o
 * timeout total (`AbortSignal.timeout(requestTimeoutMs)`) é aplicado. Ver CONFIGURATION.md.
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
          `Redirect (${response.status}) recebido ao chamar ${request.method} ${request.path} — ` +
            'este SDK nunca segue redirects automaticamente (mesma política do SDK Java).',
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
        throw new TimeoutError(`Timeout ao chamar ${request.method} ${request.path}`, error);
      }
      throw new NetworkError(`Falha de rede ao chamar ${request.method} ${request.path}`, error);
    }
  }
}
