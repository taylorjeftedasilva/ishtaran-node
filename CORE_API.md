# Core API

Complete, literal coverage of the real API — 100 routes, 16 modules (see `SDK_FEATURE_MATRIX.md`
and `SDK_METHOD_MAP.md`). No invented endpoint, no admin-only/platform-only route exposed.

## Control Plane (always Member JWT)

`client.organizations`, `client.applications`, `client.environments`, `client.apiKeys`,
`client.members`, `client.assetNetworkCatalog`, `client.webhookEndpoints`, `client.webhookDeliveries`.

## Data Plane (API Key or Member JWT)

`client.accounts`, `client.transactions`, `client.deposits`, `client.ledger`, `client.settlements`,
`client.refunds`, `client.withdrawals`, `client.workflows`/`eventTypes`/`events`, `client.sandbox`.

## AccountHolders (isolated session, own auth)

`client.accountHolders` — the financial holder's global identity (`DEC-032`): `signUp`/`login`/
`me`/`claimInvitation`/`signUpAndClaimInvitation`. Its session token is never shared with
`client.auth` (Member) nor with the Organization's `X-Api-Key` on the same client instance — treat
it as a third, independent authentication context. See [README.md § Self-custody /
AccountHolders](README.md#what-this-sdk-does) for the identity model.

## Self-custody (`ExecutionCustody`)

`client.wallets` / `client.signingRequests` — wallet registration, deposit address allocation,
`SigningRequest` creation/submission. Covered with a full worked example in
[README.md § Self-custody](README.md#self-custody) rather than duplicated here — the interesting
part of this module is the local signing flow, not the HTTP resource shape.

## Example — full flow without Easy Mode

```typescript
const account = await client.accounts.create(organizationId, 'customer-123');
await client.accounts.authorizeApplication(account.accountId, applicationId);

const txn = await client.transactions.create(organizationId, applicationId, null, assetNetworkId, '100', [payer, recipient]);
const intent = await client.deposits.createPaymentIntent(organizationId, txn.transactionId, assetNetworkId, '100', undefined);
const fullIntent = await client.deposits.getPaymentIntent(intent.paymentIntentId);
// fullIntent.depositAddress -- real address to watch on-chain

const settlement = await client.settlements.executeSettlement(txn.transactionId);
```

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
