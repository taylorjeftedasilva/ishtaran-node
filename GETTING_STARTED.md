# Getting Started

## 1. Instale a dependência

```bash
npm install @ishtaran/sdk   # após publicação; hoje, ver README.md para consumo local via tarball
```

## 2. Construa o client

```typescript
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Local,
});
```

`Environment.Sandbox`/`Production` ainda não têm URL real conhecida — use `baseUrl` explícito
(ver [`CONFIGURATION.md`](CONFIGURATION.md)).

## 3. Consulte um saldo (Easy Mode)

```typescript
const balance = await client.getBalance(accountId, assetNetworkId);
console.log('Available:', balance.available); // string
```

## 4. Receba um pagamento (Easy Mode)

```typescript
const payment = await client.receivePayment(organizationId, applicationId, payerAccountId, recipientAccountId, assetNetworkId, '100');
console.log('Deposit address:', payment.depositAddress);

const finished = await client.waitForPayment(payment.transactionId, payment.paymentIntentId, 10 * 60_000, 5_000);
```

## 5. Saque com Network Fee visível (Easy Mode)

```typescript
const withdrawal = await client.withdraw(organizationId, accountId, assetNetworkId, '50', 'TDestinationAddressReal', undefined);
console.log(`Você recebe ${withdrawal.estimatedRecipientAmount} (taxa: ${withdrawal.estimatedNetworkFee})`);
```

## 6. Ou use o Core diretamente

```typescript
const account = await client.accounts.get(accountId);
const quote = await client.withdrawals.quote(organizationId, accountId, destinationId, assetNetworkId, '50');
```

## Próximos passos

- [`AUTHENTICATION.md`](AUTHENTICATION.md), [`EASY_MODE.md`](EASY_MODE.md), [`ERROR_HANDLING.md`](ERROR_HANDLING.md)
- [`examples/`](examples/) — 11 exemplos numerados
