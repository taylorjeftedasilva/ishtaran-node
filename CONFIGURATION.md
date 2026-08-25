# Configuration

```typescript
const client = IshtaranClient.create({
  apiKey: '...',
  environment: Environment.Local,
  baseUrl: 'http://localhost:8080', // always explicit when present
  connectTimeoutMs: 5000,           // default
  requestTimeoutMs: 30000,          // default
  enableLogging: true,              // opt-in, never on by default
});
```

## `baseUrl`/`Environment`

| Environment | Default | Explicit `baseUrl`? |
|---|---|---|
| `Local` | `http://localhost:8080` | No |
| `Sandbox` | `https://sandbox-api.ishtaran.com` (the real, live public Sandbox) | No |
| `Production` | **none** — infra not yet provisioned | **Yes, required** |

Constructing without `baseUrl` for `Production` throws immediately — it never points to a
made-up URL. An explicit `baseUrl` always overrides the `Sandbox` default too.

## Known limitation — timeout

`connectTimeoutMs` is accepted in the config (for parity with the other SDKs) but is not yet
enforced separately from `requestTimeoutMs` in this version — only the total timeout
(`AbortSignal.timeout(requestTimeoutMs)`) is applied on top of the native `fetch`. Documented,
not hidden.

## TLS

Verified by default (native `fetch` behavior); never disabled by this SDK.

## User-Agent

`ishtaran-node/<version>` — fixed, no personal data.
