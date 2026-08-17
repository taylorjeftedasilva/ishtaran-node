/**
 * Base de toda exceção lançada pelo SDK — ver SDK_CAPABILITY_SPEC.md §6.4. `httpStatus`/`code` são
 * indefinidos para {@link NetworkError}/{@link TimeoutError} (nenhuma resposta HTTP existiu);
 * `code`/`details` são sempre indefinidos para {@link AuthenticationError}/{@link AuthorizationError}
 * (401/403 nunca têm corpo — ver §6.3, Known Gap §12.1).
 */
export class IshtaranError extends Error {
  readonly httpStatus?: number;
  readonly code?: string;
  /**
   * Sempre indefinido hoje — a API real não implementa nenhum mecanismo de request/correlation ID
   * (busca exaustiva em src/CompositionRoot/, zero ocorrência — ver SDK_CAPABILITY_SPEC.md §12.1).
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

/** 401 — sem corpo JSON (ver SDK_CAPABILITY_SPEC.md §6.3). `code`/`details` são sempre indefinidos. */
export class AuthenticationError extends IshtaranError {
  constructor(message: string) {
    super(message, { httpStatus: 401, retryable: false });
  }
}

/** 403 — sem corpo JSON (ver SDK_CAPABILITY_SPEC.md §6.3). */
export class AuthorizationError extends IshtaranError {
  constructor(message: string) {
    super(message, { httpStatus: 403, retryable: false });
  }
}

/**
 * 400, `code=VALIDATION_ERROR`. `message` carrega UMA string com todos os erros unidos por "; " —
 * a API real (FluentValidation) não expõe array por campo (ver SDK_CAPABILITY_SPEC.md §6.1/§12.2).
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

/** 409, qualquer `code` de conflito exceto IDEMPOTENCY_KEY_CONFLICT (ver {@link IdempotencyConflictError}). */
export class ConflictError extends IshtaranError {
  constructor(message: string, code: string | undefined, requestId: string | undefined, details: unknown) {
    super(message, { httpStatus: 409, code, requestId, details, retryable: false });
  }
}

/**
 * 409, `code=IDEMPOTENCY_KEY_CONFLICT` — mesma chave reenviada com payload diferente do original
 * (ver SDK_CAPABILITY_SPEC.md §9). Subtipo de {@link ConflictError}.
 */
export class IdempotencyConflictError extends ConflictError {
  constructor(message: string, requestId: string | undefined, details: unknown) {
    super(message, 'IDEMPOTENCY_KEY_CONFLICT', requestId, details);
  }
}

/** 429, `code=RATE_LIMITED`. Sempre retryable — expõe `retryAfterSeconds` do header real. */
export class RateLimitError extends IshtaranError {
  readonly retryAfterSeconds?: number;

  constructor(message: string, requestId: string | undefined, details: unknown, retryAfterSeconds: number | undefined) {
    super(message, { httpStatus: 429, code: 'RATE_LIMITED', requestId, details, retryable: true });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Falha de transporte — sem nenhuma resposta HTTP. Sempre retryable. */
export class NetworkError extends IshtaranError {
  constructor(message: string, cause?: unknown) {
    super(message, { retryable: true });
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/** Connect ou request/read timeout excedido (ver SDK_CAPABILITY_SPEC.md §7), ou `waitFor` excedendo o prazo. Sempre retryable. */
export class TimeoutError extends IshtaranError {
  constructor(message: string, cause?: unknown) {
    super(message, { retryable: true });
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/** Fallback — qualquer 4xx/5xx cujo `code` não é reconhecido. */
export class ApiError extends IshtaranError {
  constructor(message: string, httpStatus: number, code: string | undefined, requestId: string | undefined, details: unknown, retryable: boolean) {
    super(message, { httpStatus, code, requestId, details, retryable });
  }
}
