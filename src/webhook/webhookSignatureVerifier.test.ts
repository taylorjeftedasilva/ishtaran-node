import { describe, expect, it } from 'vitest';
import { computeWebhookSignature, verifyWebhookSignature } from './webhookSignatureVerifier.js';
import { createHmac } from 'node:crypto';

const SECRET = 'whsec_test_secret_1234567890';

describe('WebhookSignatureVerifier', () => {
  it('accepts a correctly computed signature', () => {
    const body = '{"event":"payment.received","amount":100}';
    const ts = Math.floor(Date.now() / 1000);
    const signature = computeWebhookSignature(ts, body, SECRET);
    expect(verifyWebhookSignature(body, signature, String(ts), SECRET)).toBe(true);
  });

  it('rejects a tampered payload', () => {
    const body = '{"event":"payment.received","amount":100}';
    const ts = Math.floor(Date.now() / 1000);
    const signature = computeWebhookSignature(ts, body, SECRET);
    const tampered = '{"event":"payment.received","amount":999999}';
    expect(verifyWebhookSignature(tampered, signature, String(ts), SECRET)).toBe(false);
  });

  it('rejects a tampered signature', () => {
    const body = '{"event":"payment.received"}';
    const ts = Math.floor(Date.now() / 1000);
    const signature = computeWebhookSignature(ts, body, SECRET);
    const tampered = signature.slice(0, -4) + 'dead';
    expect(verifyWebhookSignature(body, tampered, String(ts), SECRET)).toBe(false);
  });

  it('rejects an expired timestamp', () => {
    const body = '{"event":"x"}';
    const staleTs = Math.floor(Date.now() / 1000) - 2 * 60 * 60;
    const signature = computeWebhookSignature(staleTs, body, SECRET);
    expect(verifyWebhookSignature(body, signature, String(staleTs), SECRET)).toBe(false);
  });

  it('rejects the wrong secret', () => {
    const body = '{"event":"x"}';
    const ts = Math.floor(Date.now() / 1000);
    const signature = computeWebhookSignature(ts, body, SECRET);
    expect(verifyWebhookSignature(body, signature, String(ts), 'wrong-secret')).toBe(false);
  });

  it('accepts uppercase hex signature (case-insensitive)', () => {
    const body = '{"event":"x"}';
    const ts = Math.floor(Date.now() / 1000);
    const signature = computeWebhookSignature(ts, body, SECRET).toUpperCase();
    expect(verifyWebhookSignature(body, signature, String(ts), SECRET)).toBe(true);
  });

  it('matches a known vector computed independently in Python (hmac.new(...).hexdigest())', () => {
    expect(computeWebhookSignature(1700000000, '{"a":1}', 'topsecret')).toBe(
      '6a939b0c71853d606167625a15168ee9188c6a511c773ef4f42d307f3849e50f',
    );
  });

  it('matches node:crypto computed independently of the SDK function', () => {
    const expected = createHmac('sha256', SECRET).update('1700000000.{}', 'utf8').digest('hex');
    expect(computeWebhookSignature(1700000000, '{}', SECRET)).toBe(expected);
  });
});
