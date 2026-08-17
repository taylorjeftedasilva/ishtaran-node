import { describe, expect, it } from 'vitest';
import { isSensitiveHeader, mask } from './redactor.js';

describe('Redactor', () => {
  it('masks a long secret showing only first/last 4 chars', () => {
    expect(mask('QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVoxMjM0NTY3ODkw')).toBe('QUJD****ODkw');
  });

  it('never partially leaks a short secret', () => {
    expect(mask('short')).toBe('****');
  });

  it('returns a placeholder for null/undefined', () => {
    expect(mask(undefined)).toBe('null');
    expect(mask(null)).toBe('null');
  });

  it('recognizes Authorization and X-Api-Key case-insensitively', () => {
    expect(isSensitiveHeader('Authorization')).toBe(true);
    expect(isSensitiveHeader('x-api-key')).toBe(true);
    expect(isSensitiveHeader('X-API-KEY')).toBe(true);
    expect(isSensitiveHeader('User-Agent')).toBe(false);
  });
});
