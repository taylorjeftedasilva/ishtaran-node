import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';
import { BearerTokenHolder } from '../auth/bearerTokenHolder.js';

const API_KEY_HEADER = 'X-Api-Key';

/**
 * Anexa `X-Api-Key` (quando configurado) e/ou `Authorization: Bearer` (quando um login de Member
 * já ocorreu nesta instância de client) — nunca os dois disfarçados um do outro (regra do brief).
 */
export class AuthenticatingTransport implements HttpTransport {
  constructor(
    private readonly delegate: HttpTransport,
    private readonly apiKey: string | undefined,
    private readonly bearerTokenHolder: BearerTokenHolder,
  ) {}

  async send(request: IshtaranHttpRequest): Promise<IshtaranHttpResponse> {
    const headers = { ...request.headers };
    if (this.apiKey) {
      headers[API_KEY_HEADER] = this.apiKey;
    }
    const token = this.bearerTokenHolder.current();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this.delegate.send({ ...request, headers });
  }
}
