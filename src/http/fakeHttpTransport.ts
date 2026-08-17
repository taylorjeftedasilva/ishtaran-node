import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';

/**
 * Transporte em memória, sem rede — usado por todo teste de `resources/*`/retry/erro. Existe
 * exatamente para cumprir o requisito do brief de uma abstração de HTTP testável sem rede real.
 */
export class FakeHttpTransport implements HttpTransport {
  private queuedResponders: Array<(req: IshtaranHttpRequest) => IshtaranHttpResponse> = [];
  private defaultResponder?: (req: IshtaranHttpRequest) => IshtaranHttpResponse;
  readonly received: IshtaranHttpRequest[] = [];

  enqueue(response: IshtaranHttpResponse): this {
    this.queuedResponders.push(() => response);
    return this;
  }

  enqueueThrow(error: Error): this {
    this.queuedResponders.push(() => {
      throw error;
    });
    return this;
  }

  respondAlways(responder: (req: IshtaranHttpRequest) => IshtaranHttpResponse): this {
    this.defaultResponder = responder;
    return this;
  }

  async send(request: IshtaranHttpRequest): Promise<IshtaranHttpResponse> {
    this.received.push(request);
    const next = this.queuedResponders.shift();
    if (next) {
      return next(request);
    }
    if (this.defaultResponder) {
      return this.defaultResponder(request);
    }
    throw new Error('Nenhuma resposta configurada em FakeHttpTransport');
  }

  get requestCount(): number {
    return this.received.length;
  }

  static json(status: number, body: string, headers: Record<string, string> = {}): IshtaranHttpResponse {
    return { status, headers, body };
  }
}
