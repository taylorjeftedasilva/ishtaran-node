import { describe, expect, it } from 'vitest';
import { LoggingTransport } from './loggingTransport.js';
import { FakeHttpTransport } from './fakeHttpTransport.js';
import { getRequest, withHeader } from './types.js';
import { NetworkError } from '../error/errors.js';

describe('LoggingTransport', () => {
  it('delegates and returns the real response', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '{"ok":true}'));
    const logging = new LoggingTransport(fake);
    const response = await logging.send(getRequest('/x'));
    expect(response.status).toBe(200);
    expect(fake.requestCount).toBe(1);
  });

  it('propagates an exception from the delegate', async () => {
    const fake = new FakeHttpTransport().enqueueThrow(new NetworkError('boom'));
    const logging = new LoggingTransport(fake);
    await expect(logging.send(getRequest('/x'))).rejects.toBeInstanceOf(NetworkError);
  });

  it('redactedHeaders never exposes the API key or Authorization in plain text', () => {
    const logging = new LoggingTransport(new FakeHttpTransport());
    let request = getRequest('/x');
    request = withHeader(request, 'X-Api-Key', 'supersecretapikeyvalue1234567890');
    request = withHeader(request, 'Authorization', 'Bearer supersecretjwttoken1234567890');
    request = withHeader(request, 'User-Agent', 'ishtaran-node/1.0.0');

    const rendered = logging.redactedHeaders(request);

    expect(rendered).not.toContain('supersecretapikeyvalue1234567890');
    expect(rendered).not.toContain('supersecretjwttoken1234567890');
    expect(rendered).toContain('****');
    expect(rendered).toContain('ishtaran-node/1.0.0');
  });
});
