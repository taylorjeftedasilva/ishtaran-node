import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { FetchHttpTransport } from './fetchTransport.js';
import { NetworkError } from '../error/errors.js';
import { buildClientConfig } from '../config/clientConfig.js';
import { Environment } from '../config/environment.js';
import { getRequest } from './types.js';

describe('FetchHttpTransport redirect policy (parity with Java Redirect.NEVER)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('never follows a 3xx redirect automatically — throws NetworkError instead', async () => {
    global.fetch = vi.fn(async (_url, init) => {
      expect((init as RequestInit).redirect).toBe('manual');
      return new Response('', { status: 302, headers: { Location: 'https://evil.example.com/steal' } });
    }) as typeof fetch;

    const config = buildClientConfig({ environment: Environment.Local });
    const transport = new FetchHttpTransport(config);

    await expect(transport.send(getRequest('/x'))).rejects.toBeInstanceOf(NetworkError);
  });

  it('passes through non-redirect responses normally', async () => {
    global.fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 })) as typeof fetch;

    const config = buildClientConfig({ environment: Environment.Local });
    const transport = new FetchHttpTransport(config);

    const response = await transport.send(getRequest('/x'));
    expect(response.status).toBe(200);
    expect(response.body).toBe('{"ok":true}');
  });
});
