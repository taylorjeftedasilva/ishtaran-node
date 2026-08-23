# Easy Mode vs. Core API

## Use Easy Mode when...

- You want to integrate fast: `client.receivePayment(...)`, `client.withdraw(...)`, `client.getBalance(...)`.
- You need to safely wait for an asynchronous result: `client.waitForPayment(...)`,
  `client.withdrawals.waitFor(...)`, `client.transactions.waitFor(...)` — always with a timeout.
- You only need to verify a webhook signature: `client.verifyWebhookSignature(...)`.

## Use Core API when...

- You need granular control (`client.transactions.reserve(...)` vs. `client.settlements.executeSettlement(...)`).
- You need a resource that Easy Mode doesn't cover (`client.workflows`, `client.sandbox`, etc. — 93
  real operations, see `SDK_FEATURE_MATRIX.md`).
- You want real pagination: `client.withdrawals.listAll(...)`/`client.ledger.listAllEntries(...)`
  (lazy async generators) instead of a single call.

## Concrete equivalence

| Easy Mode | Core equivalent |
|---|---|
| `client.receivePayment(...)` | `transactions.create()` + `deposits.createPaymentIntent()` + `deposits.getPaymentIntent()` |
| `client.withdraw(...)` | `withdrawals.createDestination()` + `withdrawals.request()` |
| `client.getBalance(...)` | `ledger.getBalance(...)` |

Easy Mode never hides the real `withdrawalId`/`transactionId`/`paymentIntentId`. `withdraw()`
always returns `estimatedNetworkFee`/`estimatedRecipientAmount`/`status` — never just
success/failure.
