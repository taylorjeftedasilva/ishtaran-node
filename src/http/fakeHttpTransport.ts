import { HttpTransport, IshtaranHttpRequest, IshtaranHttpResponse } from './types.js';

/**
 * In-memory transport, no network -- used by every `resources/*`/retry/error test. Exists
 * precisely to fulfill the brief's requirement of an HTTP abstraction testable without real
 * network.
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
    throw new Error('No response configured in FakeHttpTransport');
  }

  get requestCount(): number {
    return this.received.length;
  }

  static json(status: number, body: string, headers: Record<string, string> = {}): IshtaranHttpResponse {
    return { status, headers, body };
  }
}
