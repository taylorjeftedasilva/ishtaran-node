export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Requisição interna, independente de biblioteca de transporte — nunca vaza `fetch`/`undici` na
 * superfície pública, permitindo testar `resources/*` com um {@link HttpTransport} falso, sem rede.
 */
export interface IshtaranHttpRequest {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  body?: string;
  /** Chamadas com Idempotency-Key (ou GET, naturalmente idempotente) podem ter 5xx retried com segurança (§8 do Capability Spec). */
  idempotent: boolean;
}

export interface IshtaranHttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export function header(response: IshtaranHttpResponse, name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(response.headers)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }
  return undefined;
}

export function getRequest(path: string): IshtaranHttpRequest {
  return { method: 'GET', path, headers: {}, idempotent: true };
}

export function postRequest(path: string, body: string | undefined, idempotent: boolean): IshtaranHttpRequest {
  return { method: 'POST', path, headers: {}, body, idempotent };
}

export function deleteRequest(path: string): IshtaranHttpRequest {
  return { method: 'DELETE', path, headers: {}, idempotent: false };
}

export function withHeader(request: IshtaranHttpRequest, name: string, value: string | undefined): IshtaranHttpRequest {
  if (value === undefined) {
    return request;
  }
  return { ...request, headers: { ...request.headers, [name]: value } };
}

/**
 * Abstração de transporte — a única implementação real é {@link FetchHttpTransport}, mas testes
 * usam uma implementação falsa in-memory, sem rede (requisito explícito do brief do SDK Program).
 */
export interface HttpTransport {
  send(request: IshtaranHttpRequest): Promise<IshtaranHttpResponse>;
}
