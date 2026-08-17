import { describe, expect, it } from 'vitest';
import { mapError } from './errorMapper.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  IdempotencyConflictError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from './errors.js';

describe('mapError', () => {
  it('401 has no body, maps to AuthenticationError without parsing', () => {
    const error = mapError({ status: 401, headers: {}, body: '' });
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.code).toBeUndefined();
    expect(error.details).toBeUndefined();
  });

  it('403 has no body, maps to AuthorizationError', () => {
    const error = mapError({ status: 403, headers: {}, body: '' });
    expect(error).toBeInstanceOf(AuthorizationError);
  });

  it('400 validation error is a single joined string, never a structured array', () => {
    const body = JSON.stringify({
      status: 400,
      title: 'Bad Request',
      detail: 'Amount must be positive; AccountId is required',
      code: 'VALIDATION_ERROR',
    });
    const error = mapError(FakeHttpTransport.json(400, body));
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toContain('Amount must be positive; AccountId is required');
  });

  it('404 maps to NotFoundError', () => {
    const body = JSON.stringify({ status: 404, detail: 'Withdrawal not found', code: 'NOT_FOUND' });
    expect(mapError(FakeHttpTransport.json(404, body))).toBeInstanceOf(NotFoundError);
  });

  it('409 idempotency conflict maps to IdempotencyConflictError, also a ConflictError', () => {
    const body = JSON.stringify({ status: 409, detail: 'reused', code: 'IDEMPOTENCY_KEY_CONFLICT' });
    const error = mapError(FakeHttpTransport.json(409, body));
    expect(error).toBeInstanceOf(IdempotencyConflictError);
    expect(error).toBeInstanceOf(ConflictError);
  });

  it('409 other conflict maps to a plain ConflictError, never the idempotency subtype', () => {
    const body = JSON.stringify({ status: 409, detail: 'other conflict', code: 'SOME_OTHER_CONFLICT' });
    const error = mapError(FakeHttpTransport.json(409, body));
    expect(error).toBeInstanceOf(ConflictError);
    expect(error).not.toBeInstanceOf(IdempotencyConflictError);
  });

  it('429 maps to RateLimitError with retryAfterSeconds from header', () => {
    const body = JSON.stringify({ status: 429, code: 'RATE_LIMITED' });
    const response = FakeHttpTransport.json(429, body, { 'Retry-After': '7' });
    const error = mapError(response) as RateLimitError;
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfterSeconds).toBe(7);
    expect(error.retryable).toBe(true);
  });

  it('5xx unrecognized code falls back to ApiError, never loses status/detail', () => {
    const body = JSON.stringify({ status: 503, detail: 'Downstream dependency down', code: 'SOME_NEW_5XX_CODE' });
    const error = mapError(FakeHttpTransport.json(503, body)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.httpStatus).toBe(503);
    expect(error.code).toBe('SOME_NEW_5XX_CODE');
    expect(error.retryable).toBe(true);
  });

  it('malformed or empty body never throws a parsing exception, falls back to ApiError', () => {
    const error = mapError(FakeHttpTransport.json(500, 'not json at all {{{'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.httpStatus).toBe(500);
  });
});
