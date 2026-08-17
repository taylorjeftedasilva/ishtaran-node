# Error Handling

Todo erro é uma subclasse de `IshtaranError` (ver `SDK_CAPABILITY_SPEC.md` §6):

```
IshtaranError
├── AuthenticationError       (401 — sem code/detail)
├── AuthorizationError        (403 — idem)
├── ValidationError           (400, code=VALIDATION_ERROR — 1 string, nunca lista por campo)
├── NotFoundError             (404, code=NOT_FOUND)
├── ConflictError             (409 — vários code)
├── IdempotencyConflictError  (409, code=IDEMPOTENCY_KEY_CONFLICT — extends ConflictError)
├── RateLimitError            (429, code=RATE_LIMITED — retryAfterSeconds)
├── NetworkError              (falha de transporte)
├── TimeoutError              (timeout de request, ou waitFor excedendo o prazo)
└── ApiError                  (fallback — preserva status/code/detail brutos)
```

## Uso

```typescript
import { ValidationError, RateLimitError, IshtaranError } from '@ishtaran/sdk';

try {
  await client.withdrawals.request(orgId, accountId, destId, assetNetworkId, amount);
} catch (error) {
  if (error instanceof ValidationError) {
    console.warn('Validação falhou:', error.message);
  } else if (error instanceof RateLimitError) {
    await new Promise((r) => setTimeout(r, (error.retryAfterSeconds ?? 1) * 1000));
  } else if (error instanceof IshtaranError) {
    console.error(`Falha (${error.httpStatus}):`, error.message);
  }
}
```

## Campos disponíveis

`httpStatus`, `code` (chave estável, ex. `VALIDATION_ERROR`), `requestId` (sempre `undefined` hoje
— API real não tem mecanismo de correlation ID, ver §12.1), `details` (corpo bruto), `retryable`.

## Por que 401/403 não têm `code`/`detail`

Nenhum `AuthenticationHandler` do backend registra challenge customizado — o middleware de
autenticação responde com corpo vazio antes de chegar no handler que produz `ProblemDetails`.
