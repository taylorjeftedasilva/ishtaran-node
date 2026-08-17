import { describe, expect, it } from 'vitest';
import { RetryingTransport } from './retryingTransport.js';
import { FakeHttpTransport } from './fakeHttpTransport.js';
import { getRequest, postRequest } from './types.js';
import { NetworkError } from '../error/errors.js';
import { RetryPolicy, disabledRetryPolicy } from '../config/retryPolicy.js';

const FAST_POLICY: RetryPolicy = { maxRetries: 2, baseBackoffMs: 1, backoffMultiplier: 1.0, maxBackoffMs: 5 };

describe('RetryingTransport', () => {
  it('never retries 400 even with retries available', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(400, '{}'));
    const retrying = new RetryingTransport(fake, FAST_POLICY);
    await retrying.send(postRequest('/x', '{}', true));
    expect(fake.requestCount).toBe(1);
  });

  it('429 retried up to maxRetries, then returns the last response', async () => {
    const fake = new FakeHttpTransport()
      .enqueue(FakeHttpTransport.json(429, '{}'))
      .enqueue(FakeHttpTransport.json(429, '{}'))
      .enqueue(FakeHttpTransport.json(429, '{}'));
    const retrying = new RetryingTransport(fake, FAST_POLICY);
    const response = await retrying.send(postRequest('/x', '{}', true));
    expect(response.status).toBe(429);
    expect(fake.requestCount).toBe(3);
  });

  it('503 on idempotent request is retried', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(503, '{}')).enqueue(FakeHttpTransport.json(200, '{"ok":true}'));
    const retrying = new RetryingTransport(fake, FAST_POLICY);
    const response = await retrying.send(getRequest('/x'));
    expect(response.status).toBe(200);
    expect(fake.requestCount).toBe(2);
  });

  it('503 on non-idempotent request is never retried', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(503, '{}'));
    const retrying = new RetryingTransport(fake, FAST_POLICY);
    const response = await retrying.send(postRequest('/x', '{}', false));
    expect(response.status).toBe(503);
    expect(fake.requestCount).toBe(1);
  });

  it('connection failure retried up to maxRetries then throws', async () => {
    const fake = new FakeHttpTransport()
      .enqueueThrow(new NetworkError('conn reset'))
      .enqueueThrow(new NetworkError('conn reset'))
      .enqueueThrow(new NetworkError('conn reset'));
    const retrying = new RetryingTransport(fake, FAST_POLICY);
    await expect(retrying.send(getRequest('/x'))).rejects.toBeInstanceOf(NetworkError);
    expect(fake.requestCount).toBe(3);
  });

  it('retry disabled never retries', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(429, '{}'));
    const retrying = new RetryingTransport(fake, disabledRetryPolicy());
    await retrying.send(getRequest('/x'));
    expect(fake.requestCount).toBe(1);
  });
});
