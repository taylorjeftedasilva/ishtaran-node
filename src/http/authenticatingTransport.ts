import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';
import { BearerTokenHolder } from '../auth/bearerTokenHolder.js';

const API_KEY_HEADER = 'X-Api-Key';

/**
 * Attaches `X-Api-Key` (when configured) and/or `Authorization: Bearer` (once a Member login has
 * happened on this client instance) -- never one masquerading as the other (a brief rule).
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
