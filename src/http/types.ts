export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Internal request, independent of any transport library -- never leaks `fetch`/`undici` into
 * the public surface, letting `resources/*` be tested with a fake {@link HttpTransport}, no
 * network.
 */
export interface IshtaranHttpRequest {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  body?: string;
  /** Calls with an Idempotency-Key (or GET, naturally idempotent) can have 5xx safely retried (Capability Spec §8). */
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
 * Transport abstraction -- the only real implementation is {@link FetchHttpTransport}, but tests
 * use a fake in-memory implementation, no network (an explicit requirement of the SDK Program
 * brief).
 */
export interface HttpTransport {
  send(request: IshtaranHttpRequest): Promise<IshtaranHttpResponse>;
}
