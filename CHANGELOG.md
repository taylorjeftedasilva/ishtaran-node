# Changelog

Follows [SemVer](https://semver.org/). This is a **Development Preview** — 0.x versions may
still change before a stable 1.0.0.

## [Unreleased]

- Added `client.executionDestinations.register(organizationId, accountId, assetNetworkId,
  address)` (`POST /v1/organizations/{organizationId}/execution-destinations`) -- registers the
  real on-chain address a beneficiary `Account` receives funds at, for a given `AssetNetwork`.
  Required before a `Settlement` involving that Account can execute under SelfCustody (`DEC-037`):
  `settlements.executeSettlement` now resolves every beneficiary's (and the Platform Fee's)
  destination before building a `SigningRequest` and fails fast, before any signing/broadcast, if
  none is registered. First-registration-wins -- a second call for the same `accountId`+
  `assetNetworkId` is rejected, never silently overwritten. Also added
  `SettlementResponse.signingRequestId` -- populated once a `Settlement` moves to SelfCustody
  execution; fetch it with `client.signingRequests.get(signingRequestId)` to sign locally. Found
  and fixed while closing out the real on-chain execution path for the Mercatto Business Case
  (`examples/marketplace-mercatto/`) -- the backend's `ISettlementExecutionStrategy` split
  (`SelfCustodySettlementExecutionStrategy` vs. legacy `ManagedCustodySettlementExecutionStrategy`)
  was already implemented, but no SDK exposed the new `ExecutionDestination` resource or the
  `signingRequestId` needed to actually complete a real Settlement end to end. No breaking change
  -- both are additive.
- **Breaking (positional args):** `settlementsResource.executeSettlement(transactionId, idempotencyKey?)`
  is now `executeSettlement(transactionId, amount?, idempotencyKey?)` -- a new optional `amount`
  parameter was inserted before `idempotencyKey`. Any caller passing `idempotencyKey` positionally
  as the 2nd argument needs to move it to the 3rd. Enables Partial Settlement (`BL-STL-008`,
  activated 2026-08-26): omit `amount` to settle the full remaining reserved balance (unchanged
  default), or pass it to settle exactly that amount -- callable multiple times on the same
  Transaction until the remaining balance reaches zero, each call computing its own Platform Fee
  on its own gross slice. Found and fixed while building the Mercatto marketplace Business Case
  (`examples/marketplace-mercatto/`): the platform's own domain/Application layer already
  supported this per-call `Amount` since `DEC-019`, but the HTTP contract never exposed it
  (`ExecuteSettlementRequest` had only `idempotencyKey`) -- a real, deliberate MVP deferral
  (`BL-STL-008`, Pós-MVP) now activated by explicit product decision.
- Fixed a real bug in the platform's Ledger module, also found via the Mercatto Business Case:
  `BR-BAL-005` (Asset Network `MinAmount`/`MaxAmount`) was being enforced on every individual
  Ledger Entry of every `RecordEntryCommand` -- including Settlement's internal Fee/Split postings
  -- instead of only on the Gross Amount of a Reserve/Release operation, as `SPEC-005` always
  documented. A Settlement with a Platform Fee below `MinAmount` (e.g. 0.90 on a 100 Gross with a
  1.00 minimum, 0.9% fee) was rejected even though Settlement's own Gross-Amount-level range check
  already passed. No SDK-visible API change -- documented here because it directly affects which
  amounts a real `executeSettlement()` call can now succeed with.

## [0.1.2] — 2026-08-25

- Fixed a real bug, found while building example 14: `authResource.signUp(...)` never sent the
  `Idempotency-Key` header `POST /v1/auth/signup` requires — every real call failed with `400
  IDEMPOTENCY_KEY_REQUIRED`. Self-service onboarding via this SDK never actually worked before
  this fix. `signUp` now takes an optional 4th `idempotencyKey` argument, auto-generated when
  omitted, same convention as `organizationsResource.create`. No breaking change.
- Added `examples/14-marketplace-journey.ts`: a full marketplace payment, verified live against
  the real Sandbox (self-service signup, a self-custody execution wallet, a seller
  `AccountHolder`, a buyer Payment Intent, and a locally signed payout) -- connects several
  existing examples into one closed cycle.
- Fixed `examples/11-sandbox.ts`, which called `sandbox.simulateDepositConfirmation`/
  `simulateWithdrawalBroadcast` -- neither ever existed on `SandboxResource`, so the example never
  compiled. Rewritten against the real `faucet`/`simulateConfirmation`/`getTreasuryBalance`.
- `CORE_API.md` corrected: documents `accountHolders`/self-custody resources it omitted, notes
  that `accounts.authorizeApplication`/`freeze`/`unfreeze`/`close`/`revokeRelationship` reject an
  API Key and require a Member session (found live, undocumented until now), and that a
  Transaction reserves itself automatically once its deposit is confirmed -- no `reserve()` call
  needed or valid in that path.

## [0.1.1] — 2026-08-25

- `Environment.Sandbox` now resolves to the real public Sandbox (`https://sandbox-api.ishtaran.com`,
  the canonical domain live since 2026-08-25 — Cloud Run Domain Mapping) by default — no explicit
  `baseUrl` needed, though one always overrides it. Previously it required an explicit `baseUrl`
  and threw otherwise. `Environment.Production` is unchanged (still requires an explicit
  `baseUrl`). Backward compatible.
- Fixed: `SDK_VERSION` (sent as `ishtaran-node/<version>` on every request) was still hardcoded
  to the pre-release placeholder `1.0.0-SNAPSHOT`, misreporting the actual published version.
  Now `0.1.1`, matching `package.json`.

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
