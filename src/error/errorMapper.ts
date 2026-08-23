import { IshtaranHttpResponse, header } from '../http/types.js';
import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  IdempotencyConflictError,
  IshtaranError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from './errors.js';

interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
}

/**
 * Translates a real error {@link IshtaranHttpResponse} into the correct {@link IshtaranError}
 * subtype -- see SDK_CAPABILITY_SPEC.md §6. 401/403 never have a body (§6.3); other 4xx/5xx
 * usually carry `ProblemDetails`, but the mapper never throws if the body comes back
 * empty/malformed.
 */
export function mapError(response: IshtaranHttpResponse): IshtaranError {
  const status = response.status;
  const requestId = header(response, 'X-Request-Id') ?? header(response, 'X-Correlation-Id');

  if (status === 401) {
    return new AuthenticationError('Authentication failure (401) -- missing or invalid API Key or token.');
  }
  if (status === 403) {
    return new AuthorizationError('Unauthorized (403) -- valid credential, but not permitted for this operation.');
  }

  const problem = tryParse(response.body);
  const code = problem?.code;
  const detail = problem?.detail ?? `HTTP error ${status}`;

  if (status === 429) {
    const retryAfterHeader = header(response, 'Retry-After');
    const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;
    return new RateLimitError(detail, requestId, problem, retryAfterSeconds);
  }
  if (status === 400 && code === 'VALIDATION_ERROR') {
    return new ValidationError(detail, requestId, problem);
  }
  if (status === 404) {
    return new NotFoundError(detail, requestId, problem);
  }
  if (status === 409 && code === 'IDEMPOTENCY_KEY_CONFLICT') {
    return new IdempotencyConflictError(detail, requestId, problem);
  }
  if (status === 409) {
    return new ConflictError(detail, code, requestId, problem);
  }

  const retryable = status >= 500;
  return new ApiError(detail, status, code, requestId, problem, retryable);
}

function tryParse(body: string): ProblemDetails | undefined {
  if (!body || body.trim() === '') {
    return undefined;
  }
  try {
    return JSON.parse(body) as ProblemDetails;
  } catch {
    return undefined;
  }
}
