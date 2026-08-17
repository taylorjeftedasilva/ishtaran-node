# Core API

Cobertura completa e literal da API real — 83 rotas, 16 módulos (ver `SDK_FEATURE_MATRIX.md` e
`SDK_METHOD_MAP.md`). Nenhum endpoint inventado, nenhuma rota admin-only/platform-only exposta.

## Control Plane (sempre Member JWT)

`client.organizations`, `client.applications`, `client.environments`, `client.apiKeys`,
`client.members`, `client.assetNetworkCatalog`, `client.webhookEndpoints`, `client.webhookDeliveries`.

## Data Plane (API Key ou Member JWT)

`client.accounts`, `client.transactions`, `client.deposits`, `client.ledger`, `client.settlements`,
`client.refunds`, `client.withdrawals`, `client.workflows`/`eventTypes`/`events`, `client.sandbox`.

## Exemplo — fluxo completo sem Easy Mode

```typescript
const account = await client.accounts.create(organizationId, 'customer-123');
await client.accounts.authorizeApplication(account.accountId, applicationId);

const txn = await client.transactions.create(organizationId, applicationId, null, assetNetworkId, '100', [payer, recipient]);
const intent = await client.deposits.createPaymentIntent(organizationId, txn.transactionId, assetNetworkId, '100', undefined);
const fullIntent = await client.deposits.getPaymentIntent(intent.paymentIntentId);
// fullIntent.depositAddress -- endereço real para observar on-chain

const settlement = await client.settlements.executeSettlement(txn.transactionId);
```

## Objetos anônimos reais

Vários POSTs reais devolvem um objeto mínimo (`{ accountId }`, `{ transactionId }`) em vez do
recurso completo — confirmado no código-fonte dos handlers reais, nunca assumido. Busque o recurso
completo com o `get(...)` correspondente quando precisar de todos os campos.

## Paginação real (iteradores lazy)

Só 2 endpoints têm paginação real (`skip`/`take`): `withdrawals.list`/`.listAll` e
`ledger.listEntries`/`.listAllEntries`. Os `.listAll*` são async generators — buscam a próxima
página sob demanda, nunca carregam tudo de uma vez:

```typescript
for await (const withdrawal of client.withdrawals.listAll(organizationId, {}, 20)) {
  console.log(withdrawal.withdrawalId);
}
```
