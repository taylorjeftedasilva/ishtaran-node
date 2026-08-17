import { describe, expect, it } from 'vitest';
import { AuthenticatingTransport } from './authenticatingTransport.js';
import { FakeHttpTransport } from './fakeHttpTransport.js';
import { getRequest } from './types.js';
import { BearerTokenHolder } from '../auth/bearerTokenHolder.js';

describe('AuthenticatingTransport', () => {
  it('attaches X-Api-Key when configured', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '{}'));
    const transport = new AuthenticatingTransport(fake, 'my-api-key', new BearerTokenHolder());
    await transport.send(getRequest('/x'));
    expect(fake.received[0]?.headers['X-Api-Key']).toBe('my-api-key');
  });

  it('bearer token set after construction is attached to subsequent requests', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '{}')).enqueue(FakeHttpTransport.json(200, '{}'));
    const holder = new BearerTokenHolder();
    const transport = new AuthenticatingTransport(fake, undefined, holder);

    await transport.send(getRequest('/before-login'));
    expect(fake.received[0]?.headers['Authorization']).toBeUndefined();

    holder.set('real-jwt-token');
    await transport.send(getRequest('/after-login'));
    expect(fake.received[1]?.headers['Authorization']).toBe('Bearer real-jwt-token');
  });

  it('neither header attached without API key or token', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '{}'));
    const transport = new AuthenticatingTransport(fake, undefined, new BearerTokenHolder());
    await transport.send(getRequest('/x'));
    expect(fake.received[0]?.headers['X-Api-Key']).toBeUndefined();
    expect(fake.received[0]?.headers['Authorization']).toBeUndefined();
  });
});
