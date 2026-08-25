# Ishtaran TypeScript/Node.js SDK

Official TypeScript/Node.js SDK for the [Ishtaran API](https://ishtaran.com) — a programmable
financial platform (virtual accounts, conditional release workflows, settlements, and
self-custody blockchain execution).

**Public Sandbox available · Production not yet available**

## Project status

Ishtaran's public Sandbox is live and has been validated end to end (signup → payment →
self-custody signing → simulated broadcast → reconciliation), with all four official SDKs
published on their real package registries.

- **Public Sandbox:** available now, simulated blockchain execution, no real funds involved.
- **Production blockchain execution is not available yet** — no real blockchain connector is
  registered; see [Production status](#production-status) below.

See [Sandbox](#sandbox) below for how to point this SDK at it.

## What this SDK does

Second implementation of the Ishtaran Official SDK Program
(Java → **TypeScript** → Python → Go), 100% functional parity with the Java SDK (reference
implementation). See also: [Java](https://github.com/taylorjeftedasilva/ishtaran-java) ·
[Python](https://github.com/taylorjeftedasilva/ishtaran-python) ·
[Go](https://github.com/taylorjeftedasilva/ishtaran-go).

Two layers over the same backend:

- **Easy Mode** — `client.receivePayment(...)`, `client.withdraw(...)`, `client.getBalance(...)`,
  `client.verifyWebhookSignature(...)`: fast composition, never duplicates business logic.
- **Core API** — `client.accounts`, `client.transactions`, `client.withdrawals`, etc.: granular
  access to the same real API endpoints, with nothing invented beyond what the real API exposes.
- **AccountHolders** — `client.accountHolders`: self-service for the financial holder's global
  identity — `signUp`/`login`/`me`/`claimInvitation`/`signUpAndClaimInvitation`.
  Isolated session: never shares a token with `client.auth` (Member) nor with the
  Organization's API Key within the same client instance.

## Self-custody

**Your keys stay with you. The SDK signs locally. Ishtaran verifies and relays. The blockchain
executes.**

- Wallet generation/restoration happens client-side, inside this SDK.
- Private keys, seeds, and mnemonic phrases never need to be sent to Ishtaran.
- Signing happens in your own environment/process.
- The SDK validates the signing context before signing.
- Ishtaran only ever receives public wallet/derivation material and signed execution payloads.
- Ishtaran verifies each signature, relays the transaction, and monitors and reconciles
  execution.
- Sandbox and Production use the same signing semantics from the SDK's perspective — environment
  behavior (simulated vs. real execution) is resolved by the Ishtaran API/infrastructure, never
  by a special cryptographic code path inside the SDK.

The `wallet` module generates or restores a BIP39/BIP32/BIP44 wallet locally and signs a leg's
canonical hash. **The private key, seed, and mnemonic never leave this code and are never sent to
Ishtaran.**

```typescript
import { wallet, DerivationScheme } from '@ishtaran/sdk';

// Wallet generated locally -- the mnemonic/private key never leave this process.
const generated = wallet.generate(); // 24-word mnemonic, back it up now -- it is shown only once

// Only the public key is registered with Ishtaran.
const registered = await client.wallets.register(
  applicationId, networkId, DerivationScheme.TRON_BIP44_HARDENED_ACCOUNT,
  generated.wallet.accountExtendedPublicKey, idempotencyKey,
);

// Signing also happens locally, against a hash Ishtaran computed and verifies.
const signature = generated.signer.sign(0, canonicalHash);
```

`generated.signer` (the reference `Signer` returned by `wallet.generate()`) keeps the account
private key in plain process memory — **documented as unsafe for Production.** Implement the
`Signer` interface yourself against a Vault/KMS/HSM/OS keychain for any real deployment; the
interface never mandates a specific backend.

See [`examples/13-self-custody-signing.ts`](examples/13-self-custody-signing.ts) for the full
runnable flow (register a wallet, allocate a deposit address, create a `SigningRequest`, sign and
submit every leg), and [Self-Custody](https://ishtaran.com/docs/concepts/self-custody) for the
complete protocol detail.

## Current capabilities

- Organizations / Applications / Environments
- API Keys
- Accounts / AccountHolders
- Payment Intents / Deposits
- Ledger
- Transactions
- Workflows / Rules
- Settlements / Splits / Fees / Refunds
- Withdrawals
- Webhooks
- Self-custody: wallet generation/restore, public address derivation, `SigningRequest`
  validation, local signing, signed transaction submission

This is deliberately not a full reference — see [FEATURES.md](FEATURES.md) and the
[API Reference](https://ishtaran.com/docs/api/ishtaran-api) for details.

## Installation

```bash
npm install @ishtaran/sdk
```

`0.1.0` is a real, published **Development Preview** release on npm -- verified live with a real
`npm install` from a clean environment. See [CHANGELOG.md](CHANGELOG.md) for what's in it.

Or for local development:

```bash
npm install && npm run build && npm pack
# in your project:
npm install /path/to/ishtaran-sdk-0.1.0.tgz
```

Requires **Node.js 18+**. ESM and CJS supported (dual build).

## Quick example

```typescript
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Sandbox, // resolves to the real public Sandbox; Local/Production also available
});

const balance = await client.getBalance(accountId, assetNetworkId);
console.log('Available:', balance.available); // exact string, never a number
```

See [`GETTING_STARTED.md`](GETTING_STARTED.md) and [`examples/`](examples/).

## Sandbox

The public Sandbox is live at `https://sandbox-api.ishtaran.com`
(`Environment.Sandbox` resolves to it automatically -- no `baseUrl` needed, though an explicit
`baseUrl` always overrides it). The raw Cloud Run URL from the initial 2026-08-24 deploy still
works, but is no longer advertised -- use the canonical domain above.

- Sandbox uses simulated blockchain execution — no real funds are involved.
- The self-custody signing protocol described above is fully exercised in Sandbox: signatures
  are not skipped just because execution is simulated.
- Rate limits and idempotency behave the same as Production; only the blockchain broadcast is
  simulated.

## Production status

**Production blockchain execution is not available yet.**

Additional networks/assets may be mentioned elsewhere in this project as roadmap items — none of
them should be read as available in Production today.

## Security

- Never commit API keys.
- Never transmit mnemonic phrases, seeds, or private keys to Ishtaran — there is no legitimate
  reason for any Ishtaran API call to ever need them.
- Use a production-grade KeyStore/Signer implementation for real deployments.
- The reference in-memory `Signer` returned by `wallet.generate()` is an example, not a
  production secret-storage solution.
- Verify the expected destination, asset, amount, and signing context before signing.
- Treat any integration, tool, or request asking you to upload private key material as invalid.

See [SECURITY.md](SECURITY.md) for more detail.

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

Every behavior is derived from the real API, never invented — see the
[Documentation](https://ishtaran.com/docs/intro) and [API Reference](https://ishtaran.com/docs/api/ishtaran-api).

## Money is always a string

Every monetary field (`amount`, `estimatedNetworkFee`, `available`, etc.) is typed as `string` —
never `number`. The real API sends money as `number(double)` in JSON; the native `JSON.parse`
would already lose precision before the SDK could intervene, so all response parsing uses
`lossless-json`, preserving the exact text of every number. See the
[API Reference](https://ishtaran.com/docs/api/ishtaran-api) for the real JSON shape of every
monetary field.

## Package distribution roadmap

`0.1.0` (Development Preview) is published on npm — see [Installation](#installation). Future
releases follow the same path: a reviewed, tested commit gets a new semver tag, and npm Trusted
Publishing (OIDC, no long-lived token) publishes it automatically.

## License

This SDK is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
