# Easy Mode vs. Core API

## Use Easy Mode quando...

- Quer integrar rápido: `client.receivePayment(...)`, `client.withdraw(...)`, `client.getBalance(...)`.
- Precisa esperar um resultado assíncrono com segurança: `client.waitForPayment(...)`,
  `client.withdrawals.waitFor(...)`, `client.transactions.waitFor(...)` — sempre com timeout.
- Só precisa verificar uma assinatura de webhook: `client.verifyWebhookSignature(...)`.

## Use Core API quando...

- Precisa de controle granular (`client.transactions.reserve(...)` vs. `client.settlements.executeSettlement(...)`).
- Precisa de um recurso que o Easy Mode não cobre (`client.workflows`, `client.sandbox`, etc. — 93
  operações reais, ver `SDK_FEATURE_MATRIX.md`).
- Quer paginar de verdade: `client.withdrawals.listAll(...)`/`client.ledger.listAllEntries(...)`
  (async generators lazy) em vez de uma única chamada.

## Equivalência concreta

| Easy Mode | Core equivalente |
|---|---|
| `client.receivePayment(...)` | `transactions.create()` + `deposits.createPaymentIntent()` + `deposits.getPaymentIntent()` |
| `client.withdraw(...)` | `withdrawals.createDestination()` + `withdrawals.request()` |
| `client.getBalance(...)` | `ledger.getBalance(...)` |

Easy Mode nunca esconde `withdrawalId`/`transactionId`/`paymentIntentId` reais. `withdraw()` sempre
devolve `estimatedNetworkFee`/`estimatedRecipientAmount`/`status` — nunca só sucesso/falha.
