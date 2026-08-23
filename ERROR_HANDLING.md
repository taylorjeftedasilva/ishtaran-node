# Error Handling

Every error is a subclass of `IshtaranError` (see `SDK_CAPABILITY_SPEC.md` §6):

```
IshtaranError
├── AuthenticationError       (401 -- no code/detail)
├── AuthorizationError        (403 -- same)
├── ValidationError           (400, code=VALIDATION_ERROR -- 1 string, never a per-field list)
├── NotFoundError             (404, code=NOT_FOUND)
├── ConflictError             (409 -- various codes)
├── IdempotencyConflictError  (409, code=IDEMPOTENCY_KEY_CONFLICT -- extends ConflictError)
├── RateLimitError            (429, code=RATE_LIMITED -- retryAfterSeconds)
├── NetworkError              (transport failure)
├── TimeoutError              (request timeout, or waitFor exceeding its deadline)
└── ApiError                  (fallback -- preserves raw status/code/detail)
```

## Usage

```typescript
import { ValidationError, RateLimitError, IshtaranError } from '@ishtaran/sdk';

try {
  await client.withdrawals.request(orgId, accountId, destId, assetNetworkId, amount);
} catch (error) {
  if (error instanceof ValidationError) {
    console.warn('Validation failed:', error.message);
  } else if (error instanceof RateLimitError) {
    await new Promise((r) => setTimeout(r, (error.retryAfterSeconds ?? 1) * 1000));
  } else if (error instanceof IshtaranError) {
    console.error(`Failed (${error.httpStatus}):`, error.message);
  }
}
```

## Available fields

`httpStatus`, `code` (stable key, e.g. `VALIDATION_ERROR`), `requestId` (always `undefined`
today — the real API has no correlation ID mechanism, see §12.1), `details` (raw body),
`retryable`.

## Why 401/403 have no `code`/`detail`

No backend `AuthenticationHandler` registers a custom challenge — the authentication middleware
responds with an empty body before reaching the handler that produces `ProblemDetails`.
