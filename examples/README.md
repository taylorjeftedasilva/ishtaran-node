# Ishtaran TypeScript SDK -- Examples

14 numbered examples, real code (never pseudocode), verified with `tsc --noEmit` in this
module against the real SDK (`@ishtaran/sdk`, via `file:..`).

| # | File | Demonstrates |
|---|---|---|
| 01 | `01-auth.ts` | Minimal quickstart |
| 02 | `02-create-account.ts` | Create an Account (Core) |
| 03 | `03-receive-payment-easy.ts` | Receive a payment (Easy Mode) + `waitForPayment` |
| 04 | `04-create-transaction-core.ts` | Create a Transaction with participants (Core) |
| 05 | `05-payment-intent-core.ts` | Payment Intent + real `depositAddress` (Core) |
| 06 | `06-settlement.ts` | Settle a Transaction + summary (Core) |
| 07 | `07-withdrawal-quote.ts` | Quote a withdrawal, Network Fee always visible (Core) |
| 08 | `08-withdrawal.ts` | Execute a withdrawal (Easy Mode) + `waitFor` |
| 09 | `09-ledger.ts` | Balance + Ledger Entries with real pagination (async generator) |
| 10 | `10-webhook-verification.ts` | Signature verification -- **the only one 100% runnable without a real API** |
| 11 | `11-sandbox.ts` | Faucet + simulated confirmation (Sandbox) |
| 12 | `12-account-holder-invitation.ts` | AccountHolder invitation + signup-and-claim (DEC-032) |
| 13 | `13-self-custody-signing.ts` | Self-custody end to end: generates a local wallet, registers it, allocates an address, creates/signs/submits a `SigningRequest`, confirms the broadcast (SPEC-017-021) |
| 14 | `14-marketplace-journey.ts` | Full marketplace journey, verified live against the real Sandbox: self-service signup, self-custody execution wallet, seller `AccountHolder` via invitation, buyer Payment Intent, deposit + confirmation, Settlement, and the real payout signed locally -- connects examples 01/03/12/13 into one closed cycle |

## Running

```bash
npm install
export ISHTARAN_API_KEY=...
export ISHTARAN_ORGANIZATION_ID=...
# ... other variables per example, see the top of each file

npx tsx 01-auth.ts
```

`10-webhook-verification.ts` runs with no real environment variables at all:

```bash
npx tsx 10-webhook-verification.ts
```
