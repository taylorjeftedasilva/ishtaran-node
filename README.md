# Ishtaran TypeScript/Node.js SDK

Official TypeScript/Node.js SDK for the [Ishtaran API](https://ishtaran.com) — a programmable
financial platform. Second implementation of the [Ishtaran Official SDK Program](../../SDK_CAPABILITY_SPEC.md)
(Java → **TypeScript** → Python → Go), 100% functional parity with the Java SDK (reference
implementation).

## Two layers, same backend

- **Easy Mode** — `client.receivePayment(...)`, `client.withdraw(...)`, `client.getBalance(...)`,
  `client.verifyWebhookSignature(...)`: fast composition, never duplicates business logic.
- **Core API** — `client.accounts`, `client.transactions`, `client.withdrawals`, etc.: granular
  access to the same 90 real API endpoints (see [`SDK_FEATURE_MATRIX.md`](../../SDK_FEATURE_MATRIX.md)).
- **AccountHolders** — `client.accountHolders`: self-service for the financial holder's global
  identity (`DEC-032`) — `signUp`/`login`/`me`/`claimInvitation`/`signUpAndClaimInvitation`.
  Isolated session: never shares a token with `client.auth` (Member) nor with the
  Organization's API Key within the same client instance.

## Installation

Not yet published on npm (licensing decision pending). To consume locally:

```bash
cd sdks/typescript
npm install && npm run build && npm pack
# in your project:
npm install /path/to/ishtaran-sdk-1.0.0-SNAPSHOT.tgz
```

Requires **Node.js 18+**. ESM and CJS supported (dual build).

## Quickstart

```typescript
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Local, // or Sandbox/Production with an explicit baseUrl
});

const balance = await client.getBalance(accountId, assetNetworkId);
console.log('Available:', balance.available); // exact string, never a number
```

See [`GETTING_STARTED.md`](GETTING_STARTED.md) and [`examples/`](examples/).

## Money is always a string

Every monetary field (`amount`, `estimatedNetworkFee`, `available`, etc.) is typed as `string` —
never `number`. The real API sends money as `number(double)` in JSON; the native `JSON.parse`
would already lose precision before the SDK could intervene, so all response parsing uses
`lossless-json`, preserving the exact text of every number. See
[`SDK_CAPABILITY_SPEC.md` §11.1](../../SDK_CAPABILITY_SPEC.md#111-dinheiro).

## Documentation

| Document | Content |
|---|---|
| [GETTING_STARTED.md](GETTING_STARTED.md) | First use |
| [AUTHENTICATION.md](AUTHENTICATION.md) | `X-Api-Key` vs. Member JWT |
| [EASY_MODE.md](EASY_MODE.md) | When to use Easy Mode vs. Core |
| [CORE_API.md](CORE_API.md) | Complete resource coverage |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | `IshtaranError` hierarchy |
| [IDEMPOTENCY.md](IDEMPOTENCY.md) | Automatic vs. explicit key |
| [RETRIES.md](RETRIES.md) | Retry policy |
| [WEBHOOKS.md](WEBHOOKS.md) | Signature verification |
| [CONFIGURATION.md](CONFIGURATION.md) | Client configuration |
| [SECURITY.md](SECURITY.md) | Secrets, TLS, redaction |
| [FEATURES.md](FEATURES.md) | Capability coverage |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

Every behavior is derived from the real API, never invented — see
[`SDK_CAPABILITY_SPEC.md`](../../SDK_CAPABILITY_SPEC.md).
