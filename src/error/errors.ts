/**
 * Base of every exception thrown by the SDK -- see SDK_CAPABILITY_SPEC.md §6.4. `httpStatus`/`code`
 * are undefined for {@link NetworkError}/{@link TimeoutError} (no HTTP response ever existed);
 * `code`/`details` are always undefined for {@link AuthenticationError}/{@link AuthorizationError}
 * (401/403 never have a body -- see §6.3, Known Gap §12.1).
 */
export class IshtaranError extends Error {
  readonly httpStatus?: number;
  readonly code?: string;
  /**
   * Always undefined today -- the real API implements no request/correlation ID mechanism
   * (an exhaustive search in src/CompositionRoot/ found zero occurrences -- see SDK_CAPABILITY_SPEC.md §12.1).
   */
  readonly requestId?: string;
  readonly details?: unknown;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: { httpStatus?: number; code?: string; requestId?: string; details?: unknown; retryable?: boolean } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatus = options.httpStatus;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details;
    this.retryable = options.retryable ?? false;
  }
}

/** 401 -- no JSON body (see SDK_CAPABILITY_SPEC.md §6.3). `code`/`details` are always undefined. */
export class AuthenticationError extends IshtaranError {
  constructor(message: string) {
    super(message, { httpStatus: 401, retryable: false });
  }
}

/** 403 -- no JSON body (see SDK_CAPABILITY_SPEC.md §6.3). */
export class AuthorizationError extends IshtaranError {
  constructor(message: string) {
    super(message, { httpStatus: 403, retryable: false });
  }
}

/**
 * 400, `code=VALIDATION_ERROR`. `message` carries ONE string with all errors joined by "; " --
 * the real API (FluentValidation) doesn't expose a per-field array (see SDK_CAPABILITY_SPEC.md §6.1/§12.2).
 */
export class ValidationError extends IshtaranError {
  constructor(message: string, requestId: string | undefined, details: unknown) {
    super(message, { httpStatus: 400, code: 'VALIDATION_ERROR', requestId, details, retryable: false });
  }
}

/** 404, `code=NOT_FOUND`. */
export class NotFoundError extends IshtaranError {
  constructor(message: string, requestId: string | undefined, details: unknown) {
    super(message, { httpStatus: 404, code: 'NOT_FOUND', requestId, details, retryable: false });
  }
}

/** 409, any conflict `code` except IDEMPOTENCY_KEY_CONFLICT (see {@link IdempotencyConflictError}). */
export class ConflictError extends IshtaranError {
  constructor(message: string, code: string | undefined, requestId: string | undefined, details: unknown) {
    super(message, { httpStatus: 409, code, requestId, details, retryable: false });
  }
}

/**
 * 409, `code=IDEMPOTENCY_KEY_CONFLICT` -- same key resent with a payload different from the
 * original (see SDK_CAPABILITY_SPEC.md §9). Subtype of {@link ConflictError}.
 */
export class IdempotencyConflictError extends ConflictError {
  constructor(message: string, requestId: string | undefined, details: unknown) {
    super(message, 'IDEMPOTENCY_KEY_CONFLICT', requestId, details);
  }
}

/** 429, `code=RATE_LIMITED`. Always retryable -- exposes `retryAfterSeconds` from the real header. */
export class RateLimitError extends IshtaranError {
  readonly retryAfterSeconds?: number;

  constructor(message: string, requestId: string | undefined, details: unknown, retryAfterSeconds: number | undefined) {
    super(message, { httpStatus: 429, code: 'RATE_LIMITED', requestId, details, retryable: true });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Transport failure -- no HTTP response at all. Always retryable. */
export class NetworkError extends IshtaranError {
  constructor(message: string, cause?: unknown) {
    super(message, { retryable: true });
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/** Connect or request/read timeout exceeded (see SDK_CAPABILITY_SPEC.md §7), or `waitFor` exceeding its deadline. Always retryable. */
export class TimeoutError extends IshtaranError {
  constructor(message: string, cause?: unknown) {
    super(message, { retryable: true });
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/** Fallback -- any 4xx/5xx whose `code` isn't recognized. */
export class ApiError extends IshtaranError {
  constructor(message: string, httpStatus: number, code: string | undefined, requestId: string | undefined, details: unknown, retryable: boolean) {
    super(message, { httpStatus, code, requestId, details, retryable });
  }
}
