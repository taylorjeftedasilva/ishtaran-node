# Changelog

Follows [SemVer](https://semver.org/). Not yet published (npm).

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
