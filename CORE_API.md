# Core API

Complete, literal coverage of the real API — 100 routes, 16 modules (see `SDK_FEATURE_MATRIX.md`
and `SDK_METHOD_MAP.md`). No invented endpoint, no admin-only/platform-only route exposed.

## Control Plane (always Member JWT)

`client.organizations`, `client.applications`, `client.environments`, `client.apiKeys`,
`client.members`, `client.assetNetworkCatalog`, `client.webhookEndpoints`, `client.webhookDeliveries`.

## Data Plane (API Key or Member JWT)

`client.accounts`, `client.transactions`, `client.deposits`, `client.ledger`, `client.settlements`,
`client.refunds`, `client.withdrawals`, `client.workflows`/`eventTypes`/`events`, `client.sandbox`.

**Except:** `accounts.authorizeApplication`/`freeze`/`unfreeze`/`close`/`revokeRelationship`
reject an API Key and require a Member session (verified live, not documented anywhere else --
`MemberPermissionPolicy.Require`, `AccountsEndpoints.cs`).

## AccountHolders (isolated session, own auth)

`client.accountHolders` — the financial holder's global identity (`DEC-032`): `signUp`/`login`/
`me`/`claimInvitation`/`signUpAndClaimInvitation`. Its session token is never shared with
`client.auth` (Member) nor with the Organization's `X-Api-Key` on the same client instance — treat
it as a third, independent authentication context. See [README.md § Self-custody /
AccountHolders](README.md#what-this-sdk-does) for the identity model.

## Self-custody (`ExecutionCustody`)

`client.wallets` / `client.signingRequests` — wallet registration, deposit address allocation,
`SigningRequest` creation/submission. `client.executionDestinations` — registers the real on-chain
address a beneficiary `Account` gets paid at for a given `AssetNetwork`; required before a
`Settlement` can execute under SelfCustody (`DEC-037`) — `settlements.executeSettlement` fails
fast, before any signing/broadcast, if a participant has none registered. Covered with a full
worked example in [README.md § Self-custody](README.md#self-custody) rather than duplicated here —
the interesting part of this module is the local signing flow, not the HTTP resource shape.

## Example — full flow without Easy Mode

```typescript
const account = await client.accounts.create(organizationId, 'customer-123');
// authorizeApplication requires the Member client (`memberClient`), never the API Key one --
// see the note above.
await memberClient.accounts.authorizeApplication(organizationId, account.accountId, applicationId);

const txn = await client.transactions.create(organizationId, applicationId, null, assetNetworkId, '100', [payer, recipient]);
const intent = await client.deposits.createPaymentIntent(organizationId, txn.transactionId, assetNetworkId, '100', undefined);
const fullIntent = await client.deposits.getPaymentIntent(intent.paymentIntentId);
// fullIntent.depositAddress -- real address to watch on-chain

// Once the deposit is confirmed, the Transaction reserves itself -- no explicit reserve() call
// needed or valid in this path (verified live -- calling it here throws BR-TXN-002).
const settlement = await client.settlements.executeSettlement(txn.transactionId);
```

See [`examples/14-marketplace-journey.ts`](examples/14-marketplace-journey.ts) for this same flow
run in full, including the Payment Intent → deposit → confirmation → self-custody payout signing
this snippet omits.

## Real anonymous objects

Several real POSTs return a minimal object (`{ accountId }`, `{ transactionId }`) instead of the
full resource — confirmed in the real handler source code, never assumed. Fetch the full
resource with the corresponding `get(...)` when you need every field.

## Real pagination (lazy iterators)

Only 2 endpoints have real pagination (`skip`/`take`): `withdrawals.list`/`.listAll` and
`ledger.listEntries`/`.listAllEntries`. The `.listAll*` variants are async generators — they
fetch the next page on demand, never loading everything at once:

```typescript
for await (const withdrawal of client.withdrawals.listAll(organizationId, {}, 20)) {
  console.log(withdrawal.withdrawalId);
}
```
