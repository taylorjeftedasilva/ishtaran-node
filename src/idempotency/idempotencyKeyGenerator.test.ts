import { describe, expect, it } from 'vitest';
import { generateIdempotencyKey, resolveIdempotencyKey } from './idempotencyKeyGenerator.js';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('idempotencyKeyGenerator', () => {
  it('never overwrites an explicit key', () => {
    expect(resolveIdempotencyKey('my-explicit-key-123')).toBe('my-explicit-key-123');
  });

  it('generates a valid UUID v4 when omitted or blank', () => {
    expect(resolveIdempotencyKey(undefined)).toMatch(UUID_V4);
    expect(resolveIdempotencyKey('  ')).toMatch(UUID_V4);
  });

  it('two calls never produce the same key', () => {
    expect(generateIdempotencyKey()).not.toBe(generateIdempotencyKey());
  });
});
