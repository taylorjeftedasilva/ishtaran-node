# Changelog

Follows [SemVer](https://semver.org/). This is a **Development Preview** — 0.x versions may
still change before a stable 1.0.0.

## [0.1.0] — 2026-08-23

First public release, published on npm (`npm install @ishtaran/sdk`). Builds on the
`1.0.0-SNAPSHOT` work below, plus:

### Added since `1.0.0-SNAPSHOT`

- Self-custody wallet generation and restoration (`wallet.generate`/`wallet.restore`,
  BIP39/BIP32/BIP44).
- Tron address derivation from the public account key only (`deriveTronAddress`).
- Local canonical-hash signing (reference `Signer`), documented as unsafe for Production —
  implement your own against a Vault/KMS/HSM for any real deployment.
- `client.wallets`/`client.signingRequests` — the real `ExecutionCustody` HTTP routes end to end.
- `client.accountHolders` — self-service for the financial holder's global identity.
- License: Apache License 2.0.

### Known, still pending

- The public Sandbox is not live yet.
- Production blockchain execution is not available yet.

## [1.0.0-SNAPSHOT] — 2026-08-17

Second implementation of the Ishtaran Official SDK Program — 100% functional parity with the
Java SDK (reference implementation).

### Added

- Central client (`IshtaranClient.create(...)`).
- Complete Core API — 16 modules, 93 real operations.
- Easy Mode — `receivePayment`/`getPayment`/`waitForPayment`, `withdraw`, `getBalance`,
  `verifyWebhookSignature`.
- `X-Api-Key` + Member JWT authentication.
- Complete `IshtaranError` hierarchy.
- Safe retry with backoff+jitter.
- Idempotency (body and header, depending on the endpoint).
- Real pagination via lazy async generators.
- Forward-compatible enums (`fromRaw`/`isUnknown`, `UNKNOWN` fallback).
- Money always as `string`, via `lossless-json` (never `Number`, never rounded).
- `verifyWebhookSignature`/`computeWebhookSignature` (HMAC-SHA256, constant time).
- Opt-in logging with central redaction.
- Packaging validated via `npm pack` + real consumption (ESM and CJS) by a sample project.

### Known, still pending

- `connectTimeoutMs` accepted but not enforced separately from `requestTimeoutMs` (see `CONFIGURATION.md`).
- Real npm publication — blocked on a pending licensing decision.
